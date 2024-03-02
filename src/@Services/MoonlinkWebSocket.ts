import http from "http";
import https from "https";
import crypto from "crypto";
import { EventEmitter } from "events";

export class MoonlinkWebSocket extends EventEmitter {
    private url: URL;
    private options: any;
    private socket: any;
    private established: boolean;
    private closing: boolean = false;
    private headers?: Record<string, any>;
    private partialMessage?: Buffer | null = null;
    constructor(uri: string, options: any) {
        super();
        this.url = new URL(uri);
        this.options = {
            port: this.url.port
                ? this.url.port
                : this.url.protocol === "wss:"
                ? 443
                : 80,
            method: "GET",
            protocol: this.url.protocol === "wss:" ? "https:" : "http:",
            secure: this.url.protocol === "wss:",
            ...options
        };
        // https://github.com/nodejs/node/issues/47822#issuecomment-1564708870
        if (
            process.versions &&
            process.versions.node &&
            process.versions.node.match(/20\.[0-2]\.0/)
        ) {
            require("net").setDefaultAutoSelectFamily(false);
        } // https://nodejs.org/api/errors.html#err_socket_connection_timeout

        this.connect();
    }

    private buildRequestOptions(): any {
        const requestOptions: any = {
            port: this.options.port,
            headers: this.buildHandshake(this.options),
            method: "GET",
            keepAlive: true,
            noDelay: true,
            keepAliveInitialDelay: 0,
            timeout: 0
        };

        return this.options.secure
            ? requestOptions
            : { ...requestOptions, protocol: "http:" };
    }

    private buildHandshake(options: any): Record<string, any> {
        const headers: Record<string, string> = { ...options.headers };
        headers["Host"] = this.url.host;
        headers["Upgrade"] = "websocket";
        headers["Connection"] = "Upgrade";
        headers["Sec-WebSocket-Key"] = crypto
            .randomBytes(16)
            .toString("base64");
        headers["Sec-WebSocket-Version"] = "13";

        return headers;
    }

    public connect(): void {
        const { request } = this.options.secure ? https : http;
        const requestOptions = this.buildRequestOptions();

        const req = request(
            `${this.options.secure ? "https://" : "http://"}${this.url.host}${
                this.url.pathname
            }${this.url.search || ""}`,
            requestOptions
        );

        req.on("upgrade", (res, socket, head) => {
            this.established = true;
            this.socket = socket;
            this.emit("open", this.socket);
            if (
                res.headers.upgrade.toLowerCase() !== "websocket" ||
                res.headers["sec-websocket-accept"] !==
                    crypto
                        .createHash("sha1")
                        .update(
                            requestOptions.headers["Sec-WebSocket-Key"] +
                                "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
                        )
                        .digest("base64")
            ) {
                socket.destroy();
                return;
            }
            if (head && head.length > 0) socket.unshift(head);

            this.headers = res.headers;

            socket.on("data", data => {
                const frame = this.parseFrame(data);

                switch (frame.opcode) {
                    case 0: {
                        this.partialMessage = Buffer.concat([
                            this.partialMessage,
                            frame.payload
                        ]);

                        if (frame.fin) {
                            this.emit(
                                "message",
                                this.partialMessage.toString("utf-8")
                            );

                            this.partialMessage = null;
                        }
                    }
                    case 1: {
                        this.emit("message", frame.payload.toString("utf-8"));
                        break;
                    }
                    case 8: {
                        const code = frame.payload.readUInt16BE(0);

                        const reason = frame.payload.slice(2).toString("utf8");

                        this.emit("close", code, reason);
                        break;
                    }
                    default: {
                        console.log(
                            "Emitted data that has not been implemented; opcode: " +
                                frame.opcode
                        );
                    }
                }
            });
            socket.on("close", hadError => {
                if (hadError) this.emit("error", hadError);
                if (!this.closing) this.emit("close");
            });

            socket.on("error", error => this.emit("error", error));
        });

        req.on("error", error => {
            this.emit("error", error);
        });

        req.on("close", code => {
            if (!this.established) this.emit("close", code);
        });

        req.end();
    }
    private parseFrame(data: Buffer): any {
        const opcode = data[0] & 0x0f; // 15
        const fin = (data[0] & 0x80) === 0x80; // 128
        const mask = (data[1] & 0x80) === 0x80;
        let payloadOffset = 2;
        let payloadLength = data[1] & 0x7f;

        if (payloadLength === 126) {
            payloadLength = data.readUInt16BE(2);
            payloadOffset += 2;
        } else if (payloadLength === 127) {
            payloadLength = data.readUInt32BE(2);
            payloadOffset += 8;
        }

        const maskingKey = mask
            ? data.slice(payloadOffset, payloadOffset + 4)
            : null;
        payloadOffset += mask ? 4 : 0;

        const payload = data.slice(
            payloadOffset,
            payloadOffset + payloadLength
        );

        if (mask && maskingKey) {
            for (let i = 0; i < payload.length; i++) {
                payload[i] ^= maskingKey[i % 4];
            }
        }
        return {
            opcode,
            fin,
            mask,
            maskingKey,
            payloadLength,
            payloadOffset,
            payload
        };
    }

    public writeFrame(data: any): Buffer {
        const { fin, opcode, mask, payload } = data;
        const header1 = (fin ? 128 : 0) | (opcode & 15);
        const header2 = (mask ? 128 : 0) | (payload.length & 127);

        let frame = Buffer.allocUnsafe(2);

        frame.writeUInt8(header1, 0);
        frame.writeUInt8(header2, 1);

        if (payload.length > 125 && payload.length < 65535) {
            let extendedFrame = Buffer.allocUnsafe(2);
            extendedFrame.writeUInt16BE(payload.length, 0);
            frame = Buffer.concat([frame, extendedFrame]);
        } else if (payload.length > 65535) {
            let extendedFrame = Buffer.allocUnsafe(8);
            extendedFrame.writeUInt32BE(0, 0);
            extendedFrame.writeUInt32BE(payload.length, 4);

            frame = Buffer.concat([frame, extendedFrame]);
        }
        if (mask) {
            let maskingKey = Buffer.from([
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256)
            ]);

            frame = Buffer.concat([frame, maskingKey]);
            for (let i = 0; i < payload.length; i++) {
                payload[i] ^= maskingKey[i % 4];
            }
        }

        frame = Buffer.concat([frame, payload]);
        return frame;
    }

    public close(code = 1000, reason = "normal closing"): void {
        if (this.socket && this.established) {
            this.closing = true;
            const buffer = Buffer.alloc(2 + Buffer.byteLength(reason));
            buffer.writeUInt16BE(code, 0);
            buffer.write(reason, 2, Buffer.byteLength(reason), "utf-8");

            let frame = this.writeFrame({
                fin: true,
                opcode: 8,
                mask: false,
                payload: buffer
            });

            this.socket.write(frame);
        }
    }
}
