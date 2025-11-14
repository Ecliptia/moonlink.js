import { Track } from "./Track";
import type { Manager } from "../core/Manager";
export declare class Queue extends Array<Track> {
    private manager;
    constructor(manager: Manager);
    get size(): number;
    get first(): Track | undefined;
    add(track: Track | Track[]): void;
    remove(index?: number): Track | undefined;
    clear(): void;
    shuffle(): void;
}
