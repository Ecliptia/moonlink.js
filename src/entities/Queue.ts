import { Track } from "./Track";
import type { Manager } from "../core/Manager";

export class Queue {
    private manager: Manager;
    public tracks: Track[] = [];

    constructor(manager: Manager) {
        this.manager = manager;
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
        return this.tracks.splice(index, 1)[0];
    }

    public shift(): Track | undefined {
        return this.tracks.shift();
    }

    public unshift(track: Track): void {
        this.tracks.unshift(track);
    }

    public pop(): Track | undefined {
        return this.tracks.pop();
    }

    public clear(): void {
        this.tracks = [];
    }

    public shuffle(): void {
        for (let i = this.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
        }
    }

    public removeDuplicates(): boolean {
        if (this.tracks.length < 2) return false;

        const uniqueTracks: Track[] = [];
        const seenEncoded: Set<string> = new Set();

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

    public sortByTitle(): void {
        if (this.tracks.length < 2) return;
        this.tracks.sort((a, b) => a.title.localeCompare(b.title));
    }

    public sortByAuthor(): void {
        if (this.tracks.length < 2) return;
        this.tracks.sort((a, b) => a.author.localeCompare(b.author));
    }

    public sortByDuration(): void {
        if (this.tracks.length < 2) return;
        this.tracks.sort((a, b) => a.duration - b.duration);
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
        return true;
    }

    public removeRange(startIndex: number, endIndex: number): boolean {
        if (startIndex < 0 || startIndex >= this.tracks.length ||
            endIndex < startIndex || endIndex >= this.tracks.length) {
            return false;
        }

        this.tracks.splice(startIndex, endIndex - startIndex + 1);
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
        return true;
    }

    public jump(index: number): boolean {
        if (index < 0 || index >= this.tracks.length) return false;
        if (index === 0) return true;

        this.tracks.splice(0, index);
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
    }

    public [Symbol.iterator](): Iterator<Track> {
        return this.tracks[Symbol.iterator]();
    }

    public map<U>(callback: (track: Track, index: number, array: Track[]) => U): U[] {
        return this.tracks.map(callback);
    }
}
