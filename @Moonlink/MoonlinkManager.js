var { EventEmitter } = require('events')
var WebSocket = require('ws')

//-- -- -- --- ---- --- -- -- --//
const { MoonlinkTrack } = require('../@Rest/MoonlinkTrack.js')
const { MoonlinkNodes } = require('./MoonlinkNodes.js')
const MoonlinkDB = require('../@Rest/MoonlinkDatabase.js')
//-- -- -- --- ---- --- -- -- --//

const Spotify = require('../@sources/Spotify.js')
class MoonlinkManager extends EventEmitter {
  #ws;
  #options;
  #sPayload; 
  #db = new MoonlinkDB()
  #map = new Map();
  constructor(lavalinks, options, sPayload) {

    super();
    if (!lavalinks) throw new Error('[ @Moonlink/Manager ]: Options is empty')
    if (lavalinks && !Array.isArray(lavalinks)) throw new Error('[ @Moonlink/Manager ]: Option "nodes" must be in an array.')
    if (lavalinks.length === 0) throw new Error('[ @Moonlink/Manager ]: Parament of "nodes" must contain an object')
    if (typeof options.shard !== "number" && typeof options.shard !== 'undefined') throw new TypeError('[ @Moonlink/Manager ]: Option "shards" must be in number. ')
    if (typeof options.clientName !== 'undefined' && typeof options.clientName !== 'string') throw new TypeError('[ @Moonlink/Manager ]: The "clientName" option must be in string.')
    if (typeof sPayload !== 'function') throw new TypeError('[ @Moonlink/Manager ]: The "send" option must be a function')
    this._nodes = lavalinks;
    this._sPayload = sPayload;
    this.options = options;
    this.version = require('./../package.json').version
    this.nodes = new Map();
    this.sendWs;
    this.spotify = new Spotify(this, options)
  }
  init(clientId) {
    if (!clientId) throw new TypeError('[ @Moonlink/Manager ]: "clientId" option is required.')
    this.clientId = clientId
    this._nodes.forEach(node => this.addNodes(node))
  }
  addNodes(node_object) {
    const node = new MoonlinkNodes(this, node_object, this.#map)
    if(node_object.identifier) {
      this.nodes.set(node_object.identifier, node)
    } else {
      this.nodes.set(node_object.host, node)
    }
    node.init();
    this.emit('debug', '[ @Moonlink/Manager ]: package global initialization process started')
    return node;
  }
  get leastUsedNodes() {
    return [...this.nodes.values()]
      .filter((node) => node.isConnected)
      .sort((a, b) => b.calls - a.calls)[0];
  }
  packetUpdate(packet) {
    if (packet.t == 'VOICE_SERVER_UPDATE') {
      let voiceServer = {}
      voiceServer[packet.d.guild_id] = {
        event: packet.d
      }
      this.#map.set('voiceServer', voiceServer)
      return MoonlinkManager.#attemptConnection(this, packet.d.guild_id, this.#map)
   
    }
    if (packet.t == 'VOICE_STATE_UPDATE') {
      if (packet.d.user_id !== this.clientId) return;
      if (packet.d.channel_id) {
        let voiceStates = {}
        voiceStates[packet.d.guild_id] = packet.d
        this.#map.set('voiceStates', voiceStates)
        return MoonlinkManager.#attemptConnection(this, packet.d.guild_id, this.#map)
   
      }
    }
  }
  
  async search(...options) {
    return new Promise(async (resolve) => {
      if (!options) throw new Error('[ @Moonlink/Manager ]: the search option has to be in string format or in an array')
      let [query, source] = options
      if (source && typeof source !== 'string') throw new Error('[ @Moonlink/Manager ]: the source option has to be in string format')
      if (typeof query !== 'string' && typeof query !== 'object') throw new Error('[ @Moonlink/Manager ]: (search) the search option has to be in string or array format')
      if (typeof query === 'object') {
        query.source ? source = query.source : undefined
        query.query ? query = query.query : undefined
      }
      let sources = {
        youtube: 'ytsearch',
        youtubemusic: 'ytmsearch',
        soundcloud: 'scsearch',
        spotify: 'spotify'
      }
      if (this.spotify.check(query)) {
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
      if (source == "spotify") {
        return resolve(this.spotify.fetch(query))
      }
      let params = new URLSearchParams({ identifier: options })
      let res = await this.leastUsedNodes.request('loadtracks', params)
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

//modify later
  get players() {
var { MoonPlayer } = require('../@Moonlink/MoonlinkPlayer.js')
    let map = this.#map;
    let get = function(guild) {

      if (typeof guild !== 'number' && typeof guild !== 'string') {
        throw new TypeError('[ @Moonlink/Manager ] guild id support only numbers in string!')
      }
      return (new MoonPlayer(map.get('players')[guild], this, map))
    }
    let create = function(t) {
      if (typeof t.guildId !== 'string' && typeof t.guildId !== 'number') {
        throw new TypeError('[ @Moonlink/Manager ]: guild id support only numbers in string!')
      }
      if (typeof t.voiceChannel !== 'string' && typeof t.guildId !== 'number') {
        throw new TypeError('[ @Moonlink/Manager ]: voice channel id support only numbers in string!')
      }
      if (typeof t.textChannel !== 'string' && typeof t.guildId !== 'number') {
        throw new TypeError('[ @Moonlink/Manager ]: text channel id support only numbers in string!')
      }
      if(typeof t.autoPlay !== 'undefined' && typeof t.autoPlay !== 'boolean') {
        throw new Error('[ @Moonlink/Manager ]: auto play option has to be in boolean format')
      }
      let players = map.get('players') || {}
      let node = this.leastUsedNodes;
      if (!players[t.guildId]) {
        players[t.guildId] = {
          node,
          guildId: t.guildId
          , voiceChannel: String(t.voiceChannel)
          , textChannel: String(t.textChannel)
          , playing: false
          , paused: false
          , loop: false
          , connected: false
          , autoPlay: t.autoPlay || false
        }
        map.set('players', players)
        this.emit('playerCreate', t)
}
      return (new MoonPlayer(players[t.guildId], this, map))
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
        throw new TypeError(`[ @Moonlink/Manager ]: ${guild} a number string was expected`)
      }
      if (player[guild]) player = true
      else player = false
      return player
    }
    function edit(info) {
      let player = map.get('players') || {}
      if (!info) {
        throw new TypeError(`[ @Moonlink/Manager ]: enter a term to edit your player.`)
      }
      if (!player[info.guildId]) { throw new TypeError(`[ @Moonlink/Manager ]: cannot edit a player on guild ${info.guildId}.`) }
      if (typeof info.guildId !== 'number' && typeof info.guildId !== 'string') {
        throw new TypeError('[ @Moonlink/Manager ]: guild id support only numbers in string!')
      }
      if (typeof info.voiceChannel !== 'number' && typeof info.voiceChannel !== 'string') {
        throw new TypeError('[ @Moonlink/Manager ]: voice channel id support only numbers in string!')
      }
      if (typeof info.textChannel !== 'number' && typeof info.textChannel !== 'string') {
        throw new TypeError('[ @Moonlink/Manager ]: text channel id support only numbers in string!')
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
      return (new MoonPlayer(player[info.guildId], this, map))

    }
    return {
      get: get.bind(this)
      , create: create.bind(this)
      , all: all.bind(this)
      , has: has.bind(this)
      , edit: edit.bind(this)
    }
  }
  //---------------------//


  static #attemptConnection(Manager, guildId, map) {
    let voiceServer = map.get('voiceServer') || {}
    let voiceStates = map.get('voiceStates') || {}
    let players = map.get('players') || {}
    if (!players[guildId]) return false
    if (!voiceServer[guildId]) return false
    Manager.emit('debug', `[ @Moonlink/Manager ]: sending to lavalink, player data from server (${guildId})`)
    Manager.leastUsedNodes.sendWs({
      op: 'voiceUpdate'
      , sessionId: voiceStates[guildId].session_id
      , guildId: voiceServer[guildId].event.guild_id
      , event: voiceServer[guildId].event
    })
    return true
  }
}
module.exports = { MoonlinkManager }