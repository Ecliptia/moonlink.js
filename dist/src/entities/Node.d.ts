import { INodeStats, INode } from "../typings/Interfaces";
import { Manager, Rest, Player } from "../../index";
import WebSocket from "../services/WebSocket";
import { NodeState } from "../typings/types";
import { AbstractPlugin } from "../plugins/AbstractPlugin";
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
    priority?: number;
    socket: WebSocket;
    stats?: INodeStats;
    info?: any;
    version?: string;
    url: string;
    rest: Rest;
    state: NodeState;
    capabilities: Set<string>;
    plugins: Map<string, AbstractPlugin>;
    constructor(manager: Manager, config: INode);
    get address(): string;
    setState(state: NodeState): void;
    connect(): Promise<void>;
    reconnect(): void;
    protected open(): void;
    protected close(event: {
        code: number;
        reason: string;
    }): void;
    protected message({ data }: {
        data: any;
    }): Promise<void>;
    private _handleAutoplay;
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
    getPlayers(): Player[];
    get getPlayersCount(): number;
    getNodeStatus(timeout?: number): Promise<{
        identifier: string;
        connected: boolean;
        version?: string;
        stats: {
            cpu: number;
            memory: number;
            uptime: number;
        };
        players: {
            total: number;
            active: number;
            paused: number;
            idle: number;
        };
        health: {
            status: 'overloaded' | 'stable';
            needsRestart: boolean;
            responding: boolean;
            performance: 'excellent' | 'good' | 'poor';
        };
    }>;
}
