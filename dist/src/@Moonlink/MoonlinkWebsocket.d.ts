/// <reference types="node" />
/// <reference types="node" />
import { URL } from "url";
import { EventEmitter } from "events";
interface WebSocketOptions {
    timeout?: number;
    headers?: Record<string, string>;
    secure?: boolean;
    host?: string;
    port?: number;
    maxConnections?: number;
}
export declare class MoonlinkWebsocket extends EventEmitter {
    options: WebSocketOptions;
    socket: any;
    agent: any;
    url: URL;
    connectionCount: number;
    constructor(url: string, options?: WebSocketOptions);
    connect(): void;
    send(data: string): void;
    close(code?: number, reason?: string): void;
    private setupSocketListeners;
    private handleSocketError;
    private handleSocketUpgrade;
    private handleSocketConnection;
    private buildHeaders;
    private generateWebSocketKey;
    private createWebSocketCloseFrame;
    private parseFrameHeader;
    private buildUpgradeHeaders;
    private incrementConnectionCount;
}
export {};
