/// <reference types="node" />
import { EventEmitter } from "node:events";
import { Players, Nodes } from "../@Utils/Structure";
import { INode, IOptions, VoicePacket, SearchResult, SearchQuery, MoonlinkEvents } from "../@Typings";
export declare interface MoonlinkManager {
    on<K extends keyof MoonlinkEvents>(event: K, listener: MoonlinkEvents[K]): this;
    once<K extends keyof MoonlinkEvents>(event: K, listener: MoonlinkEvents[K]): this;
    emit<K extends keyof MoonlinkEvents>(event: K, ...args: Parameters<MoonlinkEvents[K]>): boolean;
    off<K extends keyof MoonlinkEvents>(event: K, listener: MoonlinkEvents[K]): this;
}
export declare class MoonlinkManager extends EventEmitter {
    clientId: string;
    readonly _nodes: INode[];
    readonly _SPayload: Function;
    readonly players: Players;
    readonly nodes: Nodes;
    readonly version: number;
    options: IOptions;
    initiated: boolean;
    constructor(nodes: INode[], options: IOptions, SPayload: Function);
    init(clientId?: number): this;
    search(options: string | SearchQuery): Promise<SearchResult>;
    packetUpdate(packet: VoicePacket): void;
}
