/// <reference types="node" />
import { MoonlinkWebsocket } from "./MoonlinkWebsocket";
import { MoonlinkManager, Options, MoonlinkDatabase, MoonlinkRest } from "../../index";
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
    resume: boolean | null;
    resumed: boolean;
    sessionId: string;
    isConnected: boolean;
    ws: MoonlinkWebsocket | null;
    stats: NodeStats;
    retryTime: number | null;
    reconnectAtattempts: number | null;
    reconnectTimeout: any;
    resumeStatus: boolean | null;
    resumeTimeout: number;
    calls: number;
    retryAmount: number | null;
    sendWs: Function;
    private node;
    private map;
    db: MoonlinkDatabase;
    constructor(manager: MoonlinkManager, node: Node, map: Map<string, any[]>);
    request(endpoint: string, params: any): Promise<object>;
    init(): void;
    connect(): Promise<any>;
    protected open(socket: any): Promise<void>;
    private reconnect;
    protected close(code: number, reason: any): void;
    protected message(data: Buffer | string): Promise<void>;
    protected error(error: Error): void;
    protected handleEvent(payload: any): Promise<any>;
}
