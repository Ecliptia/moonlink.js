import { Player } from "./Player";
import { VoiceConnectionState } from "../typings/types";
import { EventEmitter } from "../Util";
interface VoiceEvents {
    stateChange: (state: VoiceConnectionState) => void;
    connect: () => void;
    disconnect: (err?: Error) => void;
}
export declare class Voice extends EventEmitter<VoiceEvents> {
    player: Player;
    state: VoiceConnectionState;
    sessionId: string | null;
    token: string | null;
    endpoint: string | null;
    isMoving: boolean;
    private connectionTimeout;
    private connectPromise;
    constructor(player: Player);
    get manager(): import("../..").Manager;
    private setState;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    handleStateUpdate(data: {
        session_id: string;
        channel_id: string | null;
    }): Promise<void>;
    handleServerUpdate(data: {
        token: string;
        endpoint: string;
    }): void;
    private checkCompletion;
    destroy(): void;
}
export {};
