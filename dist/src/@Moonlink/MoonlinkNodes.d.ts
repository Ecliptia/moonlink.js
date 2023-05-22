/// <reference types="node" />
import WebSocket from "ws";
import { MoonlinkManager, Options } from "./MoonlinkManager";
import { MoonlinkRest } from "./MoonlinkRest";
export declare interface Node {
    host: string;
    password?: string;
    port?: number;
    secure?: boolean;
    identifier?: string;
}
export interface NodeStats {
    players: number;
    playingPlayers: number;
    uptime: number;
    memory: {
        reservable: number;
        used: number;
        free: number;
        allocated: number;
    };
    frameStats: {
        sent: number;
        deficit: number;
        nulled: number;
    };
    cpu: {
        cores: number;
        systemLoad: number;
        lavalinkLoad: number;
    };
}
export declare class MoonlinkNode {
    manager: MoonlinkManager;
    host: string;
    port: number;
    password: string | null;
    identifier: string | null;
    secure: boolean | null;
    version: string | number | unknown;
    options: Options;
    sPayload: Function;
    socketUri: string | null;
    restUri: any;
    rest: MoonlinkRest;
    resumed: boolean;
    sessionId: string;
    isConnected: boolean;
    ws: WebSocket | null;
    stats: NodeStats;
    retryTime: number | null;
    reconnectAtattempts: number | null;
    reconnectTimeout: any;
    resumeKey: string | null;
    resumeTimeout: number;
    calls: number;
    retryAmount: number | null;
    sendWs: Function;
    private node;
    private map;
    private db;
    constructor(manager: MoonlinkManager, node: Node, map: Map<string, any[]>);
    request(endpoint: string, params: any): Promise<object>;
    init(): void;
    connect(): Promise<any>;
    protected open(): Promise<void>;
    private reconnect;
    protected close(code: number, reason: any): void;
    protected message(data: Buffer | string): Promise<void>;
    protected error(err: Error): void;
    protected handleEvent(payload: any): Promise<any>;
}
