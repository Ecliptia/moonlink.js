import { EventEmitter } from "node:events";
import { IEvents, IConfigManager, IOptionsManager, IPlayerConfig, ISearchResult } from "../typings/Interfaces";
import { TSearchSources } from "../typings/types";
import { NodeManager, PlayerManager, Player } from "../../index";
export declare interface Manager {
    on<K extends keyof IEvents>(event: K, listener: IEvents[K]): this;
    once<K extends keyof IEvents>(event: K, listener: IEvents[K]): this;
    emit<K extends keyof IEvents>(event: K, ...args: Parameters<IEvents[K]>): boolean;
    off<K extends keyof IEvents>(event: K, listener: IEvents[K]): this;
}
export declare class Manager extends EventEmitter {
    initialize: boolean;
    readonly options: IOptionsManager;
    readonly sendPayload: Function;
    nodes: NodeManager;
    players: PlayerManager;
    version: string;
    constructor(config: IConfigManager);
    init(clientId: string): void;
    search(options: {
        query: string;
        source?: TSearchSources;
        node?: string;
        requester?: unknown;
    }): Promise<ISearchResult>;
    packetUpdate(packet: any): void;
    attemptConnection(guildId: string): Promise<boolean>;
    createPlayer(config: IPlayerConfig): Player;
    getPlayer(guildId: string): Player;
}
