var { EventEmitter } = require('events')
var WebSocket = require('ws')
var utils = require('../@Rest/MoonlinkUtils.js')
var Nodes = require('./MoonlinkNodes.js')
var manager;
class MoonlinkManager extends EventEmitter {
  #reconnectAtattempts = 0;
  #retryAmount = 5;
  #retryTime = 300000;
  #TokenSpotify = 'anonymous';
  #request = utils.request;
  #on = false
  #ws;
  #options;
  #sPayload;
  #nodes;
  constructor(lavalinks, options, sPayload) {

    super();
    if (!lavalinks) throw new Error('[ Moonlink.js ]: Options is empty')
    if (lavalinks && !Array.isArray(lavalinks)) throw new Error('[ Moonlink.js ]: Option "nodes" must be in an array.')
    if (lavalinks.length === 0) throw new Error('[ Moonlink.js ]: Parament of "nodes" must contain an object')
    if (typeof options.shard !== "number" && typeof options.shard !== 'undefined') throw new TypeError('[ Moonlink.js ]: Option "shards" must be in number. ')
    if (typeof options.clientName !== 'undefined' && typeof options.clientName !== 'string') throw new TypeError('[ Moonlink.js ]: The "clientname" option must be in string.')
    if (typeof sPayload !== 'function') throw new TypeError('[ MoonLink ]: The "send" option must be a function')
    if (sPayload) utils.esdw(sPayload)
    this.#sPayload = sPayload;
    this.#nodes = lavalinks;
    this.#options = options;
    this.version = require('./../package.json').version
    this.nodes;
    this.sendWs
    manager = this
  }
  init(clientId) {
    if (!clientId) throw new TypeError('[ MoonLink ]: "clientId" option is required.')
    this.nodes = new Nodes(this, this.#nodes, this.#options, this.#sPayload, clientId)
    this.nodes.init()


    this.sendWs = (json) => {
      return this.nodes.sendWs(json)
    }
    this.clientId = clientId

  }

  updateVoiceState(packet) {
    var map = utils.map
    if (packet.t == 'VOICE_SERVER_UPDATE') {
      let voiceServer = {}
      voiceServer[packet.d.guild_id] = {
        event: packet.d
      }
      map.set('voiceServer', voiceServer)
      return MoonlinkManager.#attemptConnection(manager, packet.d.guild_id)
    }
    if (packet.t == 'VOICE_STATE_UPDATE') {
      if (packet.d.user_id !== manager.clientId) return;
      if (packet.d.channel_id) {
        let voiceStates = {}
        voiceStates[packet.d.guild_id] = packet.d
        map.set('voiceStates', voiceStates)
        return MoonlinkManager.#attemptConnection(manager, packet.d.guild_id)
      }
    }
  }
  request(node, endpoint, params) {
    let version = this.nodes.get(node).version.replace(/\./g, '')

    return utils.makeRequest(`http${node.secure ? `s` : ``}://${node.host}${node.port ? `:${node.port}` : ``}/${version >= 370 ? version >= 400 ? "v4/" : "v3/" : ""}${endpoint}?${params}`, 'GET', {
      headers: {
        Authorization: node.password
      }
    })

  }
  async search(...options) {
    return new Promise(async (resolve) => {

      if (!options) throw new Error('[ MoonLink.Js ]: the search option has to be in string format or in an array')

      let [query, source] = options
      if (source && typeof source !== 'string') throw new Error('[ moonlink.js ]: the source option has to be in string format')
      if (typeof query !== 'string' && typeof query !== 'object') throw new Error('[ moonlink.js ]: (search) the search option has to be in string or array format')
      if (typeof query === 'object') {
        query.source ? source = query.source : undefined
        query.query ? query = query.query : undefined
      }
      let sources = {
        youtube: 'ytsearch',
        youtubemusic: 'ytmsearch',
        soundcloud: 'scsearch',
        twitter: 'twitter'
      }
      let db = utils.db
      var spotifyApi = 'https://api.spotify.com/v1/'
      let { MoonTrack } = require('../@Rest/MoonlinkTrack.js')
      if (query && !query.startsWith('http://') && !query.startsWith('https://')) {

        if (source && !sources[source]) {
          this.emit('debug', "[ Moonlink/Manager]: no default found, changing to custom source")
          options = `${source}:${query}`
        } else {
          options = sources[source] || `ytsearch:${query}`
        }
      }

      if (query && /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|artist|episode|show|album)[/:]([A-Za-z0-9]+)/.test(query)) {
        options = query
        let track = /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|artist|episode|show|album)[/:]([A-Za-z0-9]+)/.exec(options)
        let url = '';
        switch (track[1]) {
          case 'track':
            url = spotifyApi + `tracks/${track[2]}`
            break;
          case 'album':
            url = spotifyApi + `albums/${track[2]}`
            break;
          case 'show':
            url = spotifyApi + `shows/${track[2]}`
            break;
          case 'episodes':
            url = spotifyApi + `episodes/${track[2]}`
            break;
          case 'playlist':
            url = spotifyApi + `playlists/${track[2]}?market=ES`
            break;
          default:
            return resolve({ loadType: 'NO_MATCHES', playlistInfo: {}, tracks: [] })
        }
        let req = await this.#spotifyRequest(url)

        if (track[1] === 'track') {
          if (req.error?.status == 400) return resolve({ loadType: 'NO_MATCHES', playlistInfo: {}, tracks: [] })
          let pes = await this.search(`${req.name} ${req.artists[0].name}`)
          if (pes.loadType != 'SEARCH_RESULT') return pes
          return resolve({
            loadType: pes.loadType,
            playlistInfo: pes.playlistInfo,
            tracks: [{ ...pes.tracks[0], title: req.name, author: req.artists.map(artist => artist.name).join(', '), thumbnail: req.album.images[0].url, length: req.duration_ms, url: req.external_urls.spotify, source: 'spotify' }]
          })
        }
        if (track[1] == 'episode') {

          if (req.error?.status == 400) return resolve({ loadType: 'NO_MATCHES', playlistInfo: {}, tracks: [] })
          let pes = await this.search(`${req.name} ${req.publisher}`)
          if (pes.loadType != 'SEARCH_RESULT') return resolve(pes)
          return resolve({
            loadType: pes.loadType,
            playlistInfo: pes.playlistInfo,
            tracks: [{ ...pes.tracks[0], title: req.name, author: null, thumbnail: req.images[0].url, length: req.duration_ms, url: req.external_urls.spotify, source: 'spotify' }]
          })
        }
        if (track[1] == 'playlist' || track[1] == 'album') {

          if (req.error?.status == 400) return { loadType: 'NO_MATCHES', playlistInfo: {}, tracks: [] }
          if (req.error) return resolve({ loadType: 'LOAD_FAILED', playlistInfo: {}, tracks: [], exception: { message: req.error.message, severity: 'UNKNOWN' } })


          let res = { loadType: 'PLAYLIST_LOADED', playlistInfo: { selectedTrack: -1, name: req.name }, tracks: [] }
          let i = 0;
          req.tracks.items.forEach(async (x, y) => {
            let tracks
            if (track[1] === 'playlist') tracks = await this.search(`${x.track.name} ${x.track.artists[0].name}`)
            else tracks = await this.search(`${x.name} ${x.publisher}`)

            if (tracks.loadType !== 'SEARCH_RESULT') {

              if (y === x.tracks.items.length) return resolve(tracks)

              return;

            }
            if (track[1] == 'playlist') tracks = { ...tracks.tracks[0], position: y, thumbnail: req.images[0].url, title: x.track.name, author: x.track.artists.map(artist => artist.name).join(', '), length: x.track.duration_ms, url: x.track.external_urls.spotify, source: 'spotify' }
            else tracks = { ...tracks.tracks[0], position: i, thumbnail: req.images[0].url, title: x.name, author: x.artists.map(artist => artist.name).join(', '), length: x.duration_ms, url: x.external_urls.spotify, source: 'spotify' }

            i++
            res.tracks.push(tracks)


            if (res.tracks.length === req.tracks.items.length) {

              res.tracks.sort((a, b) => a.position - b.position)
              i = 0

              return resolve(res)

            }
          })
        }
        if (track[1] == 'show') {

          if (req.error?.status == 400) return { loadType: 'NO_MATCHES', playlistInfo: {}, tracks: [] }
          if (req.error) return resolve({ loadType: 'LOAD_FAILED', playlistInfo: {}, tracks: [], exception: { message: req.error.message, severity: 'UNKNOWN' } })


          let res = { loadType: 'PLAYLIST_LOADED', playlistInfo: { selectedTrack: -1, name: req.name }, tracks: [] }
          let i = 0;
          req.tracks.items.forEach(async (x, y) => {
            let tracks = await this.search(`${x.name} ${x.publisher}`)

            if (tracks.loadType !== 'SEARCH_RESULT') {

              if (y === x.episodes.items.length) return resolve(tracks)

              return;

            }
            if (track[1] == 'playlist') tracks = { ...tracks.tracks[0], position: i, thumbnail: req.images[0].url, title: x.name, author: req.publisher, length: x.duration_ms, url: x.external_urls.spotify, source: 'spotify' }

            i++
            res.tracks.push(tracks)


            if (res.tracks.length === req.episodes.items.length) {

              res.tracks.sort((a, b) => a.position - b.position)
              i = 0

              return resolve(res)

            }
          })
        }
      } else {

        let params = new URLSearchParams({ identifier: options })
        let res = await this.request(this.nodes.idealNode().node, 'loadtracks', params)
        this.emit('debug', '[ MoonLink.Js ]: searching songs')
        if (res.loadType === 'LOAD_FAILED' || res.loadType === 'NO_MATCHES') {
          return resolve(res)
        } else {
          const tracks = res.tracks.map(x => new MoonTrack(x));
          if (res.loadType === 'PLAYLIST_LOADED') {
            res.playlistInfo.duration = tracks.reduce((acc, cur) => acc + cur.duration, 0);
          }
          return resolve({
            ...res
            , tracks
          })
        }
      }
    })
  }


  get players() {
    let map = utils.map
    let { MoonPlayer } = require('../@Moonlink/MoonlinkPlayer.js')
    let get = function(guild) {
      if (typeof guild !== 'number' && typeof guild !== 'string') {
        throw new TypeError('[ MOONLINK ] guild id support only numbers in string!')
      }
      const { MoonPlayer } = require('../@Moonlink/MoonlinkPlayer.js')
      return (new MoonPlayer(map.get('players')[guild], manager))
    }
    let create = function(t) {
      if (typeof t.guildId !== 'string' && typeof t.guildId !== 'number') {
        throw new TypeError('[ MOONLINK ]: guild id support only numbers in string!')
      }
      if (typeof t.voiceChannel !== 'string' && typeof t.guildId !== 'number') {
        throw new TypeError('[ MOONLINK ]: voice channel id support only numbers in string!')
      }
      if (typeof t.textChannel !== 'string' && typeof t.guildId !== 'number') {
        throw new TypeError('[ MOONLINK ]: text channel id support only numbers in string!')
      }

      let players = map.get('players') || {}
      if (!players[t.guildId]) {
        players[t.guildId] = {
          guildId: t.guildId
          , voiceChannel: String(t.voiceChannel)
          , textChannel: String(t.textChannel)
          , playing: false
          , paused: false
          , loop: false
          , connected: false
        }
        map.set('players', players)

      }
      let { MoonPlayer } = require('../@Moonlink/MoonlinkPlayer.js')
      return (new MoonPlayer(players[t.guildId], manager))
    }
    let all = function() {
      let players = map.get('players') || null
      if (!players) {
        return null
      } else {
        return players
      }
    }
    let has = function(guild) {
      let player = map.get('players') || []
      if (typeof guild !== 'string' && isNaN(guild)) {
        throw new TypeError(`[ MoonLinkJs ]: ${guild} a number string was expected`)
      }
      if (player[guild]) player = true
      else player = false
      return player
    }
    function edit(info) {
      let player = map.get('players') || []
      if (!info) {
        throw new TypeError(`[ MoonlinkJs ]: enter a term to edit your player.`)
      }
      if (!player[info.guildId]) { throw new TypeError(`[ MoonLinkJs ]: cannot edit a player on guild ${info.guildId}.`) }
      if (typeof info.guildId !== 'number' && typeof info.guildId !== 'string') {
        throw new TypeError('[ MOONLINK ]: guild id support only numbers in string!')
      }
      if (typeof info.voiceChannel !== 'number' && typeof info.voiceChannel !== 'string') {
        throw new TypeError('[ MOONLINK ]: voice channel id support only numbers in string!')
      }
      if (typeof info.textChannel !== 'number' && typeof info.textChannel !== 'string') {
        throw new TypeError('[ MOONLINK ]: text channel id support only numbers in string!')
      }
      player[info.guildId] = {
        guildId: info.guildId
        , voiceChannel: info.voiceChannel
        , textChannel: info.textChannel
        , playing: false
        , paused: false
        , loop: false
      }
      map.set('players', player)
      return (new MoonPlayer(player[info.guildId], manager))

    }
    return {
      get
      , create
      , all
      , has
      , edit

    }
  }
  //---------------------//


  static #attemptConnection(Manager, guildId) {
    let map = utils.map
    let voiceServer = map.get('voiceServer') || {}
    let voiceStates = map.get('voiceStates') || {}
    let players = map.get('players') || {}
    if (!players[guildId]) return false
    if (!voiceServer[guildId]) return false
    Manager.emit('debug', '[ @Moonlink.js ]: sending voiceUpdate to lavalink (' + guildId + ')')
    Manager.nodes.sendWs({
      op: 'voiceUpdate'
      , sessionId: voiceStates[guildId].session_id
      , guildId: voiceServer[guildId].event.guild_id
      , event: voiceServer[guildId].event
    })
    return true

  }

  async #spotifyRequest(url) {
    let req = await utils.makeRequest(url, 'GET', { headers: { Authorization: ` Bearer ${this.#TokenSpotify}` } })
    if (req.error?.status == 401) {
      await utils.makeRequest('https://open.spotify.com/get_access_token', 'GET', {
        headers: {}
      }).then(async (data) => {

        this.#TokenSpotify = data.accessToken
        let r = await this.#spotifyRequest(url)

        req = r

      })
    }
    return req
  }
}
module.exports = { MoonlinkManager }