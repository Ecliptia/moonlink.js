/// <reference types="node" />
/// <reference types="node" />
import http from "node:http";
import EventEmitter from "node:events";
export type WebSocketOptions = {
    headers?: http.OutgoingHttpHeaders | undefined;
    timeout?: number;
};
export type FrameOptions = {
    fin: boolean;
    opcode: number;
    len: number;
};
export declare class WebSocket extends EventEmitter {
    private url;
    private options;
    private socket;
    private cachedData;
    constructor(url: string, options: WebSocketOptions);
    connect(): void;
    sendFrame(data: Uint8Array, options: FrameOptions): boolean;
    close(code?: number, reason?: string): boolean;
}
