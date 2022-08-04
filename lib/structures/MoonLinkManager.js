"use strict";
let { utils } = require('../structures/MoonLinkUtils.js')
let { listeners } = require('../structures/MoonLinkListeners.js')
let { EventEmitter } = require('events')
let WebSocket = require('ws')
let db = utils.db
let map = utils.map
var retryTime = 300000
var retryAmount = 5
var reconnectAtattempts = 1
class MoonlinkManager extends EventEmitter {
	constructor(nodes, options, sPayload) {
		super();
		if (!nodes) throw new Error('[ MoonLink ]: Options is empty')
		if (typeof nodes !== "undefined" && !Array.isArray(nodes)) throw new Error('[ MoonLink ]: Option "nodes" must be in an array.')
		if (nodes.length === 0) throw new Error('[ MoonLink ]: Parament of "nodes" must contain an object')
		if (typeof options.shard !== "number" && typeof options.shard !== 'undefined') throw new TypeError('[ MoonLink ]: Option "shards" must be in number. ')
		if (typeof options.clientName !== 'undefined' && typeof options.clientName !== 'string') throw new TypeError('[ MoonLink ]: The "clientname" option must be in string.')
		if (typeof sPayload !== 'function') throw new TypeError('[ MoonLink ]: The "send" option must be a function')
		utils.editSendDs(sPayload)
		this.request = utils.request
		this.connected = []
		this.nodes = nodes
		this.ws;
		this.options = options
		this.clientId;
		this.sPayload = sPayload
	}
	createNode(options, clientId) {
		let db = utils.db
		let map = utils.map
		options.forEach((no) => {
			if (typeof no.host != 'undefined' && typeof no.host != 'string') throw new TypeError('[ MoonLink ]: Option "host" must be empty string, for localhost leave empty')
			if (typeof no.password !== 'undefined' && typeof no.password !== 'string') throw new TypeError("[ MoonLink.Js ]: The password option must be in string, if you don't have a password, leave it empty")
			if (no.port && typeof no.port !== 'number' || no.port > 65535 || no.port < 0) throw new TypeError('[ MoonLink ]: The "port" option must be a ')
			let clientName = this.options.clientName || `MoonLink(${require('../package.json').version})`
			if (this.options.retryTime) retryTime = this.options.retryTime
			let password = no.password || ''
			let shards = this.options.shards || 1
			let secure = `${no.secure ? 's' : ''}`
			let host = no.host || 'localhost'
			let port = `${':' + no.port || ':' + 443 }`
			let debug = this.options.debug || false
			if (this.connected[`${host}${port}`]) return;
			this.ws = new WebSocket(`ws${secure}://${host}${port}`, undefined, {
				headers: {
					Authorization: password
					, 'Num-Shards': shards
					, 'User-Id': clientId
					, 'Client-Name': clientName
				}
			})
			utils.node.add(no, this.ws)
			this.ws.on('open', (data) => {
				this.emit('nodeCreate', (no))
				if (db.has('queue')) {
					db.delete('queue')
				}
				this.connected[`${host}${port}`] = true
				this.emit('debug', '[ MoonLink.Js ]: A node has been connected ')
			})
			this.ws.on('close', (code, reason) => {
				this.emit('debug', '[ MoonLink.Js ]: A node has been disconnected ')
				this.emit('nodeClose', (no))
				this.connected[`${host}${port}`] = false;
				if (code !== 1000 || reason !== "destroy") this.reconnect(no);
			})
			this.ws.on('message', async (received) => {
				let lister = listeners
				lister.events(no, this, received)
			})
			this.ws.on('error', (err) => this.emit('nodeError', (no, err)))
		})
	}
	init(clientId) {
		if (!clientId) throw new TypeError('[ MoonLink ]: "clientId" option is required.')
		this.createNode(this.nodes, clientId)
		this.clientId = clientId
	}
	reconnect(node) {
		if (reconnectAtattempts >= retryAmount) {
			this.emit('nodeError', '[ MoonLink.Js ]: unable to reconnect the node, and we have reached the reconnection limit, please check that this node is online, or verify that the information is correct')
			let nodeClose = utils.node.all()[`${node.host}${node.port ? ':' + node.port : ''}`]
			nodeClose.ws.close(1000, "destroy")
			nodeClose.ws.removeAllListeners()
			utils.node.remove(node)
		} else {
			setTimeout(() => {
				utils.node.all()[`${node.host}${node.port ? ':' + node.port : ''}`].ws.removeAllListeners()
				this.emit('nodeReconnect', node)
				this.createNode([
                                                                node], this.clientId)
				this.emit('debug', '[ MoonLink.Js ]: Trying to reconnect node, attempted number ' + reconnectAtattempts)
				reconnectAtattempts++
			}, retryTime)
		}
	}
	sendWs(json) {
		let send = {
			error: false
			, message: '[ MoonLink.Js ]: MoonLink just sent a request to lavalink'
		}
		utils.node.get()
			.ws.send(JSON.stringify(json), (error) => {
				if (error) {
					send = {
						error: true
						, message: error
					}
				}
			})
		this.emit('debug', send.message)
	}
	async search(query) {
		if (!query) throw new Error('[ MoonLink.Js ]: The query option is mandatory')
		if (typeof query !== 'string') throw new Error('[ MoonLink.Js ]: (search) The query option must be in the form string')
		let db = utils.db
          
                let { MoonTrack } = require('../structures/MoonLinkTrack.js')
		if (!query.startsWith('https://') && !query.startsWith('http://')) {
			query = `ytsearch:${query}`;
		}
		let params = new URLSearchParams({ identifier: query })
		let res = await this.request(utils.node.get()
			.node, 'loadtracks', params)
		this.emit('debug', '[ MoonLink.Js ]: searching songs')
		if (res.loadType === 'LOAD_FAILED' || res.loadType === 'NO_MATCHES') {
			let notTracks = {
				loadType: res.loadType
				, playlistInfo: {}
				, tracks: []
			}
                        return notTracks
		} else {
                       const tracks = res.tracks.map(x => new MoonTrack(x));
			if (res.loadType === 'PLAYLIST_LOADED') {
				res.playlistInfo.duration = tracks.reduce((acc, cur) => acc + cur.duration, 0);
			}
			return {
				...res
				, tracks
			}
		}
	}
	async decodeTrack(track) {
		let req = await this.request(utils.node.get()
			.node, 'decodetrack', 'track=' + track)
		return req
	}
	request(node, endpoint, params) {
		return utils.makeRequest(`http://${node.host}${node.port ? `:${node.port}` : ``}/${endpoint}?${params}`, 'GET' ,{
				headers: {
					Authorization: node.password
				}
			})
			
	}
	updateVoiceState(packet) {
		var map = utils.map
		if (packet.t == 'VOICE_SERVER_UPDATE') {
			let voiceServer = {}
			voiceServer[packet.d.guild_id] = {
				event: packet.d
			}
			map.set('voiceServer', voiceServer)
			return this.attemptConnection(packet.d.guild_id)
		}
		if (packet.t == 'VOICE_STATE_UPDATE') {
			if (packet.d.user_id !== this.clientId) return;
			if (packet.d.channel_id) {
				let voiceStates = {}
				voiceStates[packet.d.guild_id] = packet.d
				map.set('voiceStates', voiceStates)
				return this.attemptConnection(packet.d.guild_id)
			}
		}
	}
	attemptConnection(guildId) {
		let map = utils.map
		let voiceServer = map.get('voiceServer') || {}
		let voiceStates = map.get('voiceStates') || {}
		let players = map.get('players') || {}
		if (!players[guildId]) return false
		if (!voiceServer[guildId]) return false
		this.sendWs({
			op: 'voiceUpdate'
			, sessionId: voiceStates[guildId].session_id
			, guildId: voiceServer[guildId].event.guild_id
			, event: voiceServer[guildId].event
		})
		return true
	}
	get players() {
		let map = utils.map
                let { MoonPlayer } = require('../structures/MoonLinkPlayer.js')
		let get = function (guild) {
			if (typeof guild !== 'number' && typeof guild !== 'string') {
				throw new TypeError('[ MOONLINK ] guild id support only numbers in string!')
			}
			const { MoonPlayer } = require('../structures/MoonLinkPlayer.js')
			return (new MoonPlayer(map.get('players')[guild]))
		}
		let create = function (t) {
			if (typeof t.guildId !== 'number' && typeof t.guildId !== 'string') {
				throw new TypeError('[ MOONLINK ]: guild id support only numbers in string!')
			}
			if (typeof t.voiceChannel !== 'number' && typeof t.voiceChannel !== 'string') {
				throw new TypeError('[ MOONLINK ]: voice channel id support only numbers in string!')
			}
			if (typeof t.textChannel !== 'number' && typeof t.textChannel !== 'string') {
				throw new TypeError('[ MOONLINK ]: text channel id support only numbers in string!')
			}
			let players = map.get('players') || {}
			if (!players[t.guildId]) {
				players[t.guildId] = {
					guildId: t.guildId
					, voiceChannel: t.voiceChannel || null
					, textChannel: t.textChannel || null
					, playing: false
					, paused: false
					, loop: false
				}
				map.set('players', players)
			}
			let { MoonPlayer } = require('../structures/MoonLinkPlayer.js')
			return (new MoonPlayer(players[t.guildId]))
		}
		let all = function () {
			let players = map.get('players') || null
			if (!players) {
				return null
			} else {
				return players
			}
		}
       let has = function(guild) {
          let player = map.get('players') || []
         if(typeof guild !== 'string' && isNaN(guild)) {
             throw new TypeError(`[ MoonLinkJs ]: ${guild} a number string was expected`) 
         }
      if(player[guild]) player = true
      else player = false
      return player
       }
       let edit = function(info) {
         let player = map.get('players') || []
          if(!info) {
              throw new TypeError(`[ MoonlinkJs ]: enter a term to edit your player.`)
          }
         if(!player[info.guildId]) { throw new TypeError(`[ MoonLinkJs ]: cannot edit a player on guild ${info.guildId}.`)}
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
          		return (new MoonPlayer(player[info.guildId]))
           
       }
		return {
			get
			, create
			, all
            , has
            , edit
             
		}
	}
}
module.exports.MoonlinkManager = MoonlinkManager
