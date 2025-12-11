import { EventEmitter } from "node:events";
export declare class WebSocket extends EventEmitter {
    private url;
    private headers;
    private socket;
    private netSocket;
    private connected;
    private buffer;
    private fragmentedPayload;
    private fragmentedOpCode;
    private redirectCount;
    private readonly MAX_REDIRECTS;
    private pingInterval;
    private readonly PING_INTERVAL;
    private pongReceived;
    private readonly PONG_TIMEOUT;
    private pingTimestamps;
    latency: number;
    constructor(url: string, options?: {
        headers?: Record<string, string>;
    });
    private connectBun;
    private connectNode;
    private startHeartbeat;
    private stopHeartbeat;
    ping(data?: string | Buffer): Promise<number>;
    private handleData;
    private processBuffer;
    private handleFrame;
    private handleClose;
    send(data: string | Buffer): void;
    private sendFrame;
    close(code?: number, reason?: string): void;
    get readyState(): number;
}
