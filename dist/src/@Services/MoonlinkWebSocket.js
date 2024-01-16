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
    debug = false;
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
        require("net").setDefaultAutoSelectFamily(false);
        this.options.debug !== undefined && this.options.debug == true
            ? (this.debug = true)
            : null;
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
            if (this.closing)
                return;
            const frame = this.parseSingleWebSocketFrame(data);
            if (this.debug)
                console.log("@Moonlink(WebSocket) - ", frame, frame.payload.toString("utf-8"));
            this.emit("message", frame.payload.toString("utf-8"));
        });
        this.socket.on("close", hadError => {
            if (hadError)
                this.emit("error", hadError);
            if (!this.closing)
                this.emit("close");
        });
        this.socket.on("error", error => this.emit("error", error));
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
    parseSingleWebSocketFrame(data) {
        const opcode = data[0] & 0x0f;
        const fin = (data[0] & 0x80) === 0x80;
        const mask = (data[1] & 0x80) === 0x80;
        let payloadOffset = 2;
        let payloadLength = data[1] & 0x7f;
        if (payloadLength === 126) {
            payloadLength = data.readUInt16BE(2);
            payloadOffset += 2;
        }
        else if (payloadLength === 127) {
            payloadLength = data.readUInt32BE(2);
            payloadOffset += 8;
        }
        const maskingKey = mask
            ? data.slice(payloadOffset, payloadOffset + 4)
            : null;
        payloadOffset += mask ? 4 : 0;
        const payload = data.slice(payloadOffset, payloadOffset + payloadLength);
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
