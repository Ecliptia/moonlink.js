"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    manager;
    tracks = [];
    constructor(manager) {
        this.manager = manager;
    }
    get size() {
        return this.tracks.length;
    }
    get first() {
        return this.tracks[0];
    }
    get last() {
        return this.tracks[this.tracks.length - 1];
    }
    get isEmpty() {
        return this.tracks.length === 0;
    }
    get duration() {
        return this.tracks.reduce((acc, cur) => acc + cur.duration, 0);
    }
    get all() {
        return this.tracks;
    }
    add(track) {
        const tracksToAdd = Array.isArray(track) ? track : [track];
        const maxSize = this.manager.options.queue?.maxSize ?? 1000;
        const allowDuplicates = this.manager.options.queue?.allowDuplicates ?? true;
        for (const t of tracksToAdd) {
            if (t === undefined || t === null)
                continue;
            if (maxSize !== "unlimited" && this.tracks.length >= maxSize) {
                this.manager.emit("debug", `Moonlink.js > Queue >> Max queue size (${maxSize}) reached. Cannot add more tracks.`);
                break;
            }
            if (!allowDuplicates && this.tracks.some(existing => existing.encoded === t.encoded)) {
                this.manager.emit("debug", `Moonlink.js > Queue >> Duplicate track not allowed. Track: ${t.title}`);
                continue;
            }
            this.tracks.push(t);
        }
    }
    get(position) {
        return this.tracks[position];
    }
    has(track) {
        return this.tracks.includes(track);
    }
    remove(index = 0) {
        if (index < 0 || index >= this.tracks.length)
            return undefined;
        return this.tracks.splice(index, 1)[0];
    }
    shift() {
        return this.tracks.shift();
    }
    unshift(track) {
        this.tracks.unshift(track);
    }
    pop() {
        return this.tracks.pop();
    }
    clear() {
        this.tracks = [];
    }
    shuffle() {
        for (let i = this.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
        }
    }
    removeDuplicates() {
        if (this.tracks.length < 2)
            return false;
        const uniqueTracks = [];
        const seenEncoded = new Set();
        for (const track of this.tracks) {
            if (!seenEncoded.has(track.encoded)) {
                uniqueTracks.push(track);
                seenEncoded.add(track.encoded);
            }
        }
        if (uniqueTracks.length === this.tracks.length) {
            return false;
        }
        this.tracks = uniqueTracks;
        return true;
    }
    sortByTitle() {
        if (this.tracks.length < 2)
            return;
        this.tracks.sort((a, b) => a.title.localeCompare(b.title));
    }
    sortByAuthor() {
        if (this.tracks.length < 2)
            return;
        this.tracks.sort((a, b) => a.author.localeCompare(b.author));
    }
    sortByDuration() {
        if (this.tracks.length < 2)
            return;
        this.tracks.sort((a, b) => a.duration - b.duration);
    }
    find(query) {
        const searchTerm = query.toLowerCase();
        return this.tracks.find(t => t.identifier === query ||
            t.title.toLowerCase().includes(searchTerm));
    }
    move(from, to) {
        if (from < 0 || to < 0 || from >= this.tracks.length || to >= this.tracks.length)
            return false;
        const track = this.tracks.splice(from, 1)[0];
        this.tracks.splice(to, 0, track);
        return true;
    }
    moveRange(fromIndex, toIndex, count) {
        if (fromIndex < 0 || fromIndex >= this.tracks.length ||
            toIndex < 0 || toIndex > this.tracks.length ||
            count <= 0 || fromIndex + count > this.tracks.length) {
            return false;
        }
        const tracksToMove = this.tracks.splice(fromIndex, count);
        this.tracks.splice(toIndex, 0, ...tracksToMove);
        return true;
    }
    removeRange(startIndex, endIndex) {
        if (startIndex < 0 || startIndex >= this.tracks.length ||
            endIndex < startIndex || endIndex >= this.tracks.length) {
            return false;
        }
        this.tracks.splice(startIndex, endIndex - startIndex + 1);
        return true;
    }
    duplicate(index, count = 1) {
        if (index < 0 || index >= this.tracks.length || count <= 0) {
            return false;
        }
        const trackToDuplicate = this.tracks[index];
        const duplicatedTracks = [];
        for (let i = 0; i < count; i++) {
            duplicatedTracks.push(trackToDuplicate);
        }
        this.tracks.splice(index + 1, 0, ...duplicatedTracks);
        return true;
    }
    jump(index) {
        if (index < 0 || index >= this.tracks.length)
            return false;
        if (index === 0)
            return true;
        this.tracks.splice(0, index);
        return true;
    }
    slice(start, end) {
        return this.tracks.slice(start, end);
    }
    filter(predicate) {
        return this.tracks.filter(predicate);
    }
    reverse() {
        this.tracks.reverse();
    }
    [Symbol.iterator]() {
        return this.tracks[Symbol.iterator]();
    }
    map(callback) {
        return this.tracks.map(callback);
    }
}
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map