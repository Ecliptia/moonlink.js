import http from "http";
import https from "https";
import crypto from "crypto";
import { EventEmitter } from "events";

// @Author: 1Lucas1apk
// Code made entirely by me, the code can be used as inspiration for your own RFC 6455 Protocol

export class MoonlinkWebSocket extends EventEmitter {
    private url: URL;
    private options: any;
    private socket: any;
    private established: boolean;
    private closing: boolean = false;
    private debug: boolean = false;

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
        this.options.debug !== undefined && this.options.debug == true
            ? (this.debug = true)
            : null;

        this.connect();
    }

    private buildRequestOptions(): any {
        const requestOptions: any = {
            port: this.options.port,
            headers: this.buildHandshake(this.options),
            method: "GET",
            timeout: 5000
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

    private configureSocketEvents(): void {
        this.established = true;
        this.socket.on("data", data => {
            if (this.closing) return;

            const frame = this.parseSingleWebSocketFrame(data);

            if (this.debug)
                console.log(
                    "@Moonlink(WebSocket) -",
                    frame,
                    frame.payload.toString("utf-8")
                );

            this.emit("message", frame.payload.toString("utf-8"));
        });

        this.socket.on("close", hadError => {
            if (hadError) this.emit("error", hadError);
            if (!this.closing) this.emit("close");
        });

        this.socket.on("error", error => this.emit("error", error));
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
            this.socket = socket;
            if (res.statusCode == 101) this.emit("open", this.socket);
            this.configureSocketEvents();
        });

        req.on("error", error => {
            this.emit("error", error);
        });

        req.on("close", code => {
            if (!this.established) this.emit("close", code);
        });

        req.end();
    }
    private parseSingleWebSocketFrame(data: Buffer): any {
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

    public close(code = 1000, reason = "closed"): void {
        if (this.socket && this.established) {
            this.closing = true;
            const closeFrame = this.createCloseFrame(1000, reason);

            this.socket.write(closeFrame);
            this.socket.end();
            this.emit("close", code, reason);
        }
    }
    private createCloseFrame(code, reason) {
        const buffer = Buffer.alloc(2 + Buffer.byteLength("closed"));
        buffer.writeUInt16BE(1000, 0);
        buffer.write("closed", 2, Buffer.byteLength("closed"), "utf-8");

        const closeFrame = Buffer.alloc(buffer.length + 2);
        closeFrame[0] = 0x88;
        closeFrame[1] = buffer.length;
        buffer.copy(closeFrame, 2);

        return closeFrame;
    }
}
