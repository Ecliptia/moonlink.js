"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    tracks = [];
    add(track) {
        this.tracks.push(track);
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
        return true;
    }
    shift() {
        return this.tracks.shift();
    }
    unshift(track) {
        this.tracks.unshift(track);
        return true;
    }
    pop() {
        return this.tracks.pop();
    }
    clear() {
        this.tracks = [];
        return true;
    }
    shuffle() {
        this.tracks = this.tracks.sort(() => Math.random() - 0.5);
        return true;
    }
    get size() {
        return this.tracks.length;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map