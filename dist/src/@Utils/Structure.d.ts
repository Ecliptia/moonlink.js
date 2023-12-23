/// <reference types="node" />
import { EventEmitter } from "node:events";
import { INode, Extendable, SortType, createOptions } from "../@Typings";
import { MoonlinkManager, MoonlinkPlayer, MoonlinkDatabase, MoonlinkNode, WebSocket } from "../../index";
export declare class Players {
    _manager: MoonlinkManager;
    map: Map<any, any>;
    constructor();
    init(): void;
    handleVoiceServerUpdate(update: any, guildId: string): void;
    handlePlayerDisconnect(player: MoonlinkPlayer, guildId: string): void;
    handlePlayerMove(player: MoonlinkPlayer, newChannelId: string, oldChannelId: string, guildId: string): void;
    updateVoiceStates(guildId: string, update: any): void;
    attemptConnection(guildId: string): Promise<boolean>;
    has(guildId: string): boolean;
    get(guildId: string): MoonlinkPlayer | null;
    create(data: createOptions): MoonlinkPlayer;
    get all(): Record<string, any>;
}
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
    getNodeLinks(): MoonlinkNode[];
    sortByUsage(sortType: SortType): MoonlinkNode[];
    private sortNodesByMemoryUsage;
    private sortNodesByLavalinkCpuLoad;
    private sortNodesBySystemCpuLoad;
    private sortNodesByCalls;
    private sortNodesByPlayingPlayers;
    private sortNodesByPlayers;
}
export interface ReceiveEvents {
    startSpeaking: (data: any) => void;
    endSpeaking: (data: any) => void;
    open: () => void;
    close: () => void;
    error: (err: any) => void;
}
export declare interface Receive {
    on<K extends keyof ReceiveEvents>(event: K, listener: ReceiveEvents[K]): this;
    once<K extends keyof ReceiveEvents>(event: K, listener: ReceiveEvents[K]): this;
    emit<K extends keyof ReceiveEvents>(event: K, ...args: Parameters<ReceiveEvents[K]>): boolean;
    off<K extends keyof ReceiveEvents>(event: K, listener: ReceiveEvents[K]): this;
}
export declare class Receive extends EventEmitter {
    player: MoonlinkPlayer;
    socket: WebSocket | null;
    canBeUsed: boolean;
    constructor(player: MoonlinkPlayer);
    check(): void;
    start(): void;
    stop(): boolean;
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
