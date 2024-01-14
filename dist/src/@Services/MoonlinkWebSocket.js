"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkWebSocket = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const crypto_1 = __importDefault(require("crypto"));
const events_1 = require("events");
class MoonlinkWebSocket extends events_1.EventEmitter {
    url;
    options;
    socket;
    established;
    closing = false;
    constructor(uri, options) {
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
    buildRequestOptions() {
        const requestOptions = {
            port: this.options.port,
            headers: this.buildHandshake(this.options),
            method: "GET",
            timeout: 5000
        };
        return this.options.secure
            ? requestOptions
            : { ...requestOptions, protocol: "http:" };
    }
    buildHandshake(options) {
        const headers = { ...options.headers };
        headers["Host"] = this.url.host;
        headers["Upgrade"] = "websocket";
        headers["Connection"] = "Upgrade";
        headers["Sec-WebSocket-Key"] = crypto_1.default
            .randomBytes(16)
            .toString("base64");
        headers["Sec-WebSocket-Version"] = "13";
        return headers;
    }
    configureSocketEvents() {
        this.established = true;
        this.socket.on("data", data => {
            if (!this.closing)
                this.parseWebSocketFrames(data);
        });
        this.socket.on("close", hadError => {
            if (hadError)
                this.emit("error", hadError);
            if (!this.closing)
                this.emit("close");
        });
        this.socket.on("error", error => this.emit("error", error));
        this.socket.on("lookup", () => { });
        this.socket.once("drain", () => {
            this.socket.end();
        });
    }
    connect() {
        const { request } = this.options.secure ? https_1.default : http_1.default;
        const requestOptions = this.buildRequestOptions();
        const req = request(`${this.options.secure ? "https://" : "http://"}${this.url.host}${this.url.pathname}${this.url.search || ""}`, requestOptions);
        req.on("upgrade", (res, socket, head) => {
            this.socket = socket;
            if (res.statusCode == 101)
                this.emit("open", this.socket);
            this.configureSocketEvents();
        });
        req.on("error", error => {
            this.emit("error", error);
        });
        req.on("close", code => {
            if (!this.established)
                this.emit("close", code);
        });
        req.end();
    }
    parseWebSocketFrames(data) {
        let offset = 0;
        while (offset < data.length) {
            const frameLength = this.readFrameLength(data, offset);
            const frameData = data.slice(offset, offset + frameLength);
            this.parseSingleWebSocketFrame(frameData);
            offset += frameLength;
        }
    }
    readFrameLength(data, offset) {
        const payloadLength = data.readUInt8(offset + 1) & 0b01111111;
        if (payloadLength === 126) {
            return data.readUInt16BE(offset + 2) + 8;
        }
        else if (payloadLength === 127) {
            return data.readUInt32BE(offset + 6) + 14;
        }
        return payloadLength + 6;
    }
    parseSingleWebSocketFrame(frameData) {
        const FIN = (frameData[0] & 0b10000000) !== 0;
        const opcode = frameData[0] & 0b00001111;
        const masked = (frameData[1] & 0b10000000) !== 0;
        let payloadLength = frameData[1] & 0b01111111;
        let payloadOffset = 2;
        if (payloadLength === 126) {
            payloadLength = frameData.readUInt16BE(payloadOffset);
            payloadOffset += 2;
        }
        else if (payloadLength === 127) {
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
    close(code = 1000, reason = "closed") {
        if (this.socket && this.established) {
            this.closing = true;
            const closeFrame = this.createCloseFrame(1000, reason);
            this.socket.write(closeFrame);
            this.socket.end();
            this.emit("close", code, reason);
        }
    }
    createCloseFrame(code, reason) {
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
exports.MoonlinkWebSocket = MoonlinkWebSocket;
