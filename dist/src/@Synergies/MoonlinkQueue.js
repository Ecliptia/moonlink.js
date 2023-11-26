"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkQueue = void 0;
const index_1 = require("../../index");
class MoonlinkQueue {
    db;
    guildId;
    manager;
    constructor(manager, data) {
        if (!manager || !data || !data.guildId) {
            throw new Error("[ @Moonlink/Queue ]: Invalid constructor arguments");
        }
        this.db = new index_1.MoonlinkDatabase(manager.clientId);
        this.guildId = data.guildId;
        this.manager = manager;
    }
    add(data, position) {
        if (!data)
            throw new Error('[ @Moonlink/Queue ]: "data" option is empty');
        let queue = this.getQueue();
        position =
            position !== undefined && position >= 1 ? position - 1 : queue.length;
        if (position < 0 || position > queue.length) {
            throw new Error("[ @Moonlink/Queue ]: Invalid position specified");
        }
        queue.splice(position, 0, data);
        this.setQueue(queue);
    }
    first() {
        const queue = this.getQueue();
        return queue.length > 0 ? queue[0] : null;
    }
    clear() {
        const queue = this.getQueue();
        if (queue.length > 0) {
            this.setQueue([]);
            return true;
        }
        return false;
    }
    get size() {
        return this.getQueue().length;
    }
    remove(position) {
        if (!position || typeof position !== "number" || position < 1) {
            throw new Error("[ @Moonlink/Queue ]: Invalid position specified");
        }
        const queue = this.getQueue();
        if (position > queue.length) {
            throw new Error("[ @Moonlink/Queue ]: Position exceeds queue length");
        }
        queue.splice(position - 1, 1);
        this.setQueue(queue);
        return true;
    }
    get all() {
        return this.getQueue();
    }
    getQueue() {
        return this.db.get(`queue.${this.guildId}`) || [];
    }
    setQueue(queue) {
        this.db.set(`queue.${this.guildId}`, queue);
    }
}
exports.MoonlinkQueue = MoonlinkQueue;
//# sourceMappingURL=MoonlinkQueue.js.map