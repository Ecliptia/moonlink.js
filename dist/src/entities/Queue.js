"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    database;
    guildId;
    constructor(player) {
        this.database = player.manager.database;
        this.guildId = player.guildId;
    }
    tracks = [];
    add(track) {
        this.tracks.push(track);
        this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return true;
    }
    get(position) {
        return this.tracks[position];
    }
    has(track) {
        return this.tracks.includes(track);
    }
    remove(position) {
        this.tracks.splice(position, 1);
        this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return true;
    }
    shift() {
        let track = this.tracks.shift();
        this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return track;
    }
    unshift(track) {
        this.tracks.unshift(track);
        this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return true;
    }
    pop() {
        let tracks = this.tracks.pop();
        this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return tracks;
    }
    clear() {
        this.tracks = [];
        this.database.delete(`queues.${this.guildId}`);
        return true;
    }
    shuffle() {
        this.tracks = this.tracks.sort(() => Math.random() - 0.5);
        this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return true;
    }
    get size() {
        return this.tracks.length;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map