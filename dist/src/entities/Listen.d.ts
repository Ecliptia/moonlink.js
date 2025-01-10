import { Player } from "./Player";
import { EventEmitter } from "events";
export declare class Listen {
    player: Player;
    voiceReceiverWs: WebSocket;
    constructor(player: Player);
    start(): EventEmitter;
    stop(): boolean;
}
