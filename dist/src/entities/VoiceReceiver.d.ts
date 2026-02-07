import { EventEmitter } from "../Util";
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
export declare class VoiceReceiver extends EventEmitter<VoiceReceiverEvents> {
    private readonly node;
    private readonly guildId;
    private ws?;
    private reconnectAttempts;
    private readonly autoReconnect;
    private readonly reconnectDelay;
    private readonly maxReconnectAttempts;
    private closedByUser;
    constructor(node: Node, guildId: string, options?: VoiceReceiverOptions);
    connect(): this;
    close(code?: number, reason?: string): void;
    private attachSocket;
    private scheduleReconnect;
    private parseFrame;
}
export {};
