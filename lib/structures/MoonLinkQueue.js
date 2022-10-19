"use strict";
let { utils } = require('../structures/MoonLinkUtils.js')
let db = utils.db
const map = new Map();
class MoonQueue {
	constructor(data) {
		this.guildId = data.guildId
	}
	add(track) {
		if (!track) throw new Error('[ MoonLink.Js ]: Track object must have a value')
		let queue = db.get(`queue.${this.guildId}`)
		if (Array.isArray(queue)) {
			db.push(`queue.${this.guildId}`, track)
		} else if (queue && queue.length > 0 && queue[0]) {
			let newQueue = [queue, track]
			db.set(`queue.${this.guildId}`, newQueue)
		} else {
			db.push(`queue.${this.guildId}`, track)
		}
	}
	first() {
		let queue = db.get(`queue.${this.guildId}`)
		if (!db.has(`queue.${this.guildId}`)) return null
		if (Array.isArray(queue)) {
			return queue[0]
		} else if (queue && queue.length > 0 && queue[0]) return queue
		else queue[0]
	}
	get all() {
		if (!db.has('queue.' + this.guildId)) {
			return null
		} else {
			return db.get(`queue.${this.guildId}`)
		}
	}
   clear() {
      if(!db.get(`queue.${this.guildId}`)) {
    throw new TypeError(`[ MoonlinkJs ]: unable to clear a non-existent queue.`)
} else {
    db.delete(`queue.${this.guildId}`)
    return true
}
   }
    get size() {
        if(!db.get(`queue.${this.guildId}`)) {
            return 0
        } else {
            return db.get(`queue.${this.guildId}`).length
        }
    }
}
module.exports.MoonQueue = MoonQueue
