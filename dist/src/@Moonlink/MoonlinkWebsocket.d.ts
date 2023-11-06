/// <reference types="node" />
import { EventEmitter } from "events";
interface WebSocketOptions {
    timeout?: number;
    headers?: Record<string, string>;
    host?: string;
    port?: number;
    maxConnections?: number;
    secure?: boolean;
}
export declare class MoonlinkWebsocket extends EventEmitter {
    options: WebSocketOptions;
    socket: any;
    url: any;
    connectionCount: number;
    private buffers;
    private established;
    constructor(url: string, options?: WebSocketOptions);
    private buildRequestOptions;
    private buildHeaders;
    connect(): void;
    private handleWebSocketConnection;
    private handleWebSocketData;
    private emitMessagesFromBuffers;
    private findJSONObjects;
    close(code?: number, reason?: string): void;
}
export {};
