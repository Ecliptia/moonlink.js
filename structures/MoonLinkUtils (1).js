let MemoryNode = []
let IdealNode = null
let CurrentTrack = null
let sendDiscord = null
let skipMem = null
let database = require('simpl.db')
let db = new database({
	autoSave: true
	, collectionsFolder: './collections'
	, dataFile: 'database.json'
})
let node = {
	set: function (node, ws) {
		IdealNode = [node, ws]
	}
	, get: function () {
		if (!IdealNode) {
			let node = Object.values(MemoryNode)
				.filter((x) => x.ws._readyState === 1)
				.sort((b, a) => a.stats.cpu ? (a.stats.cpu.systemLoad / a.stats.cpu.cores) * 100 : 0 - b.stats.cpu ? (b.stats.cpu.systemLoad / b.stats.cpu.cores) * 100 : 0)[0]
			if (!node) throw new Error('there are no nodes online!')
			if (node) IdealNode = node
		}
		if (IdealNode) return IdealNode
	}
	, add: function (node, ws) {
		MemoryNode[node.identifier || `${node.host}${node.port !== undefined ? `:${node.port}` : `` }`] = {
			node
			, ws: ws
			, stats: {
				players: 0
				, playingPlayers: 0
				, uptime: 0
				, memory: {
					free: 0
					, used: 0
					, allocated: 0
					, reservable: 0
				}
				, cpu: {
					cores: 0
					, systemLoad: 0
					, lavalinkLoad: 0
				}
			}
		}
	}
	, all: function () {
		return MemoryNode
	}
	, remove: function (no) {
		delete MemoryNode[no.identifier || `${no.host}${no.port !== undefined ? `:${no.port}` : `` }`]
		let node = Object.values(MemoryNode)
			.filter((x) => x.ws._readyState === 1)
			.sort((b, a) => a.stats.cpu ? (a.stats.cpu.systemLoad / a.stats.cpu.cores) * 100 : 0 - b.stats.cpu ? (b.stats.cpu.systemLoad / b.stats.cpu.cores) * 100 : 0)[0]
		if (node) IdealNode = node
	}
	, statsEditSystem: function (node, data) {
		MemoryNode[node.indentifier || `${node.host}${node.port !== undefined ? `:${node.port}` : `` }`].stats = data
	}
	, getStatsNode: function (node) {
		let data = MemoryNode[node.indentifier || `${node.host}${node.port !== undefined ? `:${node.port}` : `` }`].stats
		if (data) return data;
	}
}
let track = {
	skip: function () {
		return skipMem || false
	}
	, skipEdit: function (i) {
		delete skipMem
		skipMem = i
	}
	, current: function () {
		return CurrentTrack
	}
	, editCurrent: function (track) {
		if (typeof track == 'undefined') throw new Error('[ MoonLink.Js ]: An internal error occurred, report to developers')
		if (track) CurrentTrack = track
	}
}

function editSendDs(x) {
	sendDiscord = x
}

function sendDs() {
	return sendDiscord
}

function request(node, endpoint, params) {
	return fetch(`http${node.secure ? 's' : ''}://${node.host}${node.port ? `:${node.port}` : ``}/${endpoint}?${params}`, {
			headers: {
				Authorization: node.password
			}
		})
		.then(res => res.json())
	
	function debug(a, o) {
		a.emit('debug', (o))
	}
}
let up = false
let update = function () {
	return up
}
let autoUpdate = function () {
	up = true
}
module.exports.utils = {
	node
	, track
	, db
	, sendDs
	, editSendDs
	, map: new Map()
	, request
	, autoUpdate
	, update
}
