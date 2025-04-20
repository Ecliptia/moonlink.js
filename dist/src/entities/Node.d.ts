import { INodeStats, INode } from "../typings/Interfaces";
import { Manager, Rest } from "../../index";
import WebSocket from "ws";
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
    regions: string[];
    secure: boolean;
    sessionId: string;
    socket: WebSocket;
    stats?: INodeStats;
    info?: any;
    version?: string;
    url: string;
    rest: Rest;
    constructor(manager: Manager, config: INode);
    get address(): string;
    connect(): void;
    reconnect(): void;
    protected open(): void;
    protected close({ code, reason }: {
        code: any;
        reason: any;
    }): void;
    protected message({ data }: {
        data: any;
    }): Promise<void>;
    protected error({ error }: {
        error: any;
    }): void;
    destroy(): void;
    getSystemStats(): {
        cpuLoad: number;
        memoryUsage: number;
    };
    isOverloaded(cpuThreshold?: number, memoryThreshold?: number): boolean;
    migrateAllPlayers(targetNode?: Node): Promise<void>;
    getPlayers(): import("./Player").Player[];
    get getPlayersCount(): number;
    needsRestart(): boolean;
    getNodeStatus(): object;
    checkHealth(timeout?: number): Promise<{
        responding: boolean;
        performance: 'excellent' | 'good' | 'poor';
    }>;
}
