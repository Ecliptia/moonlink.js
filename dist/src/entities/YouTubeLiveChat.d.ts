import { EventEmitter } from "../Util";
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
export declare class YouTubeLiveChat extends EventEmitter<YouTubeLiveChatEvents> {
    private readonly node;
    readonly identifier: string;
    private ws?;
    private reconnectAttempts;
    private readonly autoReconnect;
    private readonly reconnectDelay;
    private readonly maxReconnectAttempts;
    private closedByUser;
    constructor(node: Node, identifier: string, options?: YouTubeLiveChatOptions);
    connect(): this;
    close(code?: number, reason?: string): void;
    private attachSocket;
    private scheduleReconnect;
}
export {};
