/// <reference types="node" />
import { EventEmitter } from "node:events";
import { IEvents, IConfigManager, IOptionsManager } from "../typings/Interfaces";
import { NodeManager, PlayerManager } from "../../index";
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
    packetHandler(packet: any): void;
    attemptConnection(): void;
}
