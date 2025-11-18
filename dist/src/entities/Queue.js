"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    player;
    manager;
    tracks = [];
    constructor(player) {
        this.player = player;
        this.manager = player.manager;
    }
    async _save() {
        await this.manager.database.set(`moonlink.${this.manager.clientId}.queue.${this.player.guildId}`, this.tracks.map(t => t.toJSON()));
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
        let addedTracks = [];
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
            addedTracks.push(t);
        }
        if (addedTracks.length > 0) {
            this.manager.emit("queueAdd", this.player, addedTracks.length === 1 ? addedTracks[0] : addedTracks);
            this._save();
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
        const removedTrack = this.tracks.splice(index, 1)[0];
        if (removedTrack) {
            this.manager.emit("queueRemove", this.player, removedTrack);
            this._save();
        }
        return removedTrack;
    }
    shift() {
        const track = this.tracks.shift();
        if (track) {
            this.manager.emit("queueRemove", this.player, track);
            this._save();
        }
        return track;
    }
    unshift(track) {
        this.tracks.unshift(track);
        this.manager.emit("queueAdd", this.player, track);
        this._save();
    }
    pop() {
        const track = this.tracks.pop();
        if (track) {
            this.manager.emit("queueRemove", this.player, track);
            this._save();
        }
        return track;
    }
    clear() {
        const oldQueue = [...this.tracks];
        this.tracks = [];
        this.manager.emit("queueRemove", this.player, oldQueue);
        this._save();
    }
    shuffle() {
        for (let i = this.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
        }
        this._save();
    }
    removeDuplicates() {
        if (this.tracks.length < 2)
            return false;
        const uniqueTracks = [];
        const seenEncoded = new Set();
        const removedTracks = [];
        for (const track of this.tracks) {
            if (!seenEncoded.has(track.encoded)) {
                uniqueTracks.push(track);
                seenEncoded.add(track.encoded);
            }
            else {
                removedTracks.push(track);
            }
        }
        if (uniqueTracks.length === this.tracks.length) {
            return false;
        }
        this.tracks = uniqueTracks;
        if (removedTracks.length > 0) {
            this.manager.emit("queueRemove", this.player, removedTracks);
        }
        this._save();
        return true;
    }
    sortByTitle() {
        if (this.tracks.length < 2)
            return;
        this.tracks.sort((a, b) => a.title.localeCompare(b.title));
        this._save();
    }
    sortByAuthor() {
        if (this.tracks.length < 2)
            return;
        this.tracks.sort((a, b) => a.author.localeCompare(b.author));
        this._save();
    }
    sortByDuration() {
        if (this.tracks.length < 2)
            return;
        this.tracks.sort((a, b) => a.duration - b.duration);
        this._save();
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
        this.manager.emit("queueMoveRange", this.player, [track], from, to);
        this._save();
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
        this.manager.emit("queueMoveRange", this.player, tracksToMove, fromIndex, toIndex);
        this._save();
        return true;
    }
    removeRange(startIndex, endIndex) {
        if (startIndex < 0 || startIndex >= this.tracks.length ||
            endIndex < startIndex || endIndex >= this.tracks.length) {
            return false;
        }
        const removed = this.tracks.splice(startIndex, endIndex - startIndex + 1);
        this.manager.emit("queueRemoveRange", this.player, removed, startIndex, endIndex);
        this._save();
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
        this.manager.emit("queueDuplicate", this.player, duplicatedTracks, index);
        this._save();
        return true;
    }
    jump(index) {
        if (index < 0 || index >= this.tracks.length)
            return false;
        if (index === 0)
            return true;
        const removed = this.tracks.splice(0, index);
        this.manager.emit("queueRemoveRange", this.player, removed, 0, index - 1);
        this._save();
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
        this._save();
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