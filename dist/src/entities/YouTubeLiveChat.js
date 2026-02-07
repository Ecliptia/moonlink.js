"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeLiveChat = void 0;
const Util_1 = require("../Util");
const WebSocket_1 = require("../services/WebSocket");
class YouTubeLiveChat extends Util_1.EventEmitter {
    node;
    identifier;
    ws;
    reconnectAttempts = 0;
    autoReconnect;
    reconnectDelay;
    maxReconnectAttempts;
    closedByUser = false;
    constructor(node, identifier, options = {}) {
        super();
        if (!node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("youtubeLiveChat");
        }
        this.node = node;
        this.identifier = identifier;
        this.autoReconnect = options.autoReconnect ?? true;
        this.reconnectDelay = options.reconnectDelay ?? 5000;
        this.maxReconnectAttempts = options.maxReconnectAttempts ?? 5;
    }
    connect() {
        if (!this.node.manager.clientId) {
            throw new Error("YouTube live chat requires an initialized manager clientId.");
        }
        this.closedByUser = false;
        const protocol = this.node.secure ? "wss" : "ws";
        const encodedId = encodeURIComponent(this.identifier);
        const url = `${protocol}://${this.node.host}:${this.node.port}/${this.node.pathVersion}/websocket/youtube/live/${encodedId}`;
        this.ws = new WebSocket_1.WebSocket(url, {
            headers: {
                "Authorization": this.node.password,
                "User-Id": this.node.manager.clientId,
                "Client-Name": this.node.manager.options.clientName,
            },
        });
        this.attachSocket(this.ws);
        return this;
    }
    close(code = 1000, reason = "closed") {
        this.closedByUser = true;
        this.ws?.close(code, reason);
    }
    attachSocket(socket) {
        socket.on("open", () => {
            this.reconnectAttempts = 0;
            this.emit("open");
        });
        socket.on("message", ({ data }) => {
            const text = typeof data === "string" ? data : data.toString("utf8");
            if (!text)
                return;
            let payload;
            try {
                payload = JSON.parse(text);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                this.emit("error", new Error(`YouTube live chat parse error: ${message}`));
                return;
            }
            this.emit("raw", payload);
            if (payload && payload.type === "message") {
                this.emit("message", payload);
            }
            else if (payload && payload.type === "action") {
                this.emit("action", payload);
            }
        });
        socket.on("error", ({ error }) => {
            const err = error instanceof Error ? error : new Error(String(error));
            this.emit("error", err);
        });
        socket.on("close", ({ code, reason }) => {
            this.emit("close", code, reason);
            if (!this.closedByUser && this.autoReconnect) {
                this.scheduleReconnect();
            }
        });
    }
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.emit("error", new Error("YouTube live chat max reconnect attempts reached."));
            return;
        }
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectDelay);
    }
}
exports.YouTubeLiveChat = YouTubeLiveChat;
//# sourceMappingURL=YouTubeLiveChat.js.map