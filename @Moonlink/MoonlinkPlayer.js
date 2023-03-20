"use strict";
const event = require('events')
const eventos = new event()
let utils = require('../@Rest/MoonlinkUtils.js')
let { MoonQueue } = require('../@Rest/MoonlinkQueue.js')
let { MoonFilters } = require('../@Rest/MoonlinkFilters.js')

var map = utils.map
var player = map.get('players') || {}
var db = utils.db
var sendDs = utils.sendDs();

class MoonPlayer {
  #sendWs;
  #manager;
  #infos;
  constructor(infos, manager) {
    this.#sendWs = manager.sendWs
    this.#manager = manager
    this.#infos = infos
    this.guildId = this.#infos.guildId
    this.textChannel = this.#infos.textChannel
    this.voiceChannel = this.#infos.voiceChannel
    this.playing = this.#infos.playing || null
    this.connected = this.#infos.connected || null
    this.paused = this.#infos.paused || null
    this.loop = this.#infos.loop || null
    this.volume = this.#infos.volume || 80
    this.current = utils.track.current()
    this.queue = new MoonQueue({ guildId: infos.guildId })
    this.filters = new MoonFilters({ guildId: infos.guildId, sendWs: this.#sendWs })
  }
  connect(options) {
    if (!options) options = { setDeaf: false, setMute: false }
    let setDeaf = options.setDeaf || null
    let setMute = options.setMute || null
    sendDs(this.guildId, JSON.stringify({
      op: 4
      , d: {
        guild_id: this.guildId
        , channel_id: this.voiceChannel
        , self_mute: setMute || null
        , self_deaf: setDeaf || null
      }
    }))
    var players = map.get('players')
    player[this.guildId] = {
      ...players[this.guildId]
      , connected: true
    }
    map.set('players', player)
  }

  disconnect() {

    sendDs(this.guildId, JSON.stringify({
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
    if (!queue) throw new TypeError(`[ MoonlinkJs ]: queue is empty, verify docs.`)
    else {
      let track = queue.shift();
      if (!track) throw new TypeError(`[ MoonlinkJs ]: an internal error has ocorred.`)
      if (track) {
        utils.track.editCurrent(track)
        db.set(`queue.${this.guildId}`, queue)
        this.#sendWs({
          op: 'play'
          , guildId: this.guildId
          , channelId: this.voiceChannel
          , track: track.track
          , volume: 80
          , noReplace: false
          , pause: false
        })
        var players = map.get('players')
        player[this.guildId] = {
          ...players[this.guildId]
          , playing: true
        }
        map.set('players', player)
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
    let queue = db.get(`queue.${this.guildId}`)
    if (typeof percent !== 'string' && typeof percent !== 'number') throw new TypeError(`[ MoonlinkJs ]: the percentage must be in string and numbers format.`)
    if (!queue) throw new TypeError(`[ MoonlinkJs ]: queue is empty.`)
    this.#sendWs({
      op: 'volume'
      , guildId: this.guildId
      , volume: percent
    })
    var players = map.get('players')
    player[this.guildId] = {
      ...players[this.guildId]
      , volume: percent
    }
    map.set('players', player)
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
    let queue = db.get(`queue.${this.guildId}`), player = map.get('players') || {}
    if (!queue) throw new TypeError(`[ MoonlinkJs ]: queue is empty.`)
    else {
      if (!queue[0]) {
        this.destroy();
        return false
      }
      if (player[this.guildId].loop > 1) {
        const trackl = queue.shift();
        queue.push(utils.track.current())
        utils.track.editCurrent(trackl);
        utils.track.skipEdit(true);
        db.set('queue.' + this.guildId, queue)
        this.#sendWs({
          op: "play"
          , channelId: this.voiceChannel
          , guildId: this.guildId
          , track: trackl.track
        })
        return true
      }
      let actualTrack = queue.shift();
      utils.track.editCurrent(actualTrack);
      utils.track.skipEdit(true);
      db.set(`queue.${this.guildId}`, queue)
      this.#sendWs({
        op: 'play'
        , channelId: this.voiceChannel
        , guildId: this.guildId
        , track: actualTrack.track
      })
      return true
    }
  }

  seek(number) {
    let queue = db.get(`queue.${this.guildId}`)
    if (typeof number !== 'string' && typeof number !== 'number') throw new TypeError(`[ MoonlinkJs ]: seek need a number in mileseconds.`)
    if (queue && queue[0]) return;
    if (!utils.track.current().isSeekable) throw new TypeError(`[ Moonlink.Js ]: the track "${utils.track.current().track}" is not seekable`)
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
      utils.track.editCurrent(skipedToTrack[0])
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