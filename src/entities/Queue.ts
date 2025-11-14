import { Track } from "./Track";
import type { Manager } from "../core/Manager";

export class Queue extends Array<Track> {
    private manager: Manager;

    constructor(manager: Manager) {
        super();
        this.manager = manager;
    }

    public get size(): number {
        return this.length;
    }

    public get first(): Track | undefined {
        return this[0];
    }

    public add(track: Track | Track[]): void {
        const tracks = Array.isArray(track) ? track : [track];
        const maxSize = this.manager.options.queue?.maxSize ?? 1000;
        const allowDuplicates = this.manager.options.queue?.allowDuplicates ?? true;

        for (const t of tracks) {
            if (t === undefined || t === null) continue;

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

    public remove(index: number = 0): Track | undefined {
        if (index < 0 || index >= this.length) return undefined;
        return this.splice(index, 1)[0];
    }

    public clear(): void {
        this.splice(0, this.length);
    }

    public shuffle(): void {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
    }
}
