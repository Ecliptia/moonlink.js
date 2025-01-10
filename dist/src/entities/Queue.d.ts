import { Database, Player, Track } from "../../index";
export declare class Queue {
    database: Database;
    guildId: string;
    constructor(player: Player);
    tracks: Track[];
    add(track: Track): boolean;
    get(position: number): Track;
    has(track: Track): boolean;
    remove(position: number): boolean;
    shift(): Track;
    unshift(track: Track): boolean;
    pop(): Track;
    clear(): boolean;
    shuffle(): boolean;
    get size(): number;
}
