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
    keyGenerator?: () => string;
}
export declare class MoonlinkWebsocket extends EventEmitter {
    options: WebSocketOptions;
    socket: any;
    agent: any;
    url: URL;
    constructor(url: string, options?: WebSocketOptions);
    connect(): void;
    private setupSocketListeners;
    private handleSocketError;
    private handleSocketUpgrade;
    private handleSocketConnection;
    send(data: string): void;
    close(code?: number, reason?: string): void;
    private parseFrameHeader;
    private generateWebSocketKey;
    private createWebSocketCloseFrame;
    isOpen(): boolean;
    getRemoteAddress(): string | null;
    getRemotePort(): number | null;
    private buildHeaders;
    private buildUpgradeHeaders;
}
export {};
