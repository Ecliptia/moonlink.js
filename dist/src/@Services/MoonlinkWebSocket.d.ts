/// <reference types="node" />
import { EventEmitter } from "events";
export declare class MoonlinkWebSocket extends EventEmitter {
    private url;
    private options;
    private socket;
    private established;
    private closing;
    private debug;
    constructor(uri: string, options: any);
    private buildRequestOptions;
    private buildHandshake;
    private configureSocketEvents;
    connect(): void;
    private parseSingleWebSocketFrame;
    close(code?: number, reason?: string): void;
    private createCloseFrame;
}
