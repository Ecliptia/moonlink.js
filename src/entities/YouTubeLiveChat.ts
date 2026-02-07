import { EventEmitter, nodeLinkOnlyError } from "../Util";
import { WebSocket } from "../services/WebSocket";
import type { Node } from "./Node";

export type YouTubeLiveChatAuthor = {
    name?: string;
    id?: string;
    avatar?: string;
    isOwner?: boolean;
    isModerator?: boolean;
    isVerified?: boolean;
};

export type YouTubeLiveChatMessage = {
    type: "message";
    author?: YouTubeLiveChatAuthor;
    content?: string;
    timestamp?: number;
};

export type YouTubeLiveChatAction = {
    type: "action";
    action?: string;
    author?: YouTubeLiveChatAuthor;
    amount?: string;
    content?: string;
    timestamp?: number;
};

export type YouTubeLiveChatPayload = YouTubeLiveChatMessage | YouTubeLiveChatAction | Record<string, any>;

export interface YouTubeLiveChatOptions {
    autoReconnect?: boolean;
    reconnectDelay?: number;
    maxReconnectAttempts?: number;
}

interface YouTubeLiveChatEvents {
    open: () => void;
    close: (code: number, reason: string) => void;
    error: (error: Error) => void;
    message: (payload: YouTubeLiveChatMessage) => void;
    action: (payload: YouTubeLiveChatAction) => void;
    raw: (payload: YouTubeLiveChatPayload) => void;
}

export class YouTubeLiveChat extends EventEmitter<YouTubeLiveChatEvents> {
    private readonly node: Node;
    public readonly identifier: string;
    private ws?: WebSocket;
    private reconnectAttempts = 0;
    private readonly autoReconnect: boolean;
    private readonly reconnectDelay: number;
    private readonly maxReconnectAttempts: number;
    private closedByUser = false;

    constructor(node: Node, identifier: string, options: YouTubeLiveChatOptions = {}) {
        super();
        if (!node.isNodeLink) {
            throw nodeLinkOnlyError("youtubeLiveChat");
        }
        this.node = node;
        this.identifier = identifier;
        this.autoReconnect = options.autoReconnect ?? true;
        this.reconnectDelay = options.reconnectDelay ?? 5000;
        this.maxReconnectAttempts = options.maxReconnectAttempts ?? 5;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public connect(): this {
        if (!this.node.manager.clientId) {
            throw new Error("YouTube live chat requires an initialized manager clientId.");
        }
        this.closedByUser = false;
        const protocol = this.node.secure ? "wss" : "ws";
        const encodedId = encodeURIComponent(this.identifier);
        const url = `${protocol}://${this.node.host}:${this.node.port}/${this.node.pathVersion}/websocket/youtube/live/${encodedId}`;
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
            const text = typeof data === "string" ? data : data.toString("utf8");
            if (!text) return;
            let payload: YouTubeLiveChatPayload;
            try {
                payload = JSON.parse(text);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                this.emit("error", new Error(`YouTube live chat parse error: ${message}`));
                return;
            }

            this.emit("raw", payload);
            if (payload && (payload as YouTubeLiveChatMessage).type === "message") {
                this.emit("message", payload as YouTubeLiveChatMessage);
            } else if (payload && (payload as YouTubeLiveChatAction).type === "action") {
                this.emit("action", payload as YouTubeLiveChatAction);
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

    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.emit("error", new Error("YouTube live chat max reconnect attempts reached."));
            return;
        }
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectDelay);
    }
}
