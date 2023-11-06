"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkWebsocket = void 0;
const events_1 = require("events");
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const crypto_1 = __importDefault(require("crypto"));
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
        this.url = url;
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
        headers["Sec-WebSocket-Key"] = crypto_1.default.randomBytes(16).toString("hex");
        headers["Sec-WebSocket-Version"] = "13";
        return headers;
    }
    connect() {
        try {
            new url_1.URL(this.url);
        }
        catch (error) {
            this.emit("error", error);
            this.emit("close", 1006, "Invalid URL");
            return;
        }
        const requestOptions = this.buildRequestOptions();
        const protocol = this.options.secure ? https_1.default : http_1.default;
        const req = protocol.request(this.url, requestOptions, (res) => {
            if (res.statusCode !== 101) {
                this.emit("error", new Error(`WebSocket upgrade failed with status code ${res.statusCode}`));
                this.emit("close", 1006, "Upgrade Failed");
                return;
            }
        });
        req.on("error", (error) => {
            this.emit("error", error);
            this.emit("close", 1006, "Request Error");
        });
        req.on("close", () => {
            if (!this.established)
                this.emit("close", 1006, "Connection Close");
        });
        req.on("upgrade", (res, socket) => {
            this.handleWebSocketConnection(socket);
        });
        req.end();
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
        this.socket.on("close", () => this.emit("close", 1006, "close"));
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