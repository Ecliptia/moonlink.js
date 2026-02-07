import { EventEmitter, nodeLinkOnlyError } from "../Util";
import { WebSocket } from "../services/WebSocket";
import type { Node } from "./Node";

export type VoiceReceiveFormat = "opus" | "pcm_s16le" | "unknown";

export type VoiceReceiveFrame = {
    op: 1 | 2 | 3;
    format: VoiceReceiveFormat;
    guildId: string;
    userId: string;
    ssrc: number;
    timestamp: number;
    payload: Buffer;
};

export interface VoiceReceiverOptions {
    autoReconnect?: boolean;
    reconnectDelay?: number;
    maxReconnectAttempts?: number;
}

interface VoiceReceiverEvents {
    open: () => void;
    close: (code: number, reason: string) => void;
    error: (error: Error) => void;
    start: (frame: VoiceReceiveFrame) => void;
    stop: (frame: VoiceReceiveFrame) => void;
    data: (frame: VoiceReceiveFrame) => void;
}

export class VoiceReceiver extends EventEmitter<VoiceReceiverEvents> {
    private readonly node: Node;
    private readonly guildId: string;
    private ws?: WebSocket;
    private reconnectAttempts = 0;
    private readonly autoReconnect: boolean;
    private readonly reconnectDelay: number;
    private readonly maxReconnectAttempts: number;
    private closedByUser = false;

    constructor(node: Node, guildId: string, options: VoiceReceiverOptions = {}) {
        super();
        if (!node.isNodeLink) {
            throw nodeLinkOnlyError("voiceReceive");
        }
        this.node = node;
        this.guildId = guildId;
        this.autoReconnect = options.autoReconnect ?? true;
        this.reconnectDelay = options.reconnectDelay ?? 5000;
        this.maxReconnectAttempts = options.maxReconnectAttempts ?? 5;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public connect(): this {
        if (!this.node.manager.clientId) {
            throw new Error("Voice receive requires an initialized manager clientId.");
        }
        this.closedByUser = false;
        const protocol = this.node.secure ? "wss" : "ws";
        const url = `${protocol}://${this.node.host}:${this.node.port}/${this.node.pathVersion}/websocket/voice/${this.guildId}`;
        this.ws = new WebSocket(url, {
            headers: {
                "Authorization": this.node.password,
                "User-Id": this.node.manager.clientId,
                "Client-Name": this.node.manager.options.clientName,
            },
        });
        this.attachSocket(this.ws);
        return this;
    }

    public close(code: number = 1000, reason: string = "closed"): void {
        this.closedByUser = true;
        this.ws?.close(code, reason);
    }

    private attachSocket(socket: WebSocket): void {
        socket.on("open", () => {
            this.reconnectAttempts = 0;
            this.emit("open");
        });

        socket.on("message", ({ data }) => {
            if (!Buffer.isBuffer(data)) return;
            const frame = this.parseFrame(data);
            if (!frame) return;
            if (frame.op === 1) this.emit("start", frame);
            else if (frame.op === 2) this.emit("stop", frame);
            else if (frame.op === 3) this.emit("data", frame);
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

    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.emit("error", new Error("Voice receive max reconnect attempts reached."));
            return;
        }
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectDelay);
    }

    private parseFrame(buffer: Buffer): VoiceReceiveFrame | null {
        try {
            if (buffer.length < 12) {
                throw new Error("Voice receive frame too short.");
            }
            const op = buffer.readUInt8(0) as 1 | 2 | 3;
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

            const format: VoiceReceiveFormat =
                formatCode === 0 ? "opus" : formatCode === 2 ? "pcm_s16le" : "unknown";

            return { op, format, guildId, userId, ssrc, timestamp, payload };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.emit("error", new Error(`Voice receive parse error: ${message}`));
            return null;
        }
    }
}
