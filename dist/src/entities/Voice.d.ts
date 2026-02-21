import { Player } from "./Player";
import { VoiceConnectionState, VoiceStateUpdate, VoiceServerUpdate } from "../typings/types";
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
    private reconnectionTimer;
    private lastConnectionStatus;
    private lastVoiceUpdate;
    private voiceUpdateInFlight;
    private moveNonce;
    private pendingPlaybackRestoreNonce;
    private moveRestartInFlight;
    private lastMoveAt;
    constructor(player: Player);
    get manager(): import("../..").Manager;
    wasRecentlyMoved(windowMs?: number): boolean;
    private setState;
    connect(options: {
        selfDeaf: boolean;
        selfMute: boolean;
    }): Promise<void>;
    disconnect(): Promise<void>;
    handleStateUpdate(data: VoiceStateUpdate): Promise<void>;
    handleServerUpdate(data: VoiceServerUpdate): void;
    check(connected: boolean): void;
    private recover;
    private checkCompletion;
    destroy(): void;
}
export {};
