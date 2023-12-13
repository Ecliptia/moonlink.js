/// <reference types="node" />
import { EventEmitter } from "node:events";
import { Players, Nodes } from "../@Utils/Structure";
import { INode, IOptions, VoicePacket, SearchResult, SearchQuery } from "../@Typings";
export declare class MoonlinkManager extends EventEmitter {
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
