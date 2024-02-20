import {
    MoonlinkDatabase,
    MoonlinkManager,
    MoonlinkTrack,
    Structure
} from "../..";

export class MoonlinkQueue {
    public db: MoonlinkDatabase = Structure.db;
    private guildId: string;
    private manager: MoonlinkManager;
    constructor(manager: MoonlinkManager, guildId: string) {
        if (!manager || !guildId) {
            throw new Error(
                "[ @Moonlink/Queue ]: Invalid constructor arguments"
            );
        }

        this.guildId = guildId;
        this.manager = Structure.manager;
    }

    public add(data: MoonlinkTrack, position?: number): void {
        if (!data)
            throw new Error('[ @Moonlink/Queue ]: "data" option is empty');

        let queue = this.getQueue();
        position =
            position !== undefined && position >= 1
                ? position - 1
                : queue.length;

        if (position < 0 || position > queue.length) {
            throw new Error("@Moonlink(Queue) - Invalid position specified");
        }

        queue.splice(position, 0, data);

        this.setQueue(queue);
    }
    public has(identifier: string): boolean {
        if (!identifier || typeof identifier !== "string") {
            throw new Error("@Moonlink(Queue) - Invalid identifier specified");
        }

        const queue = this.getQueue();
        return queue.some(track => track.identifier === identifier);
    }
    public first(): any {
        const queue = this.getQueue();
        return queue.length > 0 ? queue[0] : null;
    }

    public shift(): any {
        let queue = this.getQueue();
        if (!queue.length) return null;
        let track = queue.shift();
        this.setQueue(queue);

        return track;
    }

    public push(data: any): void {
        let queue = this.getQueue();
        queue.push(data);
        this.setQueue(queue);
    }

    public clear(): boolean {
        const queue = this.getQueue();
        if (queue.length > 0) {
            this.setQueue([]);
            return true;
        }
        return false;
    }

    public get size(): number {
        return this.getQueue().length;
    }

    public shuffle(): boolean {
        const currentQueue: MoonlinkTrack[] = this.all;

        for (let i = currentQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentQueue[i], currentQueue[j]] = [
                currentQueue[j],
                currentQueue[i]
            ];
        }

        this.setQueue(currentQueue);

        return true;
    }

    public remove(position: number): boolean {
        if (!position || typeof position !== "number" || position < 1) {
            throw new Error("[ @Moonlink/Queue ]: Invalid position specified");
        }

        const queue = this.getQueue();

        if (position > queue.length) {
            throw new Error(
                "[ @Moonlink/Queue ]: Position exceeds queue length"
            );
        }

        queue.splice(position - 1, 1);
        this.setQueue(queue);
        return true;
    }

    public get all(): any {
        return this.getQueue();
    }

    public getQueue(): MoonlinkTrack[] {
        return this.db.get(`queue.${this.guildId}`) || [];
    }

    public setQueue(queue: MoonlinkTrack[]): void {
        this.db.set(`queue.${this.guildId}`, queue);
    }
}
