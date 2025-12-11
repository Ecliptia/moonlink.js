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
    _updateQueue() {
        this.player.updateData('queue', this.tracks.map(t => ({ encoded: t.encoded, requester: t.requester })));
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
    get remainingDuration() {
        const queueDuration = this.duration;
        const currentTrackRemaining = this.player.current
            ? Math.max(0, this.player.current.duration - this.player.current.position)
            : 0;
        return queueDuration + currentTrackRemaining;
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
            this._updateQueue();
        }
    }
    insert(index, track) {
        const tracksToAdd = Array.isArray(track) ? track : [track];
        const maxSize = this.manager.options.queue?.maxSize ?? 1000;
        if (maxSize !== "unlimited" && this.tracks.length + tracksToAdd.length > maxSize) {
            this.manager.emit("debug", `Moonlink.js > Queue >> Max queue size (${maxSize}) reached. Cannot insert more tracks.`);
            return;
        }
        this.tracks.splice(index, 0, ...tracksToAdd);
        this.manager.emit("queueAdd", this.player, tracksToAdd.length === 1 ? tracksToAdd[0] : tracksToAdd);
        this._updateQueue();
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
            this._updateQueue();
        }
        return removedTrack;
    }
    shift() {
        const track = this.tracks.shift();
        if (track) {
            this.manager.emit("queueRemove", this.player, track);
            this._updateQueue();
        }
        return track;
    }
    unshift(track) {
        this.tracks.unshift(track);
        this.manager.emit("queueAdd", this.player, track);
        this._updateQueue();
    }
    pop() {
        const track = this.tracks.pop();
        if (track) {
            this.manager.emit("queueRemove", this.player, track);
            this._updateQueue();
        }
        return track;
    }
    clear() {
        const oldQueue = [...this.tracks];
        this.tracks = [];
        this.manager.emit("queueRemove", this.player, oldQueue);
        this._updateQueue();
    }
    shuffle() {
        for (let i = this.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
        }
        this._updateQueue();
    }
    shuffleRange(start, end) {
        if (start < 0 || end >= this.tracks.length || start >= end)
            return;
        const chunk = this.tracks.slice(start, end + 1);
        for (let i = chunk.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [chunk[i], chunk[j]] = [chunk[j], chunk[i]];
        }
        this.tracks.splice(start, chunk.length, ...chunk);
        this._updateQueue();
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
        this._updateQueue();
        return true;
    }
    sortByTitle() {
        if (this.tracks.length < 2)
            return;
        this.tracks.sort((a, b) => a.title.localeCompare(b.title));
        this._updateQueue();
    }
    sortByAuthor() {
        if (this.tracks.length < 2)
            return;
        this.tracks.sort((a, b) => a.author.localeCompare(b.author));
        this._updateQueue();
    }
    sortByDuration() {
        if (this.tracks.length < 2)
            return;
        this.tracks.sort((a, b) => a.duration - b.duration);
        this._updateQueue();
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
        this._updateQueue();
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
        this._updateQueue();
        return true;
    }
    removeRange(startIndex, endIndex) {
        if (startIndex < 0 || startIndex >= this.tracks.length ||
            endIndex < startIndex || endIndex >= this.tracks.length) {
            return false;
        }
        const removed = this.tracks.splice(startIndex, endIndex - startIndex + 1);
        this.manager.emit("queueRemoveRange", this.player, removed, startIndex, endIndex);
        this._updateQueue();
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
        this._updateQueue();
        return true;
    }
    jump(index) {
        if (index < 0 || index >= this.tracks.length)
            return false;
        if (index === 0)
            return true;
        const removed = this.tracks.splice(0, index);
        this.manager.emit("queueRemoveRange", this.player, removed, 0, index - 1);
        this._updateQueue();
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
        this._updateQueue();
    }
    [Symbol.iterator]() {
        return this.tracks[Symbol.iterator]();
    }
    map(callback) {
        return this.tracks.map(callback);
    }
    at(index) {
        const actualIndex = index < 0 ? this.tracks.length + index : index;
        return this.tracks[actualIndex];
    }
    swap(index1, index2) {
        if (index1 < 0 || index1 >= this.tracks.length || index2 < 0 || index2 >= this.tracks.length)
            return false;
        [this.tracks[index1], this.tracks[index2]] = [this.tracks[index2], this.tracks[index1]];
        this._updateQueue();
        return true;
    }
    replace(index, track) {
        if (index < 0 || index >= this.tracks.length)
            return false;
        this.tracks[index] = track;
        this._updateQueue();
        return true;
    }
    removeWhere(predicate) {
        const removed = [];
        const kept = [];
        for (const track of this.tracks) {
            if (predicate(track)) {
                removed.push(track);
            }
            else {
                kept.push(track);
            }
        }
        if (removed.length > 0) {
            this.tracks = kept;
            this.manager.emit("queueRemove", this.player, removed);
            this._updateQueue();
        }
        return removed;
    }
    truncate(size) {
        if (size < 0 || size >= this.tracks.length)
            return false;
        const removed = this.tracks.splice(size, this.tracks.length - size);
        if (removed.length > 0) {
            this.manager.emit("queueRemoveRange", this.player, removed, size, this.tracks.length + removed.length);
            this._updateQueue();
            return true;
        }
        return false;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map