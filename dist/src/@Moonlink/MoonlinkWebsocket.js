"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkWebsocket = void 0;
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const url_1 = require("url");
const events_1 = require("events");
class WebSocketError extends Error {
    innerError;
    name;
    constructor(message, innerError) {
        super(message);
        this.name = "WebSocketError";
        this.innerError = innerError;
    }
}
class MoonlinkWebsocket extends events_1.EventEmitter {
    options;
    socket = null;
    agent;
    url;
    connectionCount = 0;
    constructor(url, options = {}) {
        super();
        this.url = new url_1.URL(url);
        this.options = {
            timeout: 1000,
            headers: {},
            keyGenerator: () => this.generateWebSocketKey(),
            pingInterval: 30000,
            maxConnections: 100,
            ...options,
        };
        this.agent = this.options.secure ? https : http;
    }
    connect() {
        if (this.connectionCount < this.options.maxConnections) {
            const requestOptions = {
                hostname: this.url.hostname,
                port: this.url.port,
                method: "GET",
                timeout: this.options.timeout || 5000,
                headers: this.buildHeaders(),
                protocol: this.options.secure ? "https:" : "http:",
            };
            this.socket = this.agent.request(requestOptions);
            this.setupSocketListeners();
            this.incrementConnectionCount();
            const pingTimer = setInterval(() => this.sendPing(), this.options.pingInterval);
            this.socket.on("close", () => {
                clearInterval(pingTimer);
                this.decrementConnectionCount();
            });
        }
        else {
            console.error("Maximum connection limit reached.");
        }
    }
    send(data) {
        if (this.socket) {
            this.socket.write(data);
        }
        else {
            console.error("WebSocket is not connected for sending.");
            this.emit("error", new Error("WebSocket is not connected for sending."));
        }
    }
    close(code, reason) {
        if (this.socket) {
            if (code && reason) {
                const closeFrame = this.createWebSocketCloseFrame(code, reason);
                this.socket.write(closeFrame);
            }
            this.socket.end();
        }
        else {
            console.error("WebSocket is not connected to close.");
            this.emit("error", new Error("WebSocket is not connected to close."));
        }
    }
    setupSocketListeners() {
        this.socket.on("error", this.handleSocketError.bind(this));
        this.socket.on("upgrade", this.handleSocketUpgrade.bind(this));
        this.socket.on("socket", this.handleSocketConnection.bind(this));
    }
    handleSocketError(err) {
        console.error("WebSocket error:", err);
        this.emit("error", new WebSocketError("WebSocket error", err));
    }
    handleSocketUpgrade(res, socket, head) {
        if (res.statusCode !== 101) {
            this.emit("error", new Error(`[ @Moonlink/Websocket ]: ${res.statusCode} ${res.statusMessage}`));
            return;
        }
        socket.on("data", (data) => {
            const frameHeader = this.parseFrameHeader(data);
            const payload = data.subarray(frameHeader.payloadStartIndex);
            this.emit("message", payload.toString());
        });
        socket.on("error", (err) => {
            console.error("WebSocket error:", err);
            this.emit("error", new WebSocketError("WebSocket error", err));
        });
        this.emit("open", socket);
    }
    handleSocketConnection(req) {
        req.on("close", () => this.emit("close"));
        req.on("end", () => this.emit("end"));
        req.on("timeout", () => this.emit("timeout"));
        req.on(this.options.secure ? "secureConnect" : "connect", () => {
            req.write(this.buildUpgradeHeaders() + "\r\n\r\n");
        });
    }
    parseFrameHeader(data) {
        if (data.length < 2) {
            throw new Error("WebSocket frame header is too short.");
        }
        const isFinalFrame = (data[0] & 0x80) !== 0;
        const opcode = data[0] & 0x0f;
        const isMasked = (data[1] & 0x80) !== 0;
        let payloadStartIndex = 2;
        let payloadLength = data[1] & 0x7f;
        if (payloadLength === 126) {
            if (data.length < 4) {
                throw new Error("WebSocket frame header is too short for extended payload length.");
            }
            payloadLength = data.readUInt16BE(2);
            payloadStartIndex = 4;
        }
        else if (payloadLength === 127) {
            if (data.length < 10) {
                throw new Error("WebSocket frame header is too short for extended payload length.");
            }
            const upperPart = data.readUInt32BE(6);
            const lowerPart = data.readUInt32BE(2);
            payloadLength = upperPart * Math.pow(2, 32) + lowerPart;
            payloadStartIndex = 10;
        }
        let mask = null;
        if (isMasked) {
            if (data.length < payloadStartIndex + 4) {
                throw new Error("WebSocket frame header is too short for masking key.");
            }
            mask = data.subarray(payloadStartIndex, payloadStartIndex + 4);
            payloadStartIndex += 4;
        }
        return {
            isFinalFrame,
            opcode,
            payloadLength,
            isMasked,
            mask,
            payloadStartIndex,
        };
    }
    generateWebSocketKey() {
        const keyBytes = [];
        for (let i = 0; i < 16; i++) {
            keyBytes.push(Math.floor(Math.random() * 256));
        }
        return Buffer.from(keyBytes).toString("base64");
    }
    createWebSocketCloseFrame(code, reason) {
        const buffer = Buffer.alloc(6);
        buffer.writeUInt16BE(code, 0);
        buffer.write(reason, 2, "utf8");
        return buffer;
    }
    sendPing() {
        if (this.socket) {
            this.socket.write(Buffer.from([0x89, 0]));
        }
    }
    isOpen() {
        return this.socket ? !this.socket.destroyed : false;
    }
    getRemoteAddress() {
        return this.socket ? this.socket.remoteAddress : null;
    }
    getRemotePort() {
        return this.socket ? this.socket.remotePort : null;
    }
    buildHeaders() {
        const headers = {
            "Sec-WebSocket-Key": this.options.keyGenerator(),
            "Sec-WebSocket-Version": "13",
            Upgrade: "websocket",
            Connection: "Upgrade",
            ...(this.options.headers || {}),
        };
        return headers;
    }
    buildUpgradeHeaders() {
        const headers = [
            `GET ${this.url.pathname}${this.url.search} HTTP/1.1`,
            `Host: ${this.url.host}`,
            "Upgrade: websocket",
            "Connection: Upgrade",
            `Sec-WebSocket-Key: ${this.options.keyGenerator()}`,
            "Sec-WebSocket-Version: 13",
        ];
        if (this.options.headers) {
            Object.keys(this.options.headers).forEach((key) => {
                headers.push(`${key}: ${this.options.headers[key]}`);
            });
        }
        return headers.join("\r\n");
    }
    incrementConnectionCount() {
        this.connectionCount++;
    }
    decrementConnectionCount() {
        this.connectionCount--;
    }
}
exports.MoonlinkWebsocket = MoonlinkWebsocket;
//# sourceMappingURL=MoonlinkWebsocket.js.map