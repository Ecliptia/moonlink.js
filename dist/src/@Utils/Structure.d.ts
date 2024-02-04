import { INode, Extendable, SortType } from "../@Typings";
import { MoonlinkManager, MoonlinkDatabase, MoonlinkNode } from "../../index";
export declare const State: {
    READY: string;
    CONNECTED: string;
    CONNECTING: string;
    DISCONNECTING: string;
    DISCONNECTED: string;
    RECONNECTING: string;
    AUTORESUMING: string;
    RESUMING: string;
    MOVING: string;
};
export declare class Nodes {
    initiated: boolean;
    _manager: MoonlinkManager;
    map: Map<any, any>;
    constructor();
    init(): void;
    check(): void;
    add(node: INode): void;
    remove(name: string): boolean;
    get(name: any): any;
    sortByUsage(sortType: SortType): MoonlinkNode[];
    private sortNodesByMemoryUsage;
    private sortNodesByLavalinkCpuLoad;
    private sortNodesBySystemCpuLoad;
    private sortNodesByCalls;
    private sortNodesByPlayingPlayers;
    private sortNodesByPlayers;
}
export declare abstract class Structure {
    static manager: MoonlinkManager;
    static db: MoonlinkDatabase;
    static extend<K extends keyof Extendable, T extends Extendable[K]>(name: K, extender: (target: Extendable[K]) => T): T;
    static init(manager: MoonlinkManager): void;
    static get<K extends keyof Extendable>(name: K): Extendable[K];
}
export declare class Plugin {
    load(manager: MoonlinkManager): void;
}
