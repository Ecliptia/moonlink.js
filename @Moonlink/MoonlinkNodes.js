const Nodes = [];
var idealNode = null;
const utils = require('../@Rest/MoonlinkUtils.js')
const WebSocket = require('ws')
class MoonlinkNodes {
    #on = false;
    constructor(MoonlinkManager, nodes, options, sPayload, clientId) {
        
        this.ws;
        this.manager = MoonlinkManager 
        this.nodes = nodes 
        this.options = options 
        this.sPayload = sPayload 
        this.clientId = clientId
        this.stats = {
      players: 0,
      playingPlayers: 0,
      uptime: 0,
      memory: {
        free: 0,
        used: 0,
        allocated: 0,
        reservable: 0,
      },
      cpu: {
        cores: 0,
        systemLoad: 0,
        lavalinkLoad: 0,
      },
      frameStats: {
        sent: 0,
        nulled: 0,
        deficit: 0,
      },
    };
        this.retryTime = 300000;
        this.reconnectAtattempts = 0;
        this.retryAmount = 5;
       
    }
    init() {
        this.manager.emit('debug', '[ Moonlink.js ]: connection process started')
        this.create(this.nodes, this.clientId)
        
    }
    idealNode() {
        if (!idealNode) {
			let node = Object.values(Nodes)
				.filter((x) => x.ws._readyState === 1)
				.sort((b, a) => a.stats.cpu ? (a.stats.cpu.systemLoad / a.stats.cpu.cores) * 100 : 0 - b.stats.cpu ? (b.stats.cpu.systemLoad / b.stats.cpu.cores) * 100 : 0)[0]
			if (!node) throw new Error('there are no nodes online!')
			if (node) idealNode = node
		}
		if (idealNode) return idealNode
    }
    sendWs(json) {
        	let send = {
			error: false
			, message: '[ Moonlink.Js ]: MoonLink just sent a request to lavalink'
		}
this.idealNode()
this.idealNode().ws.send(JSON.stringify(json), (error) => {
				if (error) {
					send = {
						error: true
						, message: error
					}
				}
			})
		this.manager.emit('debug', send.message)
	
    }
    create(options, clientId) {
        let db = utils.db
        if(!this.#on) {
            this.#on = true
            db.delete('queue')
        }
        options.forEach((no) => {
            if (typeof no.host !== 'undefined' && typeof no.host !== 'string') throw new TypeError('[ MoonLink ]: Option "host" must be empty string, for localhost leave empty')
            if (typeof no.password !== 'undefined' && typeof no.password !== 'string') throw new TypeError("[ MoonLink.Js ]: The password option must be in string, if you don't have a password, leave it empty")
            if (no.port && typeof no.port !== 'number' || no.port > 65535 || no.port < 0) throw new TypeError('[ MoonLink ]: The "port" option must be a ')
            if(!this.options.clientName) this.options.clientName = `MoonLink/${require('./../package.json').version}`
            if(Nodes && Nodes[`${no.host ? no.host : 'localhost'}${no.port ? ':' + no.port : ':443' }`] && Nodes[`${no.host ? no.host : 'localhost'}${no.port ? ':' + no.port : ':443' }`].connected) return;
            this.ws = new WebSocket(`ws${no.secure ? 's' : '' }://${no.host ? no.host : 'localhost'}${no.port ? `:${no.port}` : ':443'}`, undefined, {
                headers: {
					Authorization: no.password ? no.password : ''
					, 'Num-Shards': this.options.shards
					, 'User-Id': clientId
					, 'Client-Name': this.options.clientName
              }})
            this.ManagerNodes(no, this.ws)
            this.ws.on('open', () => {
           this.manager.emit('nodeCreate', no)
           this.manager.emit('debug', `${no.host ? no.host : 'localhost'}${no.port ? ':' + no.port : ':443'} is online, and has also been connected`)
            })
           this.ws.on('close', (code, reason) => {
               this.manager.emit('nodeClose', (no, code, reason))
               this.manager.emit('debug', `${no.host ? no.host : 'localhost'}${no.port ? ':' + no.port : ':443'} has been shut down or restarted, the connection to it has been closed`)
               if (code !== 1000 || reason !== "destroy") this.reconnect(no);
            })
            this.ws.on('message', async(received) => {
                const data = JSON.parse(received)
	this.manager.emit('nodeRaw', data)
		if (data.op && data.op == 'stats') {
	Nodes[`${no.host ? no.host : 'localhost'}${no.port ? ':' + no.port : ':443'}`].stats = data 
		}
		switch (data.op) {
		case 'playerUpdate': {
			let track = utils.track.current()
			let infoUpdate = { ...track, thumbnail: track?.thumbnail, position: data.state.position }
			utils.track.editCurrent(infoUpdate)
this.manager.emit('playerUpdate', data)
			break
		}
		case 'event':
			switch (data.type) {
			case 'TrackStartEvent': {
				let map = utils.map
				let players = map.get('players') || {}
				this.manager.emit('trackStart', players[data.guildId], utils.track.current())
				break
			}
			case 'TrackEndEvent': {
				let db = utils.db
				let track = utils.track.current()
				let map = utils.map
				let players = map.get('players') || {}
				let queue = db.get('queue.' + data.guildId)
				if (utils.track.skip()) {
  
					utils.track.skipEdit(false)
					return;
				}
        if(!players[data.guildId]) return this.manager.emit('debug', '[ @Moonlink/Players ]: information from a guildId was lost')
              				this.manager.emit('trackEnd', players[data.guildId], track)
                if(!players[data.guildId]) return;
				if (players[data.guildId].loop === 1) {
                if(!utils.track.current()) {
              throw new TypeError(`[ MoonLinkJs ]: cannot loop a music with queue is empty!`) } else {
                  
					 return this.sendWs({
						op: 'play'
						, track: utils.track.current()
							.track
						, guildId: data.guildId
					})
				}
                }
				if (players[data.guildId].loop > 1) {
         if(queue.length < 2) {
          throw new TypeError(`[ MoonLinkJs ]: cannot loop queue, no have a second track to loop, try loop a music.`)
      } else {
let queue = utils.db.get(`queue.${data.guildId}`)
let trackshifted = queue.shift()
if(!trackshifted) throw new TypeError(`[ MoonlinkJs ]: queue no has track!`)
queue.push(utils.track.current())
utils.track.editCurrent(trackshifted)
return this.sendWs({
    op: 'play',
    guildId: data.guildId,
    track: utils.track.current().track,
});

                  }
               }
                
				if (!queue) {
					this.manager.emit('debug', '[ MoonLink.Js ]: The queue is empty')
                    this.manager.emit('queueEnd', '[ Moonlink.js ]: the queue is empty')
					utils.track.editCurrent(null)
		delete utils.filters[data.guildId]
                    
			players[data.guildId] = {
						...players[data.guildId]
						, playing: false
					}
					map.set('players', players)
					db.delete(`queue.${data.guildId}`)
				}
				if (queue[0]) {
					let actualtrack = queue.shift()
					utils.track.editCurrent(actualtrack)
					db.set(`queue.${data.guildId}`, queue)
					
                    this.sendWs({
						op: 'play'
						, track: utils.track.current()
							.track
						, guildId: data.guildId
					})
				} else if (typeof queue[0] == 'undefined') {
					const players = map.get('players') || {}
					players[data.guildId] = {
						...players[data.guildId]
						, playing: false
                        , loop: undefined

					}
					map.set('players', players)
					db.delete(`queue.${data.guildId}`)
					utils.track.editCurrent(null) 
delete utils.filters[data.guildId]
				}
				break;
			}
			case 'TrackExceptionEvent': {
                

var map = utils.map
				delete data.op
				delete data.type
				db.delete(`queue.${data.guildId}`)
				delete map.get('players')[data.guildId]
				this.manager.emit('trackException', data)
				
                    this.manager.emit('warn', '[ MoonLink.Js ]: It looks like something when trying to play the track, this is not caused by a MoonLink bug, check your lavalink console or report to lavalink.')
				break
			}
			case 'TrackStuckEvent': {
				delete data.op
				delete data.type
				this.manager.emit('warn', `[ MoonLink.Js ]: it looks like the track got stuck, this is not caused by a MoonLink bug, if continues report to lavalink.`)
				let track = utils.track.current()
				
				let db = utils.db
                this.manager.emit('trackEnd', track)
				let queue = db.get('queue.' + data.guildId)
				let players = map.get('players') || {}
				if (players[data.guildId].loop) {
					
                    this.sendWs({
						op: 'play'
						, track: utils.track.current()
							.track
						, guildId: data.guildId
					})
				}
				if (!queue) {
					emit.emit('debug', '[ MoonLink.Js ]: The queue is empty')
					utils.track.editCurrent(null)
					players[data.guildId] = {
						...players[data.guildId]
						, playing: false
					}
					map.set('players', players)
					db.delete(`queue.${data.guildId}`)
				}
				if (queue[0]) {
					let actualtrack = queue.shift()
					utils.track.editCurrent(actualtrack)
					db.set(`queue.${data.guildId}`, queue)
					sendWs({
						op: 'play'
						, track: utils.track.current()
							.track
						, guildId: data.guildId
					})
				} else if (typeof queue[0] == 'undefined') {
					const players = map.get('players') || {}
					players[data.guildId] = {
						...players[data.guildId]
						, playing: false
					}
					map.set('players', players)
					db.delete(`queue.${data.guildId}`)
					utils.track.editCurrent(null)
				}
				break
			}
			case 'WebSocketClosedEvent': {
				delete data.op
				delete data.type
				if (data.reason == 'Your session is no longer valid.') {
					this.manager.emit('warn', 'your session is no longer valid, check the raw event if everything is ok, also better activate the debug provided by your library.')
					this.emit('websocketClosed', data.reason)
				}
				break
			}
			default: {
				
                this.manager.emit('unknowTypeEmitted', `Moon Detected this type: "${data.type || 'no type received :('}" an unknow type that we detect.`)
			}
			}
			break
		default: {
			
            this.manager.emit('unknowOpEmitted', `Moon Detected this op: "${data.op || 'no op received :('}" an unknow op that we detect.`)
		}
		
                }
	})
    
            
            this.ws.on('error', (err) => { 
               this.manager.emit('nodeError', (no, err))
                this.manager.emit('debug', `[ ${no.host ? no.host : 'localhost'}${no.port ? ':' + no.port : ':443'} ]: Error: ${err} `)
                
             })
            
        })
    }
    ManagerNodes(node, ws) {
        this.manager.emit('debug', '[ Moonlink.js ]: a node is being configured')
        Nodes[`${node.host ? node.host : 'localhost'}${node.port ? ':' + node.port : ':443' }`] = {
            ws: this.ws,
            stats: this.stats,
            connected: true,
            calls: 0,
            node: node
        }
     
    }
    reconnect(node) {
		if (this.reconnectAtattempts >= this.retryAmount) {
			this.manager.emit('debug', '[ MoonLink.Js ]: unable to reconnect the node, and we have reached the reconnection limit, please check that this node is online, or verify that the information is correct')
			let isNode = Nodes[`${node.host ? node.host : 'localhost'}${node.port ? ':' + node.port : ':443' }`]
isNode.ws.close(1000, "destroy")
isNode.ws.removeAllListeners()
			delete Nodes[`${node.host ? node.host : 'localhost'}${node.port ? ':' + isNode.port : ':443' }`]
		} else {
			setTimeout(() => {
Node[`${node.host ? node.host : 'localhost'}${node.port ? ':' + node.port : ':443' }`].ws.removeAllListeners()
Node[`${node.host ? node.host : 'localhost'}${node.port ? ':' + node.port : ':443' }`].connected = false;
this.emit('nodeReconnect', node)
this.create([node], this.clientId)
this.manager.emit('debug', '[ MoonLink.Js ]: Trying to reconnect node, attempted number ' + this.reconnectAtattempts) 
 this.reconnectAtattempts++
			}, this.retryTime)
		}
	
      }
    
     get(identify) {
         if(identify) return undefined
         let node;
         if(typeof identify == 'Number') {
          node = Object.values(Nodes)
             } else {
                 if(Array.isArray(identify)) {
                     if(!identify.host || !identify.port) return undefined
                 if(!Nodes[`${identify.host ? identify.host : 'localhost'}${identify.port ? ':' + identify.port : ':443'}`]) return undefined 
                     node = Nodes[`${identify.host ? identify.host : 'localhost'}${identify.port ? ':' + identify.port : ':443'}`]
                     }
                 
             }
         return node ? node : undefined;
     }
     
     get size() {
         if(!Nodes) return 0
         return Nodes.length
      }
    }

module.exports = MoonlinkNodes