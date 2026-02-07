"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceReceiver = void 0;
const Util_1 = require("../Util");
const WebSocket_1 = require("../services/WebSocket");
class VoiceReceiver extends Util_1.EventEmitter {
    node;
    guildId;
    ws;
    reconnectAttempts = 0;
    autoReconnect;
    reconnectDelay;
    maxReconnectAttempts;
    closedByUser = false;
    constructor(node, guildId, options = {}) {
        super();
        if (!node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("voiceReceive");
        }
        this.node = node;
        this.guildId = guildId;
        this.autoReconnect = options.autoReconnect ?? true;
        this.reconnectDelay = options.reconnectDelay ?? 5000;
        this.maxReconnectAttempts = options.maxReconnectAttempts ?? 5;
    }
    connect() {
        if (!this.node.manager.clientId) {
            throw new Error("Voice receive requires an initialized manager clientId.");
        }
        this.closedByUser = false;
        const protocol = this.node.secure ? "wss" : "ws";
        const url = `${protocol}://${this.node.host}:${this.node.port}/${this.node.pathVersion}/websocket/voice/${this.guildId}`;
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
            if (!Buffer.isBuffer(data))
                return;
            const frame = this.parseFrame(data);
            if (!frame)
                return;
            if (frame.op === 1)
                this.emit("start", frame);
            else if (frame.op === 2)
                this.emit("stop", frame);
            else if (frame.op === 3)
                this.emit("data", frame);
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
            this.emit("error", new Error("Voice receive max reconnect attempts reached."));
            return;
        }
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectDelay);
    }
    parseFrame(buffer) {
        try {
            if (buffer.length < 12) {
                throw new Error("Voice receive frame too short.");
            }
            const op = buffer.readUInt8(0);
            const formatCode = buffer.readUInt8(1);
            let offset = 2;
            const guildLen = buffer.readUInt8(offset++);
            const guildId = buffer.toString("utf8", offset, offset + guildLen);
            offset += guildLen;
            const userLen = buffer.readUInt8(offset++);
            const userId = buffer.toString("utf8", offset, offset + userLen);
            offset += userLen;
            const ssrc = buffer.readUInt32BE(offset);
            offset += 4;
            const timestamp = buffer.readUInt32BE(offset);
            offset += 4;
            const payload = buffer.slice(offset);
            const format = formatCode === 0 ? "opus" : formatCode === 2 ? "pcm_s16le" : "unknown";
            return { op, format, guildId, userId, ssrc, timestamp, payload };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.emit("error", new Error(`Voice receive parse error: ${message}`));
            return null;
        }
    }
}
exports.VoiceReceiver = VoiceReceiver;
//# sourceMappingURL=VoiceReceiver.js.map