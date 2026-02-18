import { type NodeLinkResponse, type ResponseWithHeaders } from "../Util";
import type { IChapter, IFilters, ILyricsData, IMeaningResponse, INodeConnectionStatus } from "../typings/Interfaces";
import { Node } from "./Node";
import { IRESTLoadTracks, IRESTGetPlayers, ITrack, INodeStats, IRoutePlannerStatus } from "../typings/Interfaces";
export declare class RestError extends Error {
    statusCode: number;
    isSessionExpired: boolean;
    constructor(message: string, statusCode: number);
}
export declare class Rest {
    private readonly node;
    private readonly authHeaders;
    private readonly jsonHeaders;
    private readonly userAgentHeaders;
    private sessionRecoveryInProgress;
    constructor(node: Node);
    get url(): string;
    private triggerPlayerRecovery;
    getPlayers(): Promise<IRESTGetPlayers[] | null>;
    getPlayer(guildId: string): Promise<any | null>;
    updatePlayer(guildId: string, data: any, noReplace?: boolean): Promise<any | null>;
    destroyPlayer(guildId: string): Promise<void>;
    loadTracks(identifier: string): Promise<IRESTLoadTracks>;
    decodeTrack(encodedTrack: string): Promise<ITrack | null>;
    decodeTracks(encodedTracks: string[]): Promise<ITrack[] | null>;
    getInfo(): Promise<any | null>;
    getInfoWithHeaders(): Promise<ResponseWithHeaders<any> | null>;
    getVersion(timeout?: number, retries?: number): Promise<string | null>;
    getStats(): Promise<INodeStats | null>;
    getRoutePlannerStatus(): Promise<IRoutePlannerStatus | null>;
    freeFailedAddress(address: string): Promise<void>;
    freeAllFailedAddresses(): Promise<void>;
    updateSession(resuming: boolean, timeout: number): Promise<any | null>;
    addMixLayer(guildId: string, data: {
        track: {
            encoded: string;
            userData?: Record<string, any>;
        };
        volume?: number;
    }): Promise<any | null>;
    getMixLayers(guildId: string): Promise<any | null>;
    updateMixLayerVolume(guildId: string, mixId: string, volume: number): Promise<void>;
    removeMixLayer(guildId: string, mixId: string): Promise<void>;
    loadLyrics(encodedTrack: string, lang?: string): Promise<NodeLinkResponse<ILyricsData | Record<string, any>> | null>;
    loadChapters(encodedTrack: string): Promise<NodeLinkResponse<IChapter[]> | null>;
    loadMeaning(encodedTrack: string, lang?: string): Promise<NodeLinkResponse<IMeaningResponse | Record<string, any>> | null>;
    getConnectionStatus(): Promise<NodeLinkResponse<INodeConnectionStatus> | null>;
    getMetrics(): Promise<string | null>;
    getWorkers(): Promise<NodeLinkResponse<any[]> | null>;
    patchWorker(payload: Record<string, any>): Promise<any | null>;
    getYoutubeConfig(validate?: boolean): Promise<any | null>;
    updateYoutubeConfig(payload: {
        refreshToken?: string;
        visitorData?: string;
    }): Promise<any | null>;
    exchangeYoutubeOAuth(refreshToken: string): Promise<any | null>;
    encodeTrackRemote(track: string): Promise<string | null>;
    encodeTracksRemote(tracks: Array<{
        encoded: string;
        info: Record<string, any>;
    }>): Promise<string[] | null>;
    trackStream(encodedTrack: string, itag?: number | null): Promise<any | null>;
    loadStream(payload: {
        encodedTrack: string;
        volume?: number;
        position?: number;
        filters?: IFilters | Record<string, any>;
    }): Promise<{
        stream: NodeJS.ReadableStream;
        headers: Record<string, any>;
    }>;
    subscribeLyrics(guildId: string, skipTrackSource?: boolean): Promise<void>;
    unsubscribeLyrics(guildId: string): Promise<void>;
}
