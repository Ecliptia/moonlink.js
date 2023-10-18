"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkWebsocket = void 0;
const events_1 = require("events");
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const url_1 = require("url");
class MoonlinkWebsocket extends events_1.EventEmitter {
    options;
    socket = null;
    url;
    connectionCount = 0;
    buffers = [];
    constructor(url, options = {}) {
        super();
        this.url = new url_1.URL(url);
        this.options = {
            timeout: 1000,
            headers: {},
            maxConnections: 100,
            secure: false,
            ...options,
        };
    }
    buildRequestOptions() {
        const requestOptions = {
            hostname: this.options.host,
            port: this.options.port,
            headers: this.buildHeaders(),
            method: "GET",
            path: "/v4/websocket",
        };
        return this.options.secure
            ? requestOptions
            : { ...requestOptions, protocol: "http:" };
    }
    buildHeaders() {
        const headers = { ...this.options.headers };
        headers["Host"] = this.url.host;
        headers["Upgrade"] = "websocket";
        headers["Connection"] = "Upgrade";
        headers["Sec-WebSocket-Key"] = this.generateWebSocketKey();
        headers["Sec-WebSocket-Version"] = "13";
        return headers;
    }
    connect() {
        const requestOptions = this.buildRequestOptions();
        const req = this.options.secure
            ? https_1.default.request(requestOptions)
            : http_1.default.request(requestOptions);
        req.on("upgrade", (res, socket) => {
            this.handleWebSocketConnection(socket);
        });
        req.end();
    }
    handleWebSocketConnection(socket) {
        this.socket = socket;
        this.socket.on("connect", () => {
            this.emit("open");
        });
        this.socket.on("data", (data) => {
            this.handleWebSocketData(data);
        });
        this.socket.on("close", () => {
            this.emit("close");
        });
        this.socket.on("error", (error) => {
            this.emit("error", error);
        });
        this.socket.setEncoding("utf8");
    }
    handleWebSocketData(data) {
        this.buffers.push(data);
        this.emitMessagesFromBuffers();
    }
    emitMessagesFromBuffers() {
        for (let i = 0; i < this.buffers.length; i++) {
            const jsonObjects = this.findJSONObjects(this.buffers[i]);
            if (jsonObjects.length > 0) {
                for (const jsonObj of jsonObjects) {
                    const buffer = Buffer.from(JSON.stringify(jsonObj));
                    this.emit("message", buffer);
                }
            }
        }
        this.buffers = [];
    }
    findJSONObjects(input) {
        const jsonObjects = [];
        const objectOpen = "{";
        const objectClose = "}";
        let currentObject = "";
        for (let i = 0; i < input.length; i++) {
            const char = input.charAt(i);
            if (char === objectOpen) {
                let objectCount = 1;
                currentObject = char;
                for (let j = i + 1; j < input.length; j++) {
                    currentObject += input.charAt(j);
                    if (input.charAt(j) === objectOpen) {
                        objectCount++;
                    }
                    else if (input.charAt(j) === objectClose) {
                        objectCount--;
                        if (objectCount === 0) {
                            try {
                                const parsedObject = JSON.parse(currentObject);
                                jsonObjects.push(parsedObject);
                            }
                            catch (error) { }
                            i = j;
                            break;
                        }
                    }
                }
            }
        }
        return jsonObjects;
    }
    generateWebSocketKey() {
        const keyBytes = new Array(16);
        for (let i = 0; i < 16; i++) {
            keyBytes[i] = Math.floor(Math.random() * 256);
        }
        const key = Buffer.from(keyBytes).toString("base64");
        return key;
    }
    close(code, reason) {
        if (this.socket) {
            const closeFrame = this.generateCloseFrame(code, reason);
            this.socket.write(closeFrame);
        }
    }
    generateCloseFrame(code, reason) {
        const codeBuffer = Buffer.allocUnsafe(2);
        codeBuffer.writeUInt16BE(code, 0);
        let reasonBuffer = Buffer.from(reason, "utf8");
        if (reasonBuffer.length > 123) {
            reasonBuffer = reasonBuffer.slice(0, 123);
        }
        const frameBuffer = Buffer.allocUnsafe(2 + reasonBuffer.length);
        codeBuffer.copy(frameBuffer, 0);
        reasonBuffer.copy(frameBuffer, 2);
        frameBuffer[0] = 0x88;
        return frameBuffer;
    }
}
exports.MoonlinkWebsocket = MoonlinkWebsocket;
//# sourceMappingURL=MoonlinkWebsocket.js.map