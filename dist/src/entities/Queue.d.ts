import { Database, Player, Track } from "../../index";
export declare class Queue {
    database: Database;
    guildId: string;
    constructor(player: Player);
    tracks: Track[];
    add(track: Track | Track[]): boolean;
    get(position: number): Track;
    has(track: Track): boolean;
    remove(position: number): boolean;
    shift(): Track;
    unshift(track: Track): boolean;
    pop(): Track;
    clear(): boolean;
    shuffle(): boolean;
    get size(): number;
    get duration(): number;
    get isEmpty(): boolean;
    get first(): Track;
    get last(): Track;
    get all(): Track[];
    find(query: string): Track | undefined;
    move(from: number, to: number): boolean;
    slice(start: number, end?: number): Track[];
    filter(predicate: (track: Track) => boolean): Track[];
    reverse(): boolean;
    get position(): number;
    get previous(): Track[];
}
