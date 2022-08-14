"use strict";
const event = require('events')
const eventos = new event()
let { utils } = require('../structures/MoonLinkUtils.js')
let { MoonQueue } = require('../structures/MoonLinkQueue.js')
let { MoonFilters } = require('../structures/MoonLinkFilters')
var request = function (x) {
	utils.node.get()
		.ws.send(JSON.stringify(x))
}
let map = utils.map
let player = map.get('players') || {}
let db = utils.db
class MoonPlayer {
	constructor(infos) {
		this.infos = infos
		this.playing = this.infos.playing || null
		this.connected = this.infos.connected || null
		this.current = utils.track.current()
		this.queue = new MoonQueue({ guildId: infos.guildId })
        this.filters = new MoonFilters({ guildId: infos.guildId })
	}
	connect(setDeaf, setMute) {
		let sendDs = utils.sendDs()
		sendDs(this.infos.guildId, JSON.stringify({
			op: 4
			, d: {
				guild_id: this.infos.guildId
				, channel_id: this.infos.voiceChannel
				, self_mute: setMute || false
				, self_deaf: setDeaf || true
			}
		}))
		this.connected = true
	}
	disconnect() {
		console.log(this.infos)
		if (!player[this.infos.guildId].connected) {
			throw new TypeError(`[MOONLINK]: player not connected in voice channel`)
		}
		let sendDs = utils.sendDs()
		sendDs(this.infos.guildId, JSON.stringify({
			op: 4
			, d: {
				guild_id: this.infos.guildId
				, channel_id: undefined
				, self_mute: false
				, self_deaf: false
			}
		}))
		this.connected = false
		player[this.infos.guildId] = {
			...player[this.infos.guildId]
			, playing: false
			, connected: false
		}
		delete map.get('players')[this.infos.guildId]
		map.set('players', player)
	}
	play() {
		let queue = db.get('queue.' + this.infos.guildId)
		let sendDs = utils.sendDs()
		if (!queue) throw new Error('[ MoonLink.Js ]: the queue is empty, verify your play command.')
		else {
			let track = queue.shift();
			if (!track) throw new Error(`[ MoonLink.Js ]: intel error`)
			if (track) {
				utils.track.editCurrent(track)
				this.current = utils.track.current()
					.track
				db.set(`queue.${this.infos.guildId}`, queue)
				let req = request({
					op: 'play'
					, guildId: this.infos.guildId
					, channelId: this.infos.voiceChannel
					, track: this.current
					, volume: 80
					, noReplace: false
					, pause: false
				})
				player[this.infos.guildId] = {
					...player[this.infos.guildId]
					, playing: true
					, connected: true
				}
			}
		}
	}
	pause() {
		
		if (player[this.infos.guildId].paused) {
			throw new TypeError(`[MOONLINK]: Player already is paused.`)
        }
    player[this.infos.guildId] = {
					...player[this.infos.guildId]
					, playing: false
					, paused: true
				}
       map.set('players', player)
     request({ op:'pause', guildId: this.infos.guildId, pause: true })
    }
    resume() {
        if (!player[this.infos.guildId].paused) {
			throw new TypeError(`[MOONLINK]: Player not is paused.`)
        }
     player[this.infos.guildId] = {
					...player[this.infos.guildId]
					, playing: true
					, paused: false
				}
        map.set('players', player)
     request({ op:'pause', guildId: this.infos.guildId, pause: false })
    }
	volume(porcent) {
		if (typeof porcent !== 'string' && typeof porcent !== 'number') {
			throw new TypeError(`[ MOONLINK ]: a porcentage of volume needs to be a number!`)
		}
		request({ op: 'volume', guildId: this.infos.guildId, volume: porcent })
	}
	stop() {
		if (!map.get('players')[this.infos.guildId]) {
			throw new TypeError("[MOONLINK]: I can't stop a song when there's no player")
		}
        utils.db.delete('queue.' + this.infos.guildId)
		request({ op: 'stop', guildId: this.infos.guildId })
		player[this.infos.guildId] = { ...player[this.infos.guildId], playing: false, connected: true }
        
        return true
	}
	destroy() {
		let sendDs = utils.sendDs()
		sendDs(this.infos.guildId, JSON.stringify({
			op: 4
			, d: {
				guild_id: this.infos.guildId
				, channel_id: null
				, self_mute: false
				, self_deaf: false
			}
		}))
		request({ op: 'destroy', guildId: this.infos.guildId });
        delete map.get(`players`)[this.infos.guildId]
		db.delete(`queue.${this.infos.guildId}`)
	}
	skip() {
		let queue = db.get(`queue.${this.infos.guildId}`)
		if (!queue) {
			throw new TypeError(`[ Moonlink.Js ] queue is empty!`)
		} else if (queue[0]) {
			if (player[this.infos.guildId].loop === 2) {
				db.push(`queue.${this.infos.guildId}`, queue.shift())
				utils.track.editCurrent(queue[0])
			}
			if (!queue[0]) {
				this.destroy()
				return false
			}
			let actualtrack = queue.shift()
			utils.track.editCurrent(actualtrack)
			db.set(`queue.${this.infos.guildId}`, queue)
			utils.track.skipEdit(true)
			let a = request({
				op: 'play'
				, channelId: this.infos.voiceChannel
				, guildId: this.infos.guildId
				, track: utils.track.current()
					.track
			})
		}
	}
	replay() {
		let queue = db.get(`queue.${this.infos.guildId}`)
		if (!utils.track.current()) {
			throw new TypeError(`[MoonlinkJs]: no has a current track to replay.`)
		}
		if (queue && !queue[0]) return;
		utils.track.skipEdit(true)
		request({
			op: 'play'
			, channelId: this.infos.voiceChannel
			, guildId: this.infos.guildId
			, track: utils.track.current()
				.track
		});
	}
   
	loop(r) {
		if (!r) {
			throw new TypeError(`[ Moonlink.Js ] loop parameter is empty.`)
		}
		if (typeof r !== 'string' && typeof r !== 'number') {
			throw new TypeError(`[ Moonlink.Js ] loop parameter need to be string and number!`)
		}
		if (r > 3) {
			throw new TypeError(`[ Moonlink.Js ] ${r} is not a option parameter required by loop, try this: 
1 - for loop song
2 - for loop queue
3 - for no loop`)
		}
		if (r === 1) {
			player[this.infos.guildId] = {
				...player[this.infos.guildId]
				, loop: 1
			}
		} else if (r === 2) {
			player[this.infos.guildId] = {
				...player[this.infos.guildId]
				, loop: 2
			}
		} else if (r === 3) {
			player[this.infos.guildId] = {
				...player[this.infos.guildId]
				, loop: false
			}
		}
     map.set('players', player)
     
	}
}
module.exports.MoonPlayer = MoonPlayer;
