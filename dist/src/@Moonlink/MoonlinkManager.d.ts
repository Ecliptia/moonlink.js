/// <reference types="node" />
import { EventEmitter } from "node:events";
import { MoonlinkNode } from "./MoonlinkNodes";
import { MoonlinkPlayer, Track } from "./MoonlinkPlayers";
import { Spotify } from "../@Sources/Spotify";
import { Deezer } from "../@Sources/Deezer";
export type Constructor<T> = new (...args: any[]) => T;
export interface Nodes {
    host: string;
    port?: number;
    identifier?: string;
    secure?: boolean;
    password?: string | null;
}
export interface spotifyOptions {
    clientId?: string;
    clientSecret?: string;
}
export interface Options {
    clientName?: string;
    spotify: spotifyOptions;
}
export interface createOptions {
    guildId: string;
    textChannel: string;
    voiceChannel: string;
    autoPlay?: boolean | null;
}
export interface VoiceState {
    op: "voiceUpdate";
    guildId: string;
    event: VoiceServer;
    sessionId?: string;
}
export interface VoiceServer {
    token: string;
    guild_id: string;
    endpoint: string;
}
export interface VoiceState {
    guild_id: string;
    user_id: string;
    session_id: string;
    channel_id: string;
}
export interface VoicePacket {
    t?: "VOICE_SERVER_UPDATE" | "VOICE_STATE_UPDATE";
    d: VoiceState | VoiceServer;
}
export type LoadType = "TRACK_LOADED" | "PLAYLIST_LOADED" | "SEARCH_RESULT" | "LOAD_FAILED" | "NO_MATCHES";
export interface TrackData {
    track?: string;
    trackEncoded?: string;
    encoded?: string;
    info: TrackDataInfo;
}
export interface TrackDataInfo {
    title: string;
    identifier: string;
    author: string;
    length: number;
    position: number;
    isSeekable: boolean;
    isStream: boolean;
    uri: string;
}
export type SearchPlatform = "youtube" | "youtubemusic" | "soundcloud" | "spotify" | "deezer";
export interface SearchQuery {
    source?: SearchPlatform | string | undefined | null;
    query: string;
}
export interface SearchResult {
    loadType: LoadType;
    tracks: Track[];
    playlist?: PlaylistInfo;
    exception?: {
        message: string;
        severity: string;
    };
}
export interface playersOptions {
    create: Function;
    get: Function;
    has: Function;
}
export interface PlaylistInfo {
    name: string;
    selectedTrack?: Track;
    duration: number;
}
export interface LavalinkResult {
    tracks: TrackData[];
    loadType: LoadType;
    exception?: {
        message: string;
        severity: string;
    };
    playlistInfo: {
        name: string;
        selectedTrack?: number;
    };
}
export interface MoonlinkEvents {
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
    playerDisconnect: (player: MoonlinkPlayer) => void;
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
    readonly _nodes: Nodes[];
    readonly _sPayload: Function;
    initiated: boolean;
    options: Options;
    nodes: Map<string, Nodes>;
    spotify: Spotify;
    deezer: Deezer;
    sendWs: any;
    clientId: string;
    version: string;
    map: Map<string, any>;
    constructor(nodes: Nodes[], options: Options, sPayload: Function);
    init(clientId: string): this;
    addNode(node: Nodes): Nodes;
    removeNode(name: string): boolean;
    get leastUsedNodes(): any;
    packetUpdate(packet: VoicePacket): Promise<boolean>;
    search(options: string | SearchQuery): Promise<SearchResult>;
    attemptConnection(guildId: string): Promise<boolean>;
    get players(): playersOptions;
}
