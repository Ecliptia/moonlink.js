import { EventEmitter } from "node:events";
export default class WebSocket extends EventEmitter {
    private url;
    private headers;
    private socket;
    private netSocket;
    private connected;
    private buffer;
    private fragmentedPayload;
    private fragmentedOpCode;
    private readonly MAX_PAYLOAD_SIZE;
    constructor(url: string, options?: {
        headers?: Record<string, string>;
    });
    private connectBun;
    private connectNode;
    private handleData;
    private processBuffer;
    private handleFrame;
    private handleClose;
    send(data: string | Buffer): void;
    private sendFrame;
    close(code?: number, reason?: string): void;
}
