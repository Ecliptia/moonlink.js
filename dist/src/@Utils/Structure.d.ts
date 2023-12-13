import { INode, Extendable, SortType, createOptions } from "../@Typings";
import { MoonlinkManager, MoonlinkPlayer, MoonlinkNode } from "../..";
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
    static extend<K extends keyof Extendable, T extends Extendable[K]>(name: K, extender: (target: Extendable[K]) => T): T;
    static init(manager: MoonlinkManager): void;
    static get<K extends keyof Extendable>(name: K): Extendable[K];
}
export declare class Plugin {
    load(manager: MoonlinkManager): void;
}
