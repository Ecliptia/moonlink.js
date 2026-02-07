import { IManagerNodeConfig, INodeStats, ITrack } from "../typings/Interfaces";
import type { Manager } from "../core/Manager";
import { Rest } from "./Rest";
import { WebSocket } from "../services/WebSocket";
import { NodeState, TrackEndReason } from "../typings/types";
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
type WebSocketClosedEvent = LavalinkEventBase & {
    type: "WebSocketClosedEvent";
    code: number;
    reason: string;
    byRemote: boolean;
};
type LavalinkEventPayload = TrackStartEvent | TrackEndEvent | TrackStuckEvent | TrackExceptionEvent | WebSocketClosedEvent;
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
    url: string;
    rest: Rest;
    private lastStats?;
    state: NodeState;
    capabilities: Set<string>;
    constructor(manager: Manager, config: IManagerNodeConfig);
    get latency(): number;
    getPenalties(): number;
    ping(): Promise<number>;
    get address(): string;
    setState(state: NodeState): void;
    connect(): Promise<void>;
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
    private handleTrackStart;
    private handleTrackEnd;
    private handleTrackStuck;
    private handleTrackException;
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
