/// <reference types="node" />
import { EventEmitter } from "node:events";
import { MoonlinkNode } from "./MoonlinkNodes";
import { MoonlinkPlayer } from "./MoonlinkPlayers";
import { MoonlinkTrack } from "../@Rest/MoonlinkTrack";
import { Plugin } from "../@Rest/Plugin";
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
export interface customOptions {
    player?: Constructor<MoonlinkPlayer>;
}
export interface Options {
    clientName?: string;
    reconnectAtattemps?: number;
    retryTime?: number;
    retryAmount?: number;
    resumeKey?: string;
    resumeTimeout?: number;
    autoResume?: boolean;
    plugins?: Plugin[];
    spotify?: spotifyOptions;
    custom?: customOptions;
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
export type LoadType = "track" | "playlist" | "search" | "empty" | "error";
export interface TrackData {
    encoded?: string;
    info: TrackDataInfo;
    pluginInfo: object;
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
    tracks: MoonlinkTrack[];
    playlistInfo?: PlaylistInfo;
    exception?: {
        message: string;
        severity: string;
    };
}
export interface playersOptions {
    create: (data: createOptions) => MoonlinkPlayer;
    get: (guildId: string) => MoonlinkPlayer | null;
    has: (guildId: string) => boolean;
    all: any;
}
export interface PlaylistInfo {
    name: string;
    selectedTrack?: MoonlinkTrack;
    duration: number;
}
export interface LavalinkResult {
    data: TrackData[];
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
/**
 * Creates a new MoonlinkManager instance.
 * @param {Nodes[]} nodes - An array of objects containing information about the Lavalink nodes.
 * @param {Options} options - An object containing options for the MoonlinkManager.
 * @param {Function} sPayload - A function to send payloads to the Lavalink nodes.
 * @returns {MoonlinkManager} - The new MoonlinkManager instance.
 * @throws {Error} - If the nodes parameter is empty or not an array.
 * @throws {Error} - If there are no parameters with node information in the nodes object.
 * @throws {Error} - If the clientName option is not set correctly.
 * @throws {RangeError} - If a plugin is not compatible.
 */
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
    /**
    * Initializes the MoonlinkManager by connecting to the Lavalink nodes.
    * @param {string} clientId - The ID of the Discord client.
    * @returns {MoonlinkManager} - The MoonlinkManager instance.
    * @throws {TypeError} - If the clientId option is empty.
    */
    init(clientId: string): this;
    /**
 * Adds a new Lavalink node to the MoonlinkManager.
 * @param {Node} node - An object containing information about the Lavalink node.
 * @returns {Node} - The added node.
 * @throws {Error} - If the host option is not configured correctly.
 * @throws {Error} - If the password option is not set correctly.
 * @throws {Error} - If the port option is not set correctly.
 */
    addNode(node: Nodes): Nodes;
    /**
     * Removes a Lavalink node from the MoonlinkManager.
     * @param {string} name - The name or identifier of the node to remove.
     * @returns {boolean} - True if the node is removed, false otherwise.
     * @throws {Error} - If the name option is empty.
     */
    removeNode(name: string): boolean;
    get leastUsedNodes(): any;
    packetUpdate(packet: VoicePacket): Promise<boolean>;
    /**
 * Searches for tracks using the specified query and source.
 * @param {string | SearchQuery} options - The search query or an object containing the search options.
 * @returns {Promise<SearchResult>} - A promise that resolves with the search result.
 * @throws {Error} - If the search option is empty or not in the correct format.
 */
    search(options: string | SearchQuery): Promise<SearchResult>;
    attemptConnection(guildId: string): Promise<boolean>;
    get players(): playersOptions;
}
