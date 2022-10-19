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
        options.spotifyToken = 'anonymous'
        if (typeof options.spotify !== 'boolean' && typeof options.spotify !== 'undefined') throw new TypeError('[ moonlink.js ]: Spotify option has to be in Boolean format, false or true')
		if (typeof options.clientName !== 'undefined' && typeof options.clientName !== 'string') throw new TypeError('[ MoonLink ]: The "clientname" option must be in string.')
		if (typeof sPayload !== 'function') throw new TypeError('[ MoonLink ]: The "send" option must be a function')
		utils.editSendDs(sPayload)
		this.request = utils.request
		this.connected = []
		this.nodesinfos = nodes
		this.ws;
		this.options = options
		this.clientId;
		this.sPayload = sPayload
	}
	createNode(options, clientId) {
		let db = utils.db
		let map = utils.map
		options.forEach((no) => {
			if (typeof no.host !== 'undefined' && typeof no.host !== 'string') throw new TypeError('[ MoonLink ]: Option "host" must be empty string, for localhost leave empty')
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
		this.createNode(this.nodesinfos, clientId)
		this.clientId = clientId
	}
	reconnect(node) {
		if (reconnectAtattempts >= retryAmount) {
			this.emit('debug', '[ MoonLink.Js ]: unable to reconnect the node, and we have reached the reconnection limit, please check that this node is online, or verify that the information is correct')
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
	async search(options, source) {
        return new Promise(async(resolve) => {
		if (!options) throw new Error('[ MoonLink.Js ]: the search option has to be in string format or in an array')
        if(source && typeof source !== 'string') throw new Error('[ moonlink.js ]: the source option has to be in string format')
		if (typeof options !== 'string' && typeof options !== 'object' ) throw new Error('[ MoonLink.Js ]: (search) the search option has to be in string or array format')
        if(typeof options.query !== 'undefined' && typeof options.query !== 'string') throw new Error('[ moonlink.js ]: query has to be in string format')
        if(typeof options.source !== 'undefined' && typeof options.source !== 'string') throw new Error('[ moonlink.js ]: this option has to be in string format')
		let db = utils.db
          var spotifyApi = 'https://api.spotify.com/v1/'
                let { MoonTrack } = require('../structures/MoonLinkTrack.js')
		if (typeof options !== 'undefined' && !options.startsWith('https://') && !options.startsWith('http://') && typeof source === 'undefined') {
			 options = `ytsearch:${options}`;
		}
        if(typeof options !== 'undefined' && !options.startsWith('https://') && !options.startsWith('http://') && typeof source !== 'undefined') {
            options = `${source}:${options}`
        }
        if(typeof options === 'object' && typeof options.query !== 'undefined' && !options.query.startsWith('https://') && !options.query.startsWith('http://') && typeof options.source === 'undefined') {
            options = `ytsearch:${options.query}`;
        } 
        if(typeof options === 'object' && typeof options.query !== 'undefined' && !options.query.startsWith('https://') && !options.query.startsWith('http://') && typeof options.source !== 'undefined') {
            options = `${options.source}:${options.query}`;
        }
        
        if(typeof options === 'object' && typeof options.query === 'string' && /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|artist|episode|show|album)[/:]([A-Za-z0-9]+)/.test(options.query) || typeof options === 'string' && /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|artist|episode|show|album)[/:]([A-Za-z0-9]+)/.test(options)) {
               if(!this.options.spotifyToken) throw new Error(`[ moonlink.js ]: you didn't put the access option for Spotify, go to Spotify website and create an access token`)
            if(typeof options === 'object' && typeof options.query === 'string') options = options.query
            let track = /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|artist|episode|show|album)[/:]([A-Za-z0-9]+)/.exec(options)
            let url = '';
            switch(track[1]) {
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
         let req = await this.spotifyRequest(url)
         
         if(track[1] === 'track') {
         if (req.error?.status == 400) return resolve({ loadType: 'NO_MATCHES', playlistInfo: {}, tracks: [] })
                 let pes = await this.search(`${req.name} ${req.artists[0].name}`)
                 if (pes.loadType != 'SEARCH_RESULT') return pes 
                 return resolve({
                     loadType: pes.loadType,
                     playlistInfo: pes.playlistInfo,
                     tracks: [{...pes.tracks[0], title: req.name, author: req.artists.map(artist => artist.name).join(', '), thumbnail: req.album.images[0].url, length: req.duration_ms, url: req.external_urls.spotify, sourceName: 'Spotify' }]
                 })
             }
            if (track[1] == 'episode') {
                
         if (req.error?.status == 400) return resolve({ loadType: 'NO_MATCHES', playlistInfo: {}, tracks: [] })
                 let pes = await this.search(`${req.name} ${req.publisher}`)
                 if (pes.loadType != 'SEARCH_RESULT') return resolve(pes)
                 return resolve({
                     loadType: pes.loadType,
                     playlistInfo: pes.playlistInfo,
                     tracks: [{...pes.tracks[0], title: req.name, author: null, thumbnail: req.images[0].url, length: req.duration_ms, url: req.external_urls.spotify, sourceName: 'Spotify' }]
                 })
            }
            if (track[1] == 'playlist' || track[1] == 'album') {
                    
         if (req.error?.status == 400) return { loadType: 'NO_MATCHES', playlistInfo: {}, tracks: [] }
            if (req.error) return resolve({ loadType: 'LOAD_FAILED', playlistInfo: {}, tracks: [], exception: { message: req.error.message, severity: 'UNKNOWN' } })
                
                
                let res = { loadType: 'PLAYLIST_LOADED', playlistInfo: { selectedTrack: -1, name: req.name }, tracks: [] } 
                var i = 0;
                req.tracks.items.forEach(async(x, y) => {
                    let tracks
                    if (track[1] === 'playlist') tracks = await this.search(`${x.track.name} ${x.track.artists[0].name}`)
                    else tracks = await this.search(`${x.name} ${x.publisher}`)
                
                 if (tracks.loadType !== 'SEARCH_RESULT') {

                  if (y === x.tracks.items.length) return resolve(tracks)

                  return;

                }
                   if (track[1] == 'playlist') tracks = { ...tracks.tracks[0], position: y ,thumbnail: req.images[0].url, title: x.track.name, author: x.track.artists.map(artist => artist.name).join(', '), length: x.track.duration_ms, url: x.track.external_urls.spotify, source: 'Spotify' }
                    else tracks = { ...tracks.tracks[0], position: i ,thumbnail: req.images[0].url, title: x.name, author: x.artists.map(artist => artist.name).join(', '), length: x.duration_ms, url: x.external_urls.spotify, source: 'Spotify' }
                    
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
                var i = 0;
                req.tracks.items.forEach(async(x, y) => {
                    let tracks = await this.search(`${x.name} ${x.publisher}`)
                
                 if (tracks.loadType !== 'SEARCH_RESULT') {

                  if (y === x.episodes.items.length) return resolve(tracks)

                  return;

                }
                   if (track[1] == 'playlist') tracks = { ...tracks.tracks[0], position: i ,thumbnail: req.images[0].url, title: x.name, author: req.publisher, length: x.duration_ms, url: x.external_urls.spotify, source: 'Spotify' }
                    
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
		let res = await this.request(utils.node.get()
			.node, 'loadtracks', params)
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
	
                           
    async spotifyRequest(url) {
       let req = await utils.makeRequest(url, 'GET', { headers: { Authorization: ` Bearer ${this.options.spotifyToken}`}})
       if (req.error?.status == 401) {
           await utils.makeRequest('https://open.spotify.com/get_access_token', 'GET', {
headers: {}
}).then(async(data) => {

          this.options.spotifyToken = data.accessToken
       let r = await this.spotifyRequest(url)

          req = r

        })
           }
       return req
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
			if(typeof t.guildId !== 'string' && typeof t.guildId !== 'number') {
				throw new TypeError('[ MOONLINK ]: guild id support only numbers in string!')
			}
			if (typeof t.voiceChannel !== 'string' && typeof t.guildId !== 'number') {
				throw new TypeError('[ MOONLINK ]: voice channel id support only numbers in string!')
			}
			if (typeof t.textChannel !== 'string' && typeof t.guildId !== 'number') {
				throw new TypeError('[ MOONLINK ]: text channel id support only numbers in string!')
			}
            
			let players = map.get('players') || {}
            if(!players[t.guildId]) {
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
       get nodes() {
            let x = {
                all: function() {
                    return utils.node.all()
                },
                get: function(no) {
                    if(!no) no = null 
                    return utils.node.getInfos(no)
                }
                
            }
            return x
        }
	}

module.exports.MoonlinkManager = MoonlinkManager
