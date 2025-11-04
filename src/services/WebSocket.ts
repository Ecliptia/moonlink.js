import { createHash, randomBytes } from "node:crypto";
import { EventEmitter } from "node:events";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

const isBun = typeof process !== "undefined" && process.versions?.bun;

export default class WebSocket extends EventEmitter {
    private url: URL;
    private headers: Record<string, string>;
    private socket: any = null;
    private netSocket: any;
    private connected: boolean = false;
    private buffer: Buffer = Buffer.alloc(0);
    private fragmentedPayload: Buffer[] = [];
    private fragmentedOpCode: number | null = null;
    private readonly MAX_PAYLOAD_SIZE = 16 * 1024 * 1024; // 16 MB

    private redirectCount: number = 0;
    private readonly MAX_REDIRECTS = 5;

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

        ws.addEventListener("open", () => this.emit("open"));
        ws.addEventListener("message", (msg) => this.emit("message", { data: msg.data }));
        ws.addEventListener("close", (ev) => this.emit("close", { code: ev.code, reason: ev.reason }));
        ws.addEventListener("error", (err) => this.emit("error", { error: err }));

        this.socket = ws;
        this.connected = true;
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

        const allowedExtraHeaders = ["authorization", "user-id", "client-name"];
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

            this.netSocket.on("data", (data: Buffer) => this.handleData(data));
            this.netSocket.on("close", () => this.handleClose(1006, "Connection closed abruptly"));
            this.netSocket.on("error", (err: Error) => this.emit("error", { error: err }));
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
                break;

            case 0xa:
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
        const payloadLength = payload.length;
        let header: Buffer;
        let headerLength = 2;

        if (payloadLength < 126) {
            header = Buffer.alloc(headerLength);
            header[1] = payloadLength;
        } else if (payloadLength < 65536) {
            headerLength = 4;
            header = Buffer.alloc(headerLength);
            header[1] = 126;
            header.writeUInt16BE(payloadLength, 2);
        } else {
            headerLength = 10;
            header = Buffer.alloc(headerLength);
            header[1] = 127;
            header.writeBigUInt64BE(BigInt(payloadLength), 2);
        }

        header[0] = 0x80 | opcode;
        this.netSocket.write(Buffer.concat([header, payload]));
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
}