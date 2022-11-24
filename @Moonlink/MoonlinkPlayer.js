"use strict";
const event = require('events')
const eventos = new event()
let utils = require('../@Rest/MoonlinkUtils.js')
let { MoonQueue } = require('../@Rest/MoonlinkQueue.js')

var map = utils.map
var player = map.get('players') || {}
var db = utils.db
var sendDs = utils.sendDs();

class MoonPlayer {
#sendWs;
    #manager;
	constructor(infos, manager) {
        this.#sendWs = manager.sendWs
        this.#manager = manager
		this.infos = infos 
        this.playing = this.infos.playing || null
		this.connected = this.infos.connected || null
        this.current = utils.track.current()
		this.queue = new MoonQueue({ guildId: infos.guildId })        
	}
	connect(selfMute, selfDeaf) {
	  sendDs(this.infos.guildId, JSON.stringify({ 
	    op: 4
	    , d: {
	      guild_id: this.infos.guildId
	      , channel_id: this.infos.voiceChannel
        , self_mute: selfMute || null
        , self_deaf: selfDeaf || null
	    }
	  }))
        var players = map.get('players')
   player[this.infos.guildId] = {
     ...players[this.infos.guildId]
     , connected: true
}
   map.set('players', player)
}

disconnect() {
    
   sendDs(this.infos.guildId, JSON.stringify({
       op: 4
       , d: {
          guild_id: this.infos.guildId
          , channel_id: null
          , self_mute: null
          , self_deaf: null
       }
       
   }))
    this.destroy()
}
play() { 
  let queue = db.get(`queue.${this.infos.guildId}`)
  if(!queue) throw new TypeError(`[ MoonlinkJs ]: queue is empty, verify docs.`)
  else {
    let track = queue.shift();
    if(!track) throw new TypeError(`[ MoonlinkJs ]: an internal error has ocorred.`)
    if(track) {
      utils.track.editCurrent(track)
      db.set(`queue.${this.infos.guildId}`, queue)
      this.#sendWs({ 
        op: 'play'
        , guildId: this.infos.guildId
        , channelId: this.infos.voiceChannel
        , track: track.track
        , volume: 80
        , noReplace: false
        , pause: false
    })
   var players = map.get('players')
   player[this.infos.guildId] = {
     ...players[this.infos.guildId]
     , playing: true
   }
   map.set('players', player)
  }
}
}

pause() {
  if(player[this.infos.guildId].pause) throw new TypeError(`[ MoonlinkJs ]: player is already been paused.`)
  player[this.infos.guildId] = {
    ...player[this.infos.guildId]
    , playing: false
    , paused: true
  }
  map.set('players', player)
   this.#sendWs({
    op: 'pause'
    , guildId: this.infos.guildId
    , pause: true
  });
}

resume() {
  if(!player[this.infos.guildId].paused) throw new TypeError(`[ MoonlinkJs ]: player is not paused.`)
  player[this.infos.guildId] = {
    ...player[this.infos.guildId]
    , playing: true
    , paused: false
  }
  map.set('players', player)
  this.#sendWs({
    op: 'pause'
    , guildId: this.infos.guildId
    , pause: false
  });
}

volume(percent) {
  let queue = db.get(`queue.${this.infos.guildId}`)
  if(typeof percent !== 'string' && typeof percent !== 'number') throw new TypeError(`[ MoonlinkJs ]: the percentage must be in string and numbers format.`)
  if(!queue) throw new TypeError(`[ MoonlinkJs ]: queue is empty.`)
  this.#sendWs({
    op: 'volume'
    , guildId: this.infos.guildId
    , volume: percent
  })
}
    
stop() {
  let queue = db.get(`queue.${this.infos.guildId}`)
  if(!queue[0]) {
  this.#sendWs({ 
    op: 'stop'
    , guildId: this.infos.guildId
  });
  } else {
     delete map.get(`players`)[this.infos.guildId]
      this.#sendWs({ 
    op: 'stop'
    , guildId: this.infos.guildId
  });
  }
  return true
}

destroy() {
   this.disconnect()
   this.#sendWs({
      op: 'destroy',
      guildId: this.infos.guildId
   });
  if(db.get(`queue.${this.infos.guildId}`)) {

db.set(`queue.${this.infos.guildId}`, null)
  }
 let players = map.get('players')
 players[this.infos.guildId] = null
 map.set('players', players)
  return true
}

skip() {
  let queue = db.get(`queue.${this.infos.guildId}`), player = map.get('players') || {}
  if(!queue) throw new TypeError(`[ MoonlinkJs ]: queue is empty.`)
  else {
   if(!queue[0]) {
       this.destroy();
       return false
   }
   if(player[this.infos.guildId].loop > 1) {
      const trackl = queue.shift();
      queue.push(utils.track.current())
     utils.track.editCurrent(trackl);
       utils.track.skipEdit(true);
       db.set('queue.' + this.infos.guildId, queue)
       this.#sendWs({
          op:"play"
          , channelId: this.infos.voiceChannel
          , guildId: this.infos.guildId
          , track: trackl.track
       })
     return true
   }
   let actualTrack = queue.shift();
   utils.track.editCurrent(actualTrack);
   utils.track.skipEdit(true);
   db.set(`queue.${this.infos.guildId}`, queue)
   this.#sendWs({
      op: 'play'
      , channelId: this.infos.voiceChannel
      , guildId: this.infos.guildId
      , track: actualTrack.track
   })
   return true
    }
  }

seek(number) {
  let queue = db.get(`queue.${this.infos.guildId}`)
  if(typeof number !== 'string' && typeof number !== 'number') throw new TypeError(`[ MoonlinkJs ]: seek need a number in mileseconds.`)
  if(queue && queue[0]) return;
  if(!utils.track.current().isSeekable) throw new TypeError(`[ Moonlink.Js ]: the track "${utils.track.current().track}" is not seekable`)
  this.#sendWs({
    op: 'seek'
    , guildId: this.infos.guildId
    , position: number
  })
  return true
}

loop(number) {
    var player = map.get('players') || {}
  if(!number) {
     player[this.infos.guildId] = {
         ...player[this.infos.guildId]
         , loop: undefined
     }
  }
  if(typeof number !== 'string' && typeof number !== 'number') throw new TypeError(`[ MoonlinkJs ]: loop accept only numbers in strings.`)
  if(number > 2) throw new TypeError(`[ MoonlinkJs ]: the number cannot be above 2.`);
    player[this.infos.guildId] = {
      ...player[this.infos.guildId]
      , loop: number
    }
    map.set('players', player)
}

removeSong(position) {
   let queue = db.get(`queue.${this.infos.guildId}`)
   if(typeof position !== 'string' && typeof position !== 'number') throw new TypeError(`[ MoonlinkJs ]: accepts only numbers string.`);
  if(!queue) throw new TypeError(`[ MoonlinkJs ]: queue is empty!`);
  if(!queue[position]) throw new TypeError(`[ MoonlinkJs ]: there are no song in the given position.`)
  queue.splice(position, 1)
  db.set('queue.' + this.infos.guildId, queue)
  return true
}

skipTo(position) {
  let queue = db.get(`queue.${this.infos.guildId}`)
  if(typeof position !== 'string' && typeof position !== 'number') throw new TypeError(`[ MoonlinkJs ]: skipTo accept only numbers in strings.`)
  if(!queue) throw new TypeError(`[ MoonlinkJs ]: queue is empty.`)
  else {
    let skipedToTrack = queue.splice(position, 1)
    utils.track.editCurrent(skipedToTrack);
    db.set(`queue.${this.infos.guildId}`, [])
    utils.track.skipEdit(true);
    this.#sendWs({
      op: 'play'
      , guildId: this.infos.guildId
      , channelId: this.infos.voiceChannel
      , track: utils.track.current().track
    });
  }
}


}

module.exports.MoonPlayer = MoonPlayer;