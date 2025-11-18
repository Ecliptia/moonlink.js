import { Track } from "./Track";
import type { Manager } from "../core/Manager";
import type { Player } from "./Player";

export class Queue {
    private player: Player;
    private manager: Manager;
    public tracks: Track[] = [];

    constructor(player: Player) {
        this.player = player;
        this.manager = player.manager;
    }

    private async _save(): Promise<void> {
        await this.manager.database.set(`moonlink.${this.manager.clientId}.queue.${this.player.guildId}`, this.tracks.map(t => t.toJSON()));
    }

    public get size(): number {
        return this.tracks.length;
    }

    public get first(): Track | undefined {
        return this.tracks[0];
    }

    public get last(): Track | undefined {
        return this.tracks[this.tracks.length - 1];
    }

    public get isEmpty(): boolean {
        return this.tracks.length === 0;
    }

    public get duration(): number {
        return this.tracks.reduce((acc, cur) => acc + cur.duration, 0);
    }

    public get all(): Track[] {
        return this.tracks;
    }

    public add(track: Track | Track[]): void {
        const tracksToAdd = Array.isArray(track) ? track : [track];
        const maxSize = this.manager.options.queue?.maxSize ?? 1000;
        const allowDuplicates = this.manager.options.queue?.allowDuplicates ?? true;

        let addedTracks: Track[] = [];

        for (const t of tracksToAdd) {
            if (t === undefined || t === null) continue;

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

    public get(position: number): Track | undefined {
        return this.tracks[position];
    }

    public has(track: Track): boolean {
        return this.tracks.includes(track);
    }

    public remove(index: number = 0): Track | undefined {
        if (index < 0 || index >= this.tracks.length) return undefined;
        const removedTrack = this.tracks.splice(index, 1)[0];
        if (removedTrack) {
            this.manager.emit("queueRemove", this.player, removedTrack);
            this._save();
        }
        return removedTrack;
    }

    public shift(): Track | undefined {
        const track = this.tracks.shift();
        if (track) {
            this.manager.emit("queueRemove", this.player, track);
            this._save();
        }
        return track;
    }

    public unshift(track: Track): void {
        this.tracks.unshift(track);
        this.manager.emit("queueAdd", this.player, track);
        this._save();
    }

    public pop(): Track | undefined {
        const track = this.tracks.pop();
        if (track) {
            this.manager.emit("queueRemove", this.player, track);
            this._save();
        }
        return track;
    }

    public clear(): void {
        const oldQueue = [...this.tracks];
        this.tracks = [];
        this.manager.emit("queueRemove", this.player, oldQueue);
        this._save();
    }

    public shuffle(): void {
        for (let i = this.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
        }
        this._save();
    }

    public removeDuplicates(): boolean {
        if (this.tracks.length < 2) return false;

        const uniqueTracks: Track[] = [];
        const seenEncoded: Set<string> = new Set();
        const removedTracks: Track[] = [];

        for (const track of this.tracks) {
            if (!seenEncoded.has(track.encoded)) {
                uniqueTracks.push(track);
                seenEncoded.add(track.encoded);
            } else {
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

    public sortByTitle(): void {
        if (this.tracks.length < 2) return;
        this.tracks.sort((a, b) => a.title.localeCompare(b.title));
        this._save();
    }

    public sortByAuthor(): void {
        if (this.tracks.length < 2) return;
        this.tracks.sort((a, b) => a.author.localeCompare(b.author));
        this._save();
    }

    public sortByDuration(): void {
        if (this.tracks.length < 2) return;
        this.tracks.sort((a, b) => a.duration - b.duration);
        this._save();
    }

    public find(query: string): Track | undefined {
        const searchTerm = query.toLowerCase();
        return this.tracks.find(t => 
            t.identifier === query || 
            t.title.toLowerCase().includes(searchTerm)
        );
    }

    public move(from: number, to: number): boolean {
        if (from < 0 || to < 0 || from >= this.tracks.length || to >= this.tracks.length) return false;
        
        const track = this.tracks.splice(from, 1)[0];
        this.tracks.splice(to, 0, track);
        this.manager.emit("queueMoveRange", this.player, [track], from, to);
        this._save();
        return true;
    }

    public moveRange(fromIndex: number, toIndex: number, count: number): boolean {
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

    public removeRange(startIndex: number, endIndex: number): boolean {
        if (startIndex < 0 || startIndex >= this.tracks.length ||
            endIndex < startIndex || endIndex >= this.tracks.length) {
            return false;
        }

        const removed = this.tracks.splice(startIndex, endIndex - startIndex + 1);
        this.manager.emit("queueRemoveRange", this.player, removed, startIndex, endIndex);
        this._save();
        return true;
    }

    public duplicate(index: number, count: number = 1): boolean {
        if (index < 0 || index >= this.tracks.length || count <= 0) {
            return false;
        }

        const trackToDuplicate = this.tracks[index];
        const duplicatedTracks: Track[] = [];
        for (let i = 0; i < count; i++) {
            duplicatedTracks.push(trackToDuplicate);
        }

        this.tracks.splice(index + 1, 0, ...duplicatedTracks);
        this.manager.emit("queueDuplicate", this.player, duplicatedTracks, index);
        this._save();
        return true;
    }

    public jump(index: number): boolean {
        if (index < 0 || index >= this.tracks.length) return false;
        if (index === 0) return true;

        const removed = this.tracks.splice(0, index);
        this.manager.emit("queueRemoveRange", this.player, removed, 0, index - 1);
        this._save();
        return true;
    }

    public slice(start: number, end?: number): Track[] {
        return this.tracks.slice(start, end);
    }

    public filter(predicate: (track: Track) => boolean): Track[] {
        return this.tracks.filter(predicate);
    }

    public reverse(): void {
        this.tracks.reverse();
        this._save();
    }

    public [Symbol.iterator](): Iterator<Track> {
        return this.tracks[Symbol.iterator]();
    }

    public map<U>(callback: (track: Track, index: number, array: Track[]) => U): U[] {
        return this.tracks.map(callback);
    }
}
