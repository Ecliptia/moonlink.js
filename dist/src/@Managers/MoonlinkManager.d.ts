/// <reference types="node" />
import { EventEmitter } from "node:events";
import { MoonlinkPlayer, MoonlinkNode, Players, Nodes } from "../../index";
import { INode, IOptions, VoicePacket, SearchResult, SearchQuery } from "../@Typings";
export interface MoonlinkEvents {
    autoLeaved: (player: MoonlinkPlayer, track?: any) => void;
    debug: (...args: any) => void;
    nodeCreate: (node: MoonlinkNode) => void;
    nodeDestroy: (node: MoonlinkNode) => void;
    nodeReconnect: (node: MoonlinkNode) => void;
    nodeClose: (node: MoonlinkNode, code: number, reason: any) => void;
    nodeRaw: (node: MoonlinkNode, payload: object) => void;
    nodeError: (node: MoonlinkNode, error: Error) => void;
    trackStart: (player: MoonlinkPlayer, current: any) => void;
    trackEnd: (player: MoonlinkPlayer, track: any, payload?: any) => void;
    trackStuck: (player: MoonlinkPlayer, track: any) => void;
    trackError: (player: MoonlinkPlayer, track: any) => void;
    queueEnd: (player: MoonlinkPlayer, track?: any) => void;
    playerCreated: (guildId: string) => void;
    playerDisconnect: (player: MoonlinkPlayer) => void;
    playerResume: (player: MoonlinkPlayer) => void;
    playerMove: (player: MoonlinkPlayer, newVoiceChannel: string, oldVoiceChannel: string) => void;
    socketClosed: (player: MoonlinkPlayer, track: any) => void;
}
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
    init(clientId?: string): this;
    search(options: string | SearchQuery): Promise<SearchResult>;
    packetUpdate(packet: VoicePacket): void;
}
