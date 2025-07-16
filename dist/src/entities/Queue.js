"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    database;
    guildId;
    player;
    constructor(player) {
        this.database = player.manager.database;
        this.guildId = player.guildId;
        this.player = player;
    }
    tracks = [];
    async add(track) {
        const tracksToAdd = Array.isArray(track) ? track : [track];
        const filteredTracks = tracksToAdd.filter(t => {
            if (this.player.manager.options.blacklistedSources && this.player.manager.options.blacklistedSources.includes(t.sourceName)) {
                this.player.manager.emit("debug", `Moonlink.js > Queue > Track from blacklisted source (${t.sourceName}) detected. Not adding to queue.`);
                this.player.manager.emit("trackBlacklisted", this.player, t);
                return false;
            }
            return true;
        });
        if (filteredTracks.length === 0)
            return true;
        this.tracks.push(...filteredTracks);
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        this.player.manager.emit("queueAdd", this.player, filteredTracks);
        return true;
    }
    get(position) {
        return this.tracks[position];
    }
    has(track) {
        return this.tracks.includes(track);
    }
    async remove(position) {
        const removed = this.tracks.splice(position, 1);
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        this.player.manager.emit("queueRemove", this.player, removed[0]);
        return true;
    }
    async shift() {
        let track = this.tracks.shift();
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        if (track) {
            this.player.manager.emit("queueRemove", this.player, track);
        }
        return track;
    }
    async unshift(track) {
        this.tracks.unshift(track);
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        this.player.manager.emit("queueAdd", this.player, track);
        return true;
    }
    async pop() {
        let tracks = this.tracks.pop();
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        if (tracks) {
            this.player.manager.emit("queueRemove", this.player, tracks);
        }
        return tracks;
    }
    async clear() {
        const clearedTracks = [...this.tracks];
        this.tracks = [];
        await this.database.remove(`queues.${this.guildId}`);
        this.player.manager.emit("queueRemove", this.player, clearedTracks);
        return true;
    }
    async shuffle() {
        this.tracks = this.tracks.sort(() => Math.random() - 0.5);
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return true;
    }
    async removeDuplicates() {
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
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return true;
    }
    async removeBlacklistedTracks() {
        if (!this.player.manager.options.blacklistedSources || this.player.manager.options.blacklistedSources.length === 0) {
            return false;
        }
        const initialSize = this.tracks.length;
        this.tracks = this.tracks.filter(track => {
            if (this.player.manager.options.blacklistedSources.includes(track.sourceName)) {
                this.player.manager.emit("debug", `Moonlink.js > Queue > Removing blacklisted track (${track.sourceName}) from queue.`);
                this.player.manager.emit("trackBlacklisted", this.player, track);
                return false;
            }
            return true;
        });
        if (this.tracks.length < initialSize) {
            await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
            return true;
        }
        return false;
    }
    async sortByTitle() {
        if (this.tracks.length < 2)
            return false;
        this.tracks.sort((a, b) => a.title.localeCompare(b.title));
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return true;
    }
    async sortByAuthor() {
        if (this.tracks.length < 2)
            return false;
        this.tracks.sort((a, b) => a.author.localeCompare(b.author));
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return true;
    }
    async sortByDuration() {
        if (this.tracks.length < 2)
            return false;
        this.tracks.sort((a, b) => a.duration - b.duration);
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return true;
    }
    get size() {
        return this.tracks.length;
    }
    get duration() {
        return this.tracks.reduce((acc, cur) => acc + cur.duration, 0);
    }
    get isEmpty() {
        return this.tracks.length === 0;
    }
    get first() {
        return this.tracks[0];
    }
    get last() {
        return this.tracks[this.tracks.length - 1];
    }
    get all() {
        return this.tracks;
    }
    find(query) {
        const searchTerm = query.toLowerCase();
        return this.tracks.find(t => t.identifier === query ||
            t.title.toLowerCase().includes(searchTerm));
    }
    async move(from, to) {
        if (from < 0 || to < 0 || from >= this.tracks.length || to >= this.tracks.length)
            return false;
        const track = this.tracks.splice(from, 1)[0];
        this.tracks.splice(to, 0, track);
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return true;
    }
    async moveRange(fromIndex, toIndex, count) {
        if (fromIndex < 0 || fromIndex >= this.tracks.length ||
            toIndex < 0 || toIndex > this.tracks.length ||
            count <= 0 || fromIndex + count > this.tracks.length) {
            return false;
        }
        const tracksToMove = this.tracks.splice(fromIndex, count);
        this.tracks.splice(toIndex, 0, ...tracksToMove);
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        this.player.manager.emit("queueMoveRange", this.player, tracksToMove, fromIndex, toIndex);
        return true;
    }
    async removeRange(startIndex, endIndex) {
        if (startIndex < 0 || startIndex >= this.tracks.length ||
            endIndex < startIndex || endIndex >= this.tracks.length) {
            return false;
        }
        const removedTracks = this.tracks.splice(startIndex, endIndex - startIndex + 1);
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        this.player.manager.emit("queueRemoveRange", this.player, removedTracks, startIndex, endIndex);
        return true;
    }
    async duplicate(index, count = 1) {
        if (index < 0 || index >= this.tracks.length || count <= 0) {
            return false;
        }
        const trackToDuplicate = this.tracks[index];
        const duplicatedTracks = [];
        for (let i = 0; i < count; i++) {
            duplicatedTracks.push(trackToDuplicate);
        }
        this.tracks.splice(index + 1, 0, ...duplicatedTracks);
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        this.player.manager.emit("queueDuplicate", this.player, duplicatedTracks, index);
        return true;
    }
    async jump(index) {
        if (index < 0 || index >= this.tracks.length)
            return false;
        if (index === 0)
            return true;
        const tracksToSkip = this.tracks.splice(0, index);
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return true;
    }
    slice(start, end) {
        return this.tracks.slice(start, end);
    }
    filter(predicate) {
        return this.tracks.filter(predicate);
    }
    async reverse() {
        this.tracks.reverse();
        await this.database.set(`queues.${this.guildId}`, { tracks: this.tracks.map(info => info.encoded) });
        return true;
    }
    get position() {
        return this.tracks.findIndex(track => track === this.first);
    }
    get previous() {
        return this.tracks.slice(0, this.position);
    }
}
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map