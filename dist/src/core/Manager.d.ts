import { EventEmitter } from "node:events";
import { IEvents, IConfigManager, IOptionsManager, IPlayerConfig, ILavaLyricsObject, ILavaLyricsLine } from "../typings/Interfaces";
import { TSearchSources } from "../typings/types";
import { DatabaseManager, NodeManager, PlayerManager, SourceManager, Player, SearchResult, PluginManager } from "../../index";
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
    database: DatabaseManager;
    sources: SourceManager;
    pluginManager: PluginManager;
    private lyricsResultCache;
    constructor(config: IConfigManager);
    init(clientId: string): Promise<void>;
    search(options: {
        query: string;
        source?: TSearchSources;
        node?: string;
        requester?: unknown;
        fallbackSources?: TSearchSources[];
        limit?: number;
    }): Promise<SearchResult>;
    lavaSearch(options: {
        query: string;
        source?: TSearchSources;
        node?: string;
        requester?: unknown;
        types?: string;
    }): Promise<SearchResult>;
    packetUpdate(packet: any): Promise<void>;
    private _handleVoiceServerUpdate;
    private _handleVoiceStateUpdate;
    attemptConnection(guildId: string): Promise<boolean>;
    getLyrics(options: {
        player?: Player;
        encodedTrack?: string;
        videoId?: string;
        skipTrackSource?: boolean;
        provider?: 'lavalyrics' | 'lyrics' | 'java-lyrics-plugin';
    }): Promise<ILavaLyricsObject | null>;
    clearLyricsCacheForGuild(guildId: string): void;
    searchLyrics(options: {
        query: string;
        provider?: 'lavalyrics' | 'lyrics' | 'java-lyrics-plugin';
        node?: string;
        source?: string;
    }): Promise<any[] | null>;
    subscribeLyrics(guildId: string, callback: (line: ILavaLyricsLine) => void, skipTrackSource?: boolean, provider?: 'lavalyrics' | 'lyrics' | 'java-lyrics-plugin'): Promise<void>;
    unsubscribeLyrics(guildId: string, provider?: 'lavalyrics' | 'lyrics' | 'java-lyrics-plugin'): Promise<void>;
    createPlayer(config: IPlayerConfig): Player;
    getPlayer(guildId: string): Player;
    hasPlayer(guildId: string): boolean;
    deletePlayer(guildId: string): boolean;
    getAllPlayers(): Map<string, Player>;
}
