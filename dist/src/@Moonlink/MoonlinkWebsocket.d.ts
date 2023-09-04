/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import * as tls from 'tls';
import * as net from 'net';
import { EventEmitter } from 'events';
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
    url: any;
    constructor(url: string, options?: WebSocketOptions);
    connect(): void;
    send(data: string): void;
    close(code?: number, reason?: string): void;
    private parseFrameHeader;
    private generateWebSocketKey;
    private createWebSocketCloseFrame;
    isOpen(): boolean;
    getRemoteAddress(): string | null;
    getRemotePort(): number | null;
    upgradeConnection(newSocket: tls.TLSSocket | net.Socket): void;
    private handleWebSocketData;
    private bufferedData;
    private applyMask;
    private decodeWebSocketFrames;
}
export {};
