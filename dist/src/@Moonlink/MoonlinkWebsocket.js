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
    established = false;
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
            port: this.options.port,
            headers: this.buildHeaders(),
            method: "GET",
        };
        return this.options.secure
            ? requestOptions
            : { ...requestOptions, protocol: "http:" };
    }
    buildHeaders() {
        const headers = { ...this.options.headers };
        headers["Host"] = this.options.host;
        headers["Upgrade"] = "websocket";
        headers["Connection"] = "Upgrade";
        headers["Sec-WebSocket-Key"] = this.generateWebSocketKey();
        headers["Sec-WebSocket-Version"] = "13";
        return headers;
    }
    connect() {
        const requestOptions = this.buildRequestOptions();
        let url = `${this.options.secure ? "https://" : "http://"}${this.options.host}${this.url.pathname}${this.url.search}`;
        try {
            const req = this.options.secure
                ? https_1.default.request(url, requestOptions)
                : http_1.default.request(url, requestOptions);
            req.on("error", (error) => {
                this.emit("error", error);
                this.emit("close", 1006, "Error");
            });
            req.on("upgrade", (res, socket) => {
                this.handleWebSocketConnection(socket);
            });
            req.on("close", () => {
                if (!this.established)
                    this.emit("close", 1006, "Connection Close");
            });
            req.end();
        }
        catch (err) {
            console.log(err);
        }
    }
    handleWebSocketConnection(socket) {
        this.socket = socket;
        this.emit("open", socket);
        this.established = true;
        this.socket.on("end", () => {
            this.emit("close", 1006, "desconnected");
        });
        this.socket.on("data", (data) => {
            this.handleWebSocketData(data);
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
            this.socket.end();
            if (code && reason) {
                this.emit("close", code || 1000, reason || "WebSocket is closed.");
            }
        }
        else {
            this.emit("close", 1006, "WebSocket is not connected.");
        }
    }
}
exports.MoonlinkWebsocket = MoonlinkWebsocket;
//# sourceMappingURL=MoonlinkWebsocket.js.map