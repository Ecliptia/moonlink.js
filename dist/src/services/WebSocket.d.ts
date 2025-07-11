import { EventEmitter } from 'events';
export default class WebSocket extends EventEmitter {
    private url;
    private headers;
    private socket;
    private netSocket;
    private connected;
    private buffer;
    private fragmentedPayload;
    private fragmentedOpCode;
    constructor(url: string, options?: {
        headers?: Record<string, string>;
    });
    private connect;
    private handleData;
    private processBuffer;
    private handleFrame;
    private handleClose;
    send(data: string | Buffer, cb?: (err?: Error) => void): void;
    private sendFrame;
    close(code?: number, reason?: string): void;
    addEventListener(event: string, listener: (...args: any[]) => void, options?: {
        once?: boolean;
    }): void;
}
