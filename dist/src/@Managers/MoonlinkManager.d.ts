/// <reference types="node" />
import { EventEmitter } from "node:events";
import { MoonlinkPlayer, MoonlinkTrack, MoonlinkNode, PlayerManager, NodeManager } from "../../index";
import { INode, IOptions, VoicePacket, SearchResult, SearchQuery } from "../@Typings";
export interface MoonlinkEvents {
    autoLeaved: (player: MoonlinkPlayer, track?: any) => void;
    debug: (...args: any) => void;
    nodeCreate: (node: MoonlinkNode) => void;
    nodeReady: (node: MoonlinkNode, sessionId: string, resumed: boolean) => void;
    nodeDestroy: (node: MoonlinkNode) => void;
    nodeResumed: (node: MoonlinkNode, players: MoonlinkEvents[]) => void;
    nodeReconnect: (node: MoonlinkNode) => void;
    nodeClose: (node: MoonlinkNode, code: number, reason: any) => void;
    nodeRaw: (node: MoonlinkNode, payload: object) => void;
    nodeError: (node: MoonlinkNode, error: Error) => void;
    trackStart: (player: MoonlinkPlayer, current: any) => void;
    trackEnd: (player: MoonlinkPlayer, track: any, payload?: any) => void;
    trackStuck: (player: MoonlinkPlayer, track: any) => void;
    trackError: (player: MoonlinkPlayer, track: any) => void;
    queueEnd: (player: MoonlinkPlayer, track?: any) => void;
    playerConnected: (player: MoonlinkPlayer) => void;
    playerCreated: (guildId: string) => void;
    playerPaused: (player: MoonlinkPlayer) => void;
    playerRestarted: (player: MoonlinkPlayer) => void;
    playerResume: (player: MoonlinkPlayer) => void;
    playerStopped: (player: MoonlinkPlayer, current: MoonlinkTrack) => void;
    playerSetVoiceChannel: (player: MoonlinkPlayer, oldChannel: string, newChannel: string) => void;
    playerAutoPlayTriggered: (player: MoonlinkPlayer, mode: boolean) => void;
    playerAutoLeaveTriggered: (player: MoonlinkPlayer, mode: boolean) => void;
    playerSetTextChannel: (player: MoonlinkPlayer, oldChannel: string, newChannel: string) => void;
    playerVolumeChanged: (player: MoonlinkPlayer, oldVolume: number, newVolume: number) => void;
    playerSkipped: (player: MoonlinkPlayer, oldCurrent: MoonlinkTrack, newCurrent: MoonlinkTrack) => void;
    playerSeeking: (player: MoonlinkPlayer, oldPosition: number, newPosition: number) => void;
    playerLoopSet: (player: MoonlinkPlayer, oldMode: number, mode: number) => void;
    playerShuffled: (player: MoonlinkPlayer, oldQueue: unknown[], newQueue: MoonlinkTrack[], status: boolean) => void;
    playerMove: (player: MoonlinkPlayer, newVoiceChannel: string, oldVoiceChannel: string) => void;
    playerDisconnect: (player: MoonlinkPlayer) => void;
    playerDestroyed: (guildId: string) => void;
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
    readonly players: PlayerManager;
    readonly nodes: NodeManager;
    readonly version: number;
    options: IOptions;
    initiated: boolean;
    constructor(nodes: INode[], options: IOptions, SPayload: Function);
    init(clientId?: string): this;
    search(options: string | SearchQuery): Promise<SearchResult>;
    packetUpdate(packet: VoicePacket): void;
}
