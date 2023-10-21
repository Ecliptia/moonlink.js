/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from "events";
import { URL } from "url";
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
    url: URL;
    connectionCount: number;
    private buffers;
    constructor(url: string, options?: WebSocketOptions);
    private buildRequestOptions;
    private buildHeaders;
    connect(): void;
    private handleWebSocketConnection;
    private handleWebSocketData;
    private emitMessagesFromBuffers;
    private findJSONObjects;
    private generateWebSocketKey;
    close(code: number, reason: string): void;
    private generateCloseFrame;
}
export {};
