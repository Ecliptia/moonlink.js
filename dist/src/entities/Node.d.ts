import { IManagerNodeConfig, INodeStats, ITrack, ILyricsData, IFilters } from "../typings/Interfaces";
import type { Manager } from "../core/Manager";
import { Rest } from "./Rest";
import { type NodeLinkResponse } from "../Util";
import { WebSocket } from "../services/WebSocket";
import { NodeState, TrackEndReason } from "../typings/types";
import { Track } from "./Track";
import { YouTubeLiveChat, YouTubeLiveChatOptions } from "./YouTubeLiveChat";
type LavalinkEventBase = {
    op: "event";
    guildId: string;
};
type TrackStartEvent = LavalinkEventBase & {
    type: "TrackStartEvent";
    track: ITrack;
};
type TrackEndEvent = LavalinkEventBase & {
    type: "TrackEndEvent";
    track: ITrack | null;
    reason: TrackEndReason;
};
type TrackStuckEvent = LavalinkEventBase & {
    type: "TrackStuckEvent";
    thresholdMs: number;
};
type TrackExceptionEvent = LavalinkEventBase & {
    type: "TrackExceptionEvent";
    exception: {
        severity: string;
        message?: string;
    } & Record<string, any>;
};
type MixStartedEvent = LavalinkEventBase & {
    type: "MixStartedEvent";
    mixId: string;
    track: ITrack;
    volume: number;
};
type MixEndedEvent = LavalinkEventBase & {
    type: "MixEndedEvent";
    mixId: string;
    reason: string;
};
type LyricsNotFoundEvent = LavalinkEventBase & {
    type: "LyricsNotFoundEvent";
};
type LyricsFoundEvent = LavalinkEventBase & {
    type: "LyricsFoundEvent";
    lyrics?: Record<string, any>;
};
type LyricsLineEvent = LavalinkEventBase & {
    type: "LyricsLineEvent";
    lineIndex?: number;
    line?: Record<string, any>;
    skipped?: boolean;
};
type ConnectionStatusEvent = LavalinkEventBase & {
    type: "ConnectionStatusEvent";
    status?: string;
    connected?: boolean;
};
type VolumeChangedEvent = LavalinkEventBase & {
    type: "VolumeChangedEvent";
    volume?: number;
};
type FiltersChangedEvent = LavalinkEventBase & {
    type: "FiltersChangedEvent";
    filters?: Record<string, any>;
};
type SeekEvent = LavalinkEventBase & {
    type: "SeekEvent";
    position?: number;
};
type PauseEvent = LavalinkEventBase & {
    type: "PauseEvent";
    paused?: boolean;
};
type PlayerCreatedEvent = LavalinkEventBase & {
    type: "PlayerCreatedEvent";
    player?: Record<string, any>;
};
type PlayerDestroyedEvent = LavalinkEventBase & {
    type: "PlayerDestroyedEvent";
};
type PlayerReconnectingEvent = LavalinkEventBase & {
    type: "PlayerReconnectingEvent";
    reason?: string;
};
type PlayerConnectedEvent = LavalinkEventBase & {
    type: "PlayerConnectedEvent";
    voice?: Record<string, any>;
};
type EternalBoxInfoEvent = LavalinkEventBase & {
    type: "EternalBoxInfoEvent";
    info?: Record<string, any>;
};
type EternalBoxJumpEvent = LavalinkEventBase & {
    type: "EternalBoxJumpEvent";
    track?: ITrack;
};
type StreamMetadataEvent = LavalinkEventBase & {
    type: "StreamMetadataEvent";
    metadata?: Record<string, any>;
};
type WebSocketClosedEvent = LavalinkEventBase & {
    type: "WebSocketClosedEvent";
    code: number;
    reason: string;
    byRemote: boolean;
};
type WorkerFailedEvent = {
    op: "event";
    type: "WorkerFailedEvent";
    affectedGuilds: string[];
    message?: string;
};
type LavalinkEventPayload = TrackStartEvent | TrackEndEvent | TrackStuckEvent | TrackExceptionEvent | MixStartedEvent | MixEndedEvent | ConnectionStatusEvent | VolumeChangedEvent | FiltersChangedEvent | SeekEvent | PauseEvent | PlayerCreatedEvent | PlayerDestroyedEvent | PlayerReconnectingEvent | PlayerConnectedEvent | EternalBoxInfoEvent | EternalBoxJumpEvent | StreamMetadataEvent | LyricsFoundEvent | LyricsLineEvent | LyricsNotFoundEvent | WebSocketClosedEvent | WorkerFailedEvent;
export declare class Node {
    readonly manager: Manager;
    readonly uuid: string;
    host: string;
    port: number;
    identifier: string;
    password: string;
    pathVersion: string;
    connected: boolean;
    destroyed: boolean;
    reconnectTimeout?: NodeJS.Timeout;
    reconnectAttempts: number;
    retryAmount: number;
    retryDelay: number;
    resumed: boolean;
    resumeTimeout: number;
    private resumeUpdateTimeout?;
    private resumeUpdateAttempts;
    private resumeUpdateInProgress;
    private resumeUpdateMaxAttempts;
    private resumeUpdateBaseDelay;
    private resumeWindowTimeout?;
    private resumeWindowActive;
    private pendingRecovery;
    private recoveryInProgress;
    regions: string[];
    secure: boolean;
    sessionId: string;
    priority?: number;
    socket: WebSocket;
    stats?: INodeStats;
    info?: any;
    version?: string;
    isNodeLink: boolean;
    url: string;
    rest: Rest;
    private lastStats?;
    state: NodeState;
    capabilities: Set<string>;
    constructor(manager: Manager, config: IManagerNodeConfig);
    get latency(): number;
    getPenalties(): number;
    ping(): Promise<number>;
    createYouTubeLiveChat(identifier: string, options?: YouTubeLiveChatOptions): YouTubeLiveChat;
    loadLyrics(track: string | ITrack | Track | {
        encoded?: string;
    }, lang?: string): Promise<NodeLinkResponse<ILyricsData | Record<string, any>> | null>;
    loadDirectStream(track: string | ITrack | Track | {
        encoded?: string;
    }, volume?: number, position?: number, filters?: IFilters | Record<string, any>): Promise<{
        stream: NodeJS.ReadableStream;
        headers: Record<string, any>;
    }>;
    getDirectStream(track: string | ITrack | Track | {
        encoded?: string;
    }, itag?: number | null): Promise<any | null>;
    get address(): string;
    setState(state: NodeState): void;
    connect(): Promise<void>;
    private calculateReconnectDelay;
    reconnect(): void;
    private resetResumeUpdateState;
    private cancelResumeWindow;
    private startResumeWindow;
    private scheduleResumeUpdateRetry;
    private enableResumeWithRetry;
    private startDisasterRecovery;
    protected open(): Promise<void>;
    protected close(event: {
        code: any;
        reason: string;
    }): Promise<void>;
    protected message({ data }: {
        data: any;
    }): Promise<void>;
    protected handleEvent(player: any, payload: LavalinkEventPayload): void;
    private handleWorkerFailed;
    private handleTrackStart;
    private handleTrackEnd;
    private handleTrackStuck;
    private handleTrackException;
    private handleMixStarted;
    private handleMixEnded;
    private handleConnectionStatus;
    private handleVolumeChanged;
    private handleFiltersChanged;
    private handleSeek;
    private handlePause;
    private handlePlayerCreated;
    private handlePlayerDestroyed;
    private handlePlayerReconnecting;
    private handlePlayerConnected;
    private handleEternalBoxInfo;
    private handleEternalBoxJump;
    private handleStreamMetadata;
    private handleLyricsFound;
    private handleLyricsLine;
    private handleLyricsNotFound;
    private handleWebSocketClosed;
    handleAutoPlay(player: any, previousTrack: any): Promise<boolean>;
    private handleQueueEnd;
    protected error({ error }: {
        error: any;
    }): void;
    destroy(): Promise<void>;
    private _resumePlayers;
}
export {};
