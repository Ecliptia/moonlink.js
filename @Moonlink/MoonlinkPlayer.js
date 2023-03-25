"use strict"; 
let { MoonlinkQueue } = require('../@Rest/MoonlinkQueue.js')
const MoonlinkDB = require('../@Rest/MoonlinkDatabase.js') 
const db = new MoonlinkDB();
var map;
class MoonPlayer {
  #sendWs;
  #manager;
  #node;
  #infos;
  constructor(infos, manager, manager_map) {
    this.#node = manager.leastUsedNodes
    this.#sendWs = this.#node.sendWs
    this.#manager = manager
    this.sPayload = manager._sPayload;
    this.#infos = infos
    this.guildId = this.#infos.guildId
    this.textChannel = this.#infos.textChannel
    this.voiceChannel = this.#infos.voiceChannel
    this.playing = this.#infos.playing || null
    this.connected = this.#infos.connected || null
    this.paused = this.#infos.paused || null
    this.loop = this.#infos.loop || null
    this.autoPlay = this.#infos.autoPlay || false
   this.volume = this.#infos.volume || 80
    this.queue = new MoonlinkQueue(manager, { guildId: infos.guildId })
    let current_map = manager_map.get(`current`) || {}
    this.current = current_map[this.#infos.guildId] || {}
    map = manager_map; 
  }
  connect(options) {
    if (!options) options = { setDeaf: false, setMute: false }
    let setDeaf = options.setDeaf || null
    let setMute = options.setMute || null
    this.sPayload(this.guildId, JSON.stringify({
      op: 4
      , d: {
        guild_id: this.guildId
        , channel_id: this.voiceChannel
        , self_mute: setMute
        , self_deaf: setDeaf
      }
    }))
    var players = map.get('players')
    players[this.guildId] = {
      ...players[this.guildId]
      , connected: true
    }
    map.set('players', players)
  }

  disconnect() {
    this.sPayload(this.guildId, JSON.stringify({
      op: 4
      , d: {
        guild_id: this.guildId
        , channel_id: null
        , self_mute: null
        , self_deaf: null
      }
    }))
    this.connected = false
    this.destroy()
  }
  play() {
    let queue = db.get(`queue.${this.guildId}`)
    if (!queue) return;
    else {
      let track = queue.shift();
      if (!track) return;
      if (track) {
db.set(`queue.${this.guildId}`, queue)
        let current = map.get('current') || {}
        current[this.guildId] = {
          ...track,
          thumbnail: track.thumbnail,
          requester: track.requester
        }
        map.set('current', current)
        this.#sendWs({
          op: 'play'
          , guildId: this.guildId
          , channelId: this.voiceChannel
          , track: track.track
          , volume: 80
          , noReplace: false
          , pause: false
        })
        var players = map.get('players') || {}
        players[this.guildId] = {
          ...players[this.guildId]
          , playing: true
        }
        map.set('players', players)
      }
    }
  }

  pause() {
    if (player[this.guildId].pause) throw new TypeError(`[ MoonlinkJs ]: player is already been paused.`)
    player[this.guildId] = {
      ...player[this.guildId]
      , playing: false
      , paused: true
    }
    map.set('players', player)
    this.#sendWs({
      op: 'pause'
      , guildId: this.guildId
      , pause: true
    });
  }

  resume() {
    if (!player[this.guildId].paused) throw new TypeError(`[ MoonlinkJs ]: player is not paused.`)
    player[this.guildId] = {
      ...player[this.guildId]
      , playing: true
      , paused: false
    }
    map.set('players', player)
    this.#sendWs({
      op: 'pause'
      , guildId: this.guildId
      , pause: false
    });
  }

setVolume(percent) {
    if (typeof percent !== 'string' && typeof percent !== 'number') throw new TypeError(`[ MoonlinkJs ]: the percentage must be in string and numbers format.`)
    if(!this.playing) throw new Error("[ @Moonlink/Nodes ]: nothing is being played")
    this.#sendWs({
      op: 'volume'
      , guildId: this.guildId
      , volume: percent
    })
    var players = map.get('players')
    players[this.guildId] = {
      ...players[this.guildId]
      , volume: percent
    }
    map.set('players', players)
  }

  stop() {
    let queue = db.get(`queue.${this.guildId}`)
    if (!queue[0]) {
      this.#sendWs({
        op: 'stop'
        , guildId: this.guildId
      });
    } else {
      delete map.get(`players`)[this.guildId]
      this.#sendWs({
        op: 'stop'
        , guildId: this.guildId
      });
    }
    return true
  }

  destroy() {
    if (this.connected) this.disconnect()
    this.#sendWs({
      op: 'destroy',
      guildId: this.guildId
    });
    if (db.get(`queue.${this.guildId}`)) {

      db.set(`queue.${this.guildId}`, null)
    }
    let players = map.get('players')
    players[this.guildId] = null
    map.set('players', players)
    return true
  }

  skip() {
    this.play()
  }

  seek(number) {
    let queue = db.get(`queue.${this.guildId}`)
    if (typeof number !== 'string' && typeof number !== 'number') throw new TypeError(`[ MoonlinkJs ]: seek need a number in mileseconds.`)
    if (queue && queue[0]) return;
    if (!this.current.isSeekable) throw new TypeError(`[ Moonlink.Js ]: the track "${this.current.track}" is not seekable`)
    this.#sendWs({
      op: 'seek'
      , guildId: this.guildId
      , position: number
    })
    return true
  }

  setLoop(number) {
    var player = map.get('players') || {}
    if (!number) {
      player[this.guildId] = {
        ...player[this.infos.guildId]
        , loop: undefined
      }
    }
    if (typeof number !== 'string' && typeof number !== 'number') throw new TypeError(`[ MoonlinkJs ]: loop accept only numbers in strings.`)
    if (number > 2) throw new TypeError(`[ MoonlinkJs ]: the number cannot be above 2.`);
    player[this.guildId] = {
      ...player[this.guildId]
      , loop: number
    }
    map.set('players', player)
  }

  removeSong(position) {
    let queue = db.get(`queue.${this.guildId}`)
    if (typeof position !== 'string' && typeof position !== 'number') throw new TypeError(`[ MoonlinkJs ]: accepts only numbers string.`);
    if (!queue) throw new TypeError(`[ MoonlinkJs ]: queue is empty!`);
    if (!queue[position - 1]) throw new TypeError(`[ MoonlinkJs ]: the position indicated by the user there is no track.`)
    queue.splice(position - 1, 1)
    db.set('queue.' + this.guildId, queue)
    return true
  }

  skipTo(position) {
    let queue = db.get(`queue.${this.guildId}`)
    if (typeof position !== 'string' && typeof position !== 'number') throw new TypeError(`[ MoonlinkJs ]: skipTo accept only numbers in strings.`)
    if (!queue) throw new TypeError(`[ MoonlinkJs ]: queue is empty.`)
    if (!queue[position - 1]) throw new TypeError(`[ MoonlinkJs ]: the position indicated by the user there is no track.`)
      let skipedToTrack = queue.splice(position - 1, 1)
    let current_track = map.get('current') || {}
    current_track[this.guildId] = skipedToTrack[0]
    map.set('current', current_track)
      db.set(`queue.${this.guildId}`, queue)
      utils.track.skipEdit(true);
      this.#sendWs({
        op: 'play'
        , guildId: this.guildId
        , channelId: this.voiceChannel
        , track: skipedToTrack[0].track
      });
    return true
  }
}

module.exports.MoonPlayer = MoonPlayer;