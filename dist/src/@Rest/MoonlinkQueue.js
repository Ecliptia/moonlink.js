"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkQueue = void 0;
const MoonlinkDatabase_1 = require("./MoonlinkDatabase");
class MoonlinkQueue {
    db;
    guildId;
    manager;
    constructor(manager, data) {
        this.db = new MoonlinkDatabase_1.MoonlinkDatabase();
        this.guildId = data.guildId;
        this.manager = manager;
    }
    add(data) {
        if (!data)
            throw new Error('[ @Moonlink/Queue ]: "data" option is empty');
        let queue = this.db.get(`queue.${this.guildId}`);
        if (Array.isArray(queue)) {
            this.db.push(`queue.${this.guildId}`, data);
        }
        else if (queue && queue.length > 0 && queue[0]) {
            queue = [queue, data];
            this.db.set(`queue.${this.guildId}`, queue);
        }
        else {
            this.db.push(`queue.${this.guildId}`, data);
        }
    }
    first() {
        let queue = this.db.get(`queue.${this.guildId}`) || null;
        if (!queue)
            return null;
        if (Array.isArray(queue)) {
            return queue[0];
        }
        else if (queue && queue.length > 0 && queue[0])
            return queue;
        else
            queue[0];
    }
    clear() {
        let queue = this.db.get(`queue.${this.guildId}`) || null;
        if (!queue)
            return false;
        this.db.delete(`queue.${this.guildId}`);
        return true;
    }
    get size() {
        return this.db.get(`queue.${this.guildId}`) ? this.db.get(`queue.${this.guildId}`).length : 0;
    }
    remove(position) {
        if (!position && typeof position !== 'number')
            throw new Error('[ @Moonlink/Queue ]: option "position" is empty or different from number');
        if (!this.size)
            throw new Error('[ @Moonlink/Queue ]: the queue is empty');
        let queue = this.db.get(`queue.${this.guildId}`);
        if (!queue[position - 1])
            throw new Error('[ @Moonlink/Queue ]: indicated position is undefined');
        queue.splice(position - 1, 1);
        this.db.set(`queue.${this.guildId}`, queue);
        return true;
    }
    get all() {
        return this.db.get(`queue.${this.guildId}`) ? this.db.get(`queue.${this.guildId}`) : null;
    }
}
exports.MoonlinkQueue = MoonlinkQueue;
//# sourceMappingURL=MoonlinkQueue.js.map