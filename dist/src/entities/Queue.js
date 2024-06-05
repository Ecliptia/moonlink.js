"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    tracks = [];
    add(track) {
        this.tracks.push(track);
        return true;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map