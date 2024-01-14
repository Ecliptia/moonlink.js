import http from "http";
import https from "https";
import crypto from "crypto";
import { EventEmitter } from "events";

// @Author: 1Lucas1apk
// Code made entirely by me, the code can be used as inspiration for your own RFC 6455 Protocol
// Gravei a criação desse código pro precaução :)
export class MoonlinkWebSocket extends EventEmitter {
    private url: URL;
    private options: any;
    private socket: any;
    private established: boolean;
    private closing: boolean = false;
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
            if (!this.closing) this.parseWebSocketFrames(data);
        });

        this.socket.on("close", hadError => {
            if (hadError) this.emit("error", hadError);
            if (!this.closing) this.emit("close");
        });

        this.socket.on("error", error => this.emit("error", error));

        this.socket.on("lookup", () => {});
        this.socket.once("drain", () => {
            this.socket.end();
        });
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
    private parseWebSocketFrames(data: Buffer): void {
        let offset = 0;

        while (offset < data.length) {
            const frameLength = this.readFrameLength(data, offset);
            const frameData = data.slice(offset, offset + frameLength);
            this.parseSingleWebSocketFrame(frameData);
            offset += frameLength;
        }
    }

    private readFrameLength(data: Buffer, offset: number): number {
        const payloadLength = data.readUInt8(offset + 1) & 0b01111111;

        if (payloadLength === 126) {
            return data.readUInt16BE(offset + 2) + 8;
        } else if (payloadLength === 127) {
            return data.readUInt32BE(offset + 6) + 14;
        }

        return payloadLength + 6;
    }

    private parseSingleWebSocketFrame(frameData: Buffer): void {
        const FIN = (frameData[0] & 0b10000000) !== 0;
        const opcode = frameData[0] & 0b00001111;
        const masked = (frameData[1] & 0b10000000) !== 0;
        let payloadLength = frameData[1] & 0b01111111;
        let payloadOffset = 2;

        if (payloadLength === 126) {
            payloadLength = frameData.readUInt16BE(payloadOffset);
            payloadOffset += 2;
        } else if (payloadLength === 127) {
            payloadLength = frameData.readUInt32BE(payloadOffset + 4);
            payloadOffset += 8;
        }

        const maskingKey = masked
            ? frameData.slice(payloadOffset, payloadOffset + 4)
            : null;
        const payload = frameData.slice(payloadOffset + (masked ? 4 : 0));

        if (masked && maskingKey) {
            for (let i = 0; i < payload.length; i++) {
                payload[i] = payload[i] ^ maskingKey[i % 4];
            }
        }

        const parsedData = payload.toString("utf-8");
        this.emit("message", parsedData);
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
