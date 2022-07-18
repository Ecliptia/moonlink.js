let { utils } = require('../structures/MoonLinkUtils.js')
var players = utils.map.get('players') || {}
var no = null
let listeners = {
	events: function (node, emit, received) {
		function sendWs(json) {
			let send = { error: false, message: '[ MoonLink.Js ]: MoonLink sent a request to lavalink.' }
			utils.node.get()
				.ws.send(JSON.stringify(json), (error) => { if (error) { send = { error: true, message: error } } })
			emit.emit('debug', send.message)
		}
		const data = JSON.parse(received)
		no = node
		emit.emit('raw', data)
		if (data.op && data.op == 'stats') {
			utils.node.statsEditSystem(no, data)
		}
		switch (data.op) {
		case 'playerUpdate': {
			let track = utils.track.current()
			let infoUpdate = { ...track, position: data.state.position }
			utils.track.editCurrent(infoUpdate)
			emit.emit('playerUpdate', data)
			break
		}
		case 'event':
			switch (data.type) {
			case 'TrackStartEvent': {
				let map = utils.map
				let players = map.get('players') || {}
				emit.emit('trackStart', players[data.guildId], utils.track.current())
				break
			}
			case 'TrackEndEvent': {
				let db = utils.db
				let track = utils.track.current()
				let map = utils.map
				let players = map.get('players') || {}
				emit.emit('trackEnd', players[data.guildId], track)
				let queue = db.get('queue.' + data.guildId)
				if (utils.track.skip()) {
					utils.track.skipEdit(false)
					return;
				}
				if (players[data.guildId].loop == 1) {
					sendWs({
						op: 'play'
						, track: utils.track.current()
							.track
						, guildId: data.guildId
					})
				}
				if (players[data.guildId].loop == 2) {
					if (!queue) {
						return
					} else {
						let o = utils.track.current()
							.track
						db.push(`queue.${data.guildId}`, o)
						let a = queue.shift()
						utils.track.editCurrent(a)
						db.set(`queue.${data.guildId}`, queue)
						sendWs({
							op: 'play'
							, track: utils.track.current()
								.track
							, guildId: data.guildId
						})
					}
				}
				if (!queue) {
					emit.emit('debug', '[ MoonLink.Js ]: The queue is empt')
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
				break;
			}
			case 'TrackExceptionEvent': {
				delete data.op
				delete data.type
				db.delete(`queue.${data.guildId}`)
				delete map.get('players')[data.guildId]
				emit.emit('trackException', data)
				emit.emit('warn', '[ MoonLink.Js ]: It looks like something when trying to play the track, this is not caused by a MoonLink bug, check your lavalink console or report to lavalink.')
				break
			}
			case 'TrackStuckEvent': {
				delete data.op
				delete data.type
				emit.emit('warn', `[ MoonLink.Js ]: it looks like the track got stuck, this is not caused by a MoonLink bug, if continues report to lavalink.`)
				let track = utils.track.current()
				emit.emit('trackEnd', track)
				let queue = db.get('queue.' + data.guildId)
				let players = map.get('players') || {}
				if (players[data.guildId].loop == true) {
					sendWs({
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
					this.emit('warn', 'your session is no longer valid, check the raw event if everything is ok, also better activate the debug provided by your library.')
					this.emit('websocketClosed', data.reason)
				}
				break
			}
			default: {
				emit.emit('unknowTypeEmitted', `Moon Detected this type: "${data.type || 'no type received :('}" an unknow type that we detect.`)
			}
			}
			break
		default: {
			emit.emit('unknowOpEmitted', `Moon Detected this op: "${data.op || 'no op received :('}" an unknow op that we detect.`)
		}
		}
	}
}
module.exports = { listeners }
