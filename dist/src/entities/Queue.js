"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue extends Array {
    manager;
    constructor(manager) {
        super();
        this.manager = manager;
    }
    get size() {
        return this.length;
    }
    get first() {
        return this[0];
    }
    add(track) {
        const tracks = Array.isArray(track) ? track : [track];
        const maxSize = this.manager.options.queue?.maxSize ?? 1000;
        const allowDuplicates = this.manager.options.queue?.allowDuplicates ?? true;
        for (const t of tracks) {
            if (t === undefined || t === null)
                continue;
            if (maxSize !== "unlimited" && this.length >= maxSize) {
                this.manager.emit("debug", `Moonlink.js > Queue >> Max queue size (${maxSize}) reached. Cannot add more tracks.`);
                break;
            }
            if (!allowDuplicates && this.some(existing => existing.encoded === t.encoded)) {
                this.manager.emit("debug", `Moonlink.js > Queue >> Duplicate track not allowed. Track: ${t.title}`);
                continue;
            }
            this.push(t);
        }
    }
    remove(index = 0) {
        if (index < 0 || index >= this.length)
            return undefined;
        return this.splice(index, 1)[0];
    }
    clear() {
        this.splice(0, this.length);
    }
    shuffle() {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
    }
}
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map