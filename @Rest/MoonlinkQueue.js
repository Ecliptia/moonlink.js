"use strict";
let utils = require('../@Rest/MoonlinkUtils.js')
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
		if (!db.get(`queue.${this.guildId}`)) return null
		if (Array.isArray(queue)) {
			return queue[0]
		} else if (queue && queue.length > 0 && queue[0]) return queue
		else queue[0]
	}

	get all() {
		if (!db.get('queue.' + this.guildId)) {
			return null
		} else {
			return db.get(`queue.${this.guildId}`)
		}
	}
  
  clear() {
    if(!db.get(`queue.${this.guildId}`))
      throw new TypeError(`[ MoonlinkJs ]: unable to clear a non-existent queue.`)

    db.delete(`queue.${this.guildId}`)

    return true
  }

  get size() {
    return db.get(`queue.${this.guildId}`) ? db.get(`queue.${this.guildId}`).length : 0
  }
}

module.exports.MoonQueue = MoonQueue
