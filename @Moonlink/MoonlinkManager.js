var { EventEmitter } = require('events')
var WebSocket = require('ws')
var utils = require('../@Rest/MoonlinkUtils.js')
var Nodes = require('./MoonlinkNodes.js')
var manager;
const db = utils.db
const { MoonlinkTrack } = require('../@Rest/MoonlinkTrack.js')
const Spotify = require('../@sources/Spotify.js')
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
    this.spotify = new Spotify(this, options)
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
        twitter: 'twitter',
        spotify: 'spotify'
      }
      if(this.spotify.check(query)) { 
     
        return resolve(await this.spotify.resolve(query))
      }
      if (query && !query.startsWith('http://') && !query.startsWith('https://')) {

        if (source && !sources[source]) {
          this.emit('debug', "[ Moonlink/Manager]: no default found, changing to custom source")
          options = `${source}:${query}`
        } else {
          options = sources[source] || `ytsearch:${query}`
        }
      }
      if(source == "spotify") {
        return this.spotify.fetch(query)
      }
      let params = new URLSearchParams({ identifier: options })
      let res = await this.request(this.nodes.idealNode().node, 'loadtracks', params)
      this.emit('debug', '[ MoonLink.Js ]: searching songs')
      if (res.loadType === 'LOAD_FAILED' || res.loadType === 'NO_MATCHES') {
        this.emit('debug', '[ @Moonlink/Manager ]: not found or there was an error loading the track')
        return resolve(res)
        
      } else {
        const tracks = res.tracks.map(x => new MoonlinkTrack(x));
        if (res.loadType === 'PLAYLIST_LOADED') {
          res.playlistInfo.duration = tracks.reduce((acc, cur) => acc + cur.duration, 0);
        }
        return resolve({
          ...res
          , tracks
        })
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

}
module.exports = { MoonlinkManager }