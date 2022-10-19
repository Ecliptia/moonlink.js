"use strict";
const event = require('events')
const eventos = new event()
let { utils } = require('../structures/MoonLinkUtils.js')
let { MoonQueue } = require('../structures/MoonLinkQueue.js')
let { MoonFilters } = require('../structures/MoonLinkFilters')
var request = function (x) {
	utils.node.get().ws.send(JSON.stringify(x))
}
var map = utils.map
var player = map.get('players') || {}
var db = utils.db
var sendDs = utils.sendDs();
class MoonPlayer {
	constructor(infos) {
		this.infos = infos 
        this.playing = this.infos.playing || null
		this.connected = this.infos.connected || null
        this.current = utils.track.current()
		this.queue = new MoonQueue({ guildId: infos.guildId })
        this.filters = new MoonFilters({ guildId: infos.guildId })
	}
	connect(selfMute = false, selfDeaf = false) {
	  sendDs(this.infos.guildId, JSON.stringify({ 
	    op: 4
	    , d: {
	      guild_id: this.infos.guildId
	      , channel_id: this.infos.voiceChannel
        , self_mute: selfMute
        , self_deaf: selfDeaf
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
  delete map.get('players')
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
      request({ 
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
  request({
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
  request({
    op: 'pause'
    , guildId: this.infos.guildId
    , pause: false
  });
}

volume(percent) {
  let queue = db.get(`queue.${this.infos.guildId}`)
  if(typeof percent !== 'string' && typeof percent !== 'number') throw new TypeError(`[ MoonlinkJs ]: the percentage must be in string and numbers format.`)
  if(!queue) throw new TypeError(`[ MoonlinkJs ]: queue is empty.`)
  request({
    op: 'volume'
    , guildId: this.infos.guildId
    , volume: percent
  })
}
    
stop() {
  let queue = db.get(`queue.${this.infos.guildId}`)
  if(!queue[0]) {
  request({ 
    op: 'stop'
    , guildId: this.infos.guildId
  });
  } else {
     delete map.get(`players`)[this.infos.guildId]
      request({ 
    op: 'stop'
    , guildId: this.infos.guildId
  });
  }
  return true
}

destroy() {
   request({
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
  let queue = db.get(`queue.${this.infos.guildId}`)
  if(!queue) throw new TypeError(`[ MoonlinkJs ]: queue is empty.`)
  else {
   if(!queue[0]) {
       this.destroy();
       return false
   }
   let actualTrack = queue.shift();
   utils.track.editCurrent(actualTrack);
   utils.track.skipEdit(true);
   db.set(`queue.${this.infos.guildId}`, queue)
   request({
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
  request({
    op: 'seek'
    , guildId: this.infos.guildId
    , position: number
  })
  return true
}

loop(number) {
  if(typeof number !== 'string' && typeof number !== 'number') throw new TypeError(`[ MoonlinkJs ]: loop accept only numbers in strings.`)
  if(number > 3) throw new TypeError(`[ MoonlinkJs ]: the number cannot be above 3.`)
    var player = map.get('players') || {}
    player[this.infos.guildId] = {
      ...player[this.infos.guildId]
      , loop: number
    }
    map.set('players', player)
}

skipTo(position) {
  let queue = db.get(`queue.${this.infos.guildId}`)
  if(typeof position !== 'string' && typeof position !== 'number') throw new TypeError(`[ MoonlinkJs ]: skipTo accept only numbers in strings.`)
  if(!queue) throw new TypeError(`[ MoonlinkJs ]: queue is empty.`)
  else {
    position = position - 1
    let skipedToTrack = queue.splice(position, 1)
    utils.track.editCurrent(skipedToTrack);
    utils.track.skipEdit(true);
    request({
      op: 'play'
      , guildId: this.infos.guildId
      , channelId: this.infos.voiceChannel
      , track: utils.track.current().track
    });
  }
}

shuffleQueue() {
  let queue = db.get(`queue.${this.infos.guildId}`)
  if(!queue && !queue[1]) {
     throw new TypeError(`[ MoonlinkJs ]: cannot shuffle queue, it is empty or missing tracks to shuffle.`)
  }
 let currentIndex = queue.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [queue[currentIndex], queue[randomIndex]] = [
      queue[randomIndex], queue[currentIndex]];
  }
 db.delete('queue.' + this.infos.guildId)
 db.set('queue.' + this.infos.guildId, queue)
}
    

}

module.exports.MoonPlayer = MoonPlayer;