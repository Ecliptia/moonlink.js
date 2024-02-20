/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from "events";
export declare class MoonlinkWebSocket extends EventEmitter {
    private url;
    private options;
    private socket;
    private established;
    private closing;
    constructor(uri: string, options: any);
    private buildRequestOptions;
    private buildHandshake;
    connect(): void;
    private parseFrame;
    writeFrame(data: any): Buffer;
    close(code?: number, reason?: string): void;
}
