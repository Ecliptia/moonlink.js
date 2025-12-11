import { createHash, randomBytes } from "node:crypto";
import { EventEmitter } from "node:events";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

const isBun = typeof process !== "undefined" && process.versions?.bun;

export class WebSocket extends EventEmitter {
    private url: URL;
    private headers: Record<string, string>;
    private socket: any = null;
    private netSocket: any;
    private connected: boolean = false;
    private buffer: Buffer = Buffer.alloc(0);
    private fragmentedPayload: Buffer[] = [];
    private fragmentedOpCode: number | null = null;
    
    private redirectCount: number = 0;
    private readonly MAX_REDIRECTS = 5;

    private pingInterval: NodeJS.Timeout | null = null;
    private readonly PING_INTERVAL = 30000;
    private pongReceived: boolean = true;
    private readonly PONG_TIMEOUT = 5000;
    private pingTimestamps: Map<string, number> = new Map();
    public latency: number = 0;

    constructor(url: string, options?: { headers?: Record<string, string> }) {
        super();
        this.url = new URL(url);
        this.headers = options?.headers || {};
        this.redirectCount = 0;

        if (isBun) {
            this.connectBun();
        } else {
            this.connectNode();
        }
    }

    private connectBun() {
        const ws = new globalThis.WebSocket(this.url.toString(), {
            headers: this.headers,
        });

        ws.addEventListener("open", () => { 
            this.connected = true;
            return this.emit("open"); 
        });
        ws.addEventListener("message", (msg) => { return this.emit("message", { data: msg.data }); });
        ws.addEventListener("close", (ev) => { 
            this.connected = false;
            return this.emit("close", { code: ev.code, reason: ev.reason }); 
        });
        ws.addEventListener("error", (err) => { return this.emit("error", { error: err }); });

        this.socket = ws;
    }

    private connectNode() {
        const key = randomBytes(16).toString("base64");
        const protocol = this.url.protocol === "wss:" ? https : http;
        const port = this.url.port || (this.url.protocol === "wss:" ? 443 : 80);

        const baseHeaders: Record<string, string> = {
            "Connection": "Upgrade",
            "Upgrade": "websocket",
            "Sec-WebSocket-Version": "13",
            "Sec-WebSocket-Key": key,
        };

        const allowedExtraHeaders = ["authorization", "user-id", "client-name", "session-id"];
        for (const [header, value] of Object.entries(this.headers)) {
            if (allowedExtraHeaders.includes(header.toLowerCase())) {
                baseHeaders[header] = value;
            }
        }

        const options = {
            port,
            host: this.url.hostname,
            headers: baseHeaders,
            path: this.url.pathname + this.url.search,
            timeout: 10000,
        };

        this.socket = protocol.request(options);

        this.socket.on("response", (res: http.IncomingMessage) => {
            const { statusCode, headers } = res;

            if (statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308) {
                if (this.redirectCount >= this.MAX_REDIRECTS) {
                    this.socket?.destroy();
                    this.emit("error", { error: new Error("Too many redirects") });
                    this.emit("close", { code: 1006, reason: "Too many redirects" });
                    return;
                }

                const newLocation = headers.location;
                if (!newLocation) {
                    this.socket?.destroy();
                    this.emit("error", { error: new Error(`Redirect status ${statusCode} but no 'location' header`) });
                    this.emit("close", { code: 1006, reason: "Invalid redirect response" });
                    return;
                }

                this.socket?.destroy();
                this.redirectCount++;
                
                this.url = new URL(newLocation, this.url.href); 
                this.emit("debug", `Redirected to: ${this.url.toString()}`);
                
                this.connectNode(); 
                return;
            }

            if (statusCode !== 101) {
                this.socket?.destroy();
                switch (statusCode) {
                    case 401:
                        this.emit("debug", "Authentication failed, please check your credentials.");
                        break;
                    case 404:
                        this.emit("debug", "Service unavailable, check your host and port.");
                        break;
                    default:
                        this.emit("debug", `Unexpected status code: ${statusCode}`);
                }
            }
        });

        this.socket.on("upgrade", (res, socket, head) => {
            const expectedKey = createHash("sha1")
              .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
              .digest("base64");

            if (res.headers["sec-websocket-accept"] !== expectedKey) {
                socket.destroy();
                this.emit("error", { error: new Error("Invalid Sec-WebSocket-Accept header") });
                return;
            }

            this.redirectCount = 0;
            this.netSocket = socket;
            this.connected = true;
            this.buffer = head;
            this.emit("open");

            this.startHeartbeat();

            this.netSocket.on("data", (data: Buffer) => { return this.handleData(data); });
            this.netSocket.on("close", () => { 
                this.stopHeartbeat();
                return this.handleClose(1006, "Connection closed abruptly"); 
            });
            this.netSocket.on("error", (err: Error) => { return this.emit("error", { error: err }); });
        });

        this.socket.on("error", (err) => {
            if (this.url.protocol === "wss:" && this.url.hostname === "localhost") {
                this.emit("debug", "Secure connection failed, trying insecure connection.");
                this.url.protocol = "ws:";
                this.connectNode();
                return;
            }

            this.emit("error", { error: err });
            if (!this.connected) {
                this.redirectCount = 0;
                this.emit("close", { code: 1006, reason: err.message });
                this.socket?.destroy();
                this.socket = null;
            }
        });

        this.socket.on("timeout", () => {
            this.emit("error", { error: new Error("Connection timed out") });
            if (!this.connected) {
                this.redirectCount = 0;
                this.emit("close", { code: 1006, reason: "Connection timed out" });
                this.socket?.destroy();
                this.socket = null;
            }
        });

        this.socket.end();
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        
        this.pingInterval = setInterval(() => {
            if (!this.connected || !this.netSocket) {
                this.stopHeartbeat();
                return;
            }

            if (!this.pongReceived) {
                this.emit("error", { error: new Error("Pong timeout") });
                this.close(1006, "Pong timeout");
                return;
            }

            this.pongReceived = false;
            
            const timestamp = Date.now().toString();
            const payload = Buffer.from(timestamp);
            this.pingTimestamps.set(timestamp, Date.now());
            
            this.sendFrame(0x9, payload);
            
            setTimeout(() => {
                if (!this.pongReceived && this.connected) {
                    this.emit("error", { error: new Error("No pong received") });
                    this.close(1006, "No pong received");
                }
            }, this.PONG_TIMEOUT);
        }, this.PING_INTERVAL);
    }

    private stopHeartbeat() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    public ping(data?: string | Buffer): Promise<number> {
        return new Promise((resolve, reject) => {
            if (isBun) {
                reject(new Error("Manual ping not supported in Bun mode"));
                return;
            }

            if (!this.connected || !this.netSocket) {
                reject(new Error("WebSocket is not connected"));
                return;
            }

            const timestamp = Date.now().toString();
            const payload = data ? 
                (Buffer.isBuffer(data) ? data : Buffer.from(data)) : 
                Buffer.from(timestamp);
            
            const useTimestamp = !data;
            if (useTimestamp) {
                this.pingTimestamps.set(timestamp, Date.now());
            }

            const timeout = setTimeout(() => {
                if (useTimestamp) {
                    this.pingTimestamps.delete(timestamp);
                }
                this.off("pong", pongListener);
                reject(new Error("Pong timeout"));
            }, this.PONG_TIMEOUT);

            const pongListener = (latency?: number) => {
                clearTimeout(timeout);
                resolve(latency || 0);
            };

            this.once("pong", pongListener);
            this.sendFrame(0x9, payload);
        });
    }

    private handleData(data: Buffer) {
        this.buffer = Buffer.concat([this.buffer, data]);
        this.processBuffer();
    }

    private processBuffer() {
        while (this.buffer.length >= 2) {
            const firstByte = this.buffer[0];
            const secondByte = this.buffer[1];
            const fin = (firstByte & 0x80) !== 0;
            const opcode = firstByte & 0x0f;
            const masked = (secondByte & 0x80) !== 0;

            let payloadLength = secondByte & 0x7f;
            let offset = 2;

            if (payloadLength === 126) {
                if (this.buffer.length < 4) return;
                payloadLength = this.buffer.readUInt16BE(2);
                offset = 4;
            } else if (payloadLength === 127) {
                if (this.buffer.length < 10) return;
                payloadLength = Number(this.buffer.readBigUInt64BE(2));
                offset = 10;
            }

            const maskingKeyOffset = offset;
            const payloadOffset = maskingKeyOffset + (masked ? 4 : 0);
            const totalLength = payloadOffset + payloadLength;

            if (this.buffer.length < totalLength) return;

            let payload = this.buffer.slice(payloadOffset, totalLength);

            if (masked) {
                const maskingKey = this.buffer.slice(maskingKeyOffset, payloadOffset);
                for (let i = 0; i < payload.length; i++) {
                    payload[i] ^= maskingKey[i % 4];
                }
            }

            this.buffer = this.buffer.slice(totalLength);
            this.handleFrame(opcode, fin, payload);
        }
    }

    private handleFrame(opcode: number, fin: boolean, payload: Buffer) {
        switch (opcode) {
            case 0x0:
            case 0x1:
            case 0x2:
                if (opcode !== 0x0 && this.fragmentedOpCode !== null) {
                    this.emit("error", { error: new Error("Unexpected new data frame during fragmentation") });
                    this.close(1002, "Unexpected data frame");
                    return;
                }

                if (opcode !== 0x0) this.fragmentedOpCode = opcode;
                this.fragmentedPayload.push(payload);

                if (fin) {
                    const message = Buffer.concat(this.fragmentedPayload);
                    const messageData = this.fragmentedOpCode === 0x1 ? message.toString() : message;

                    this.emit("message", { data: messageData });
                    this.fragmentedPayload = [];
                    this.fragmentedOpCode = null;
                }
                break;

            case 0x8:
                const code = payload.length >= 2 ? payload.readUInt16BE(0) : 1000;
                const reason = payload.length > 2 ? payload.slice(2).toString() : "";
                this.handleClose(code, reason);
                break;

            case 0x9:
                this.sendFrame(0xa, payload);
                this.emit("ping", payload);
                break;

            case 0xa:
                this.pongReceived = true;
                
                if (payload.length > 0) {
                    try {
                        const timestamp = payload.toString("utf8");
                        const sentAt = this.pingTimestamps.get(timestamp);
                        
                        if (sentAt) {
                            this.latency = Date.now() - sentAt;
                            this.pingTimestamps.delete(timestamp);
                            this.emit("pong", this.latency);
                            return;
                        }
                    } catch (e) {}
                }
                
                this.emit("pong");
                break;

            default:
                this.emit("error", { error: new Error(`Unsupported opcode: ${opcode}`) });
                this.close(1002, "Unsupported opcode");
        }
    }

    private handleClose(code: number, reason: string) {
        if (!this.connected) return;
        this.connected = false;
        this.stopHeartbeat();
        this.pingTimestamps.clear();
        this.emit("close", { code, reason });
        this.netSocket?.destroy();
        this.netSocket = null;
        this.socket = null;
    }

    public send(data: string | Buffer) {
        if (isBun) {
            if (this.socket?.readyState === this.socket.OPEN) {
                this.socket.send(data);
            }
            return;
        }

        if (!this.connected || !this.netSocket) {
            throw new Error("WebSocket is not connected");
        }

        const opcode = typeof data === "string" ? 0x1 : 0x2;
        const payload = Buffer.isBuffer(data) ? data : Buffer.from(data);
        this.sendFrame(opcode, payload);
    }

    private sendFrame(opcode: number, payload: Buffer) {
        if (!this.netSocket || !this.connected) return;

        const payloadLength = payload.length;
        const maskingKey = randomBytes(4);
        const maskedPayload = Buffer.alloc(payloadLength);
        
        for (let i = 0; i < payloadLength; i++) {
            maskedPayload[i] = payload[i] ^ maskingKey[i % 4];
        }

        let header: Buffer;
        let headerLength = 2;

        if (payloadLength < 126) {
            header = Buffer.alloc(headerLength + 4);
            header[1] = 0x80 | payloadLength;
        } else if (payloadLength < 65536) {
            headerLength = 4;
            header = Buffer.alloc(headerLength + 4);
            header[1] = 0x80 | 126;
            header.writeUInt16BE(payloadLength, 2);
        } else {
            headerLength = 10;
            header = Buffer.alloc(headerLength + 4);
            header[1] = 0x80 | 127;
            header.writeBigUInt64BE(BigInt(payloadLength), 2);
        }

        header[0] = 0x80 | opcode;
        maskingKey.copy(header, headerLength);

        this.netSocket.write(Buffer.concat([header, maskedPayload]));
    }

    public close(code: number = 1000, reason: string = "") {
        if (isBun) {
            this.socket?.close(code, reason);
            return;
        }

        if (!this.connected || !this.netSocket) return;

        const reasonBuffer = Buffer.from(reason);
        const payload = Buffer.alloc(2 + reasonBuffer.length);
        payload.writeUInt16BE(code, 0);
        reasonBuffer.copy(payload, 2);

        this.sendFrame(0x8, payload);
        this.handleClose(code, reason);
    }

    public get readyState(): number {
        if (isBun) {
            return this.socket?.readyState ?? 3;
        }
        return this.connected ? 1 : 3;
    }
}
