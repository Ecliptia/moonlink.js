let MemoryNode = []
let IdealNode = null
let CurrentTrack = null
let sendDiscord = null
let skipMem = null 
let database = require('./MoonlinkDatabase.js')

let makeRequest = require('./MakeRequest.js')
let db = new database()

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

function esdw(x) {
	sendDiscord = x
}

function sendDs() {
	return sendDiscord
}
    
function request(node, endpoint, params) {
	return makeRequest(`http${node.secure ? 's' : ''}://${node.host}${node.port ? `:${node.port}` : ``}/${endpoint}?${params}`, 'GET' ,{
			headers: {
				Authorization: node.password
			}
		})
	
}

module.exports = {
	track
	, db
	, sendDs
	, esdw
	, map: new Map()
	, request 
    , makeRequest
    , filters: []
    
}