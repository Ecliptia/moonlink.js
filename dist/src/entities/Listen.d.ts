import { Player } from "./Player";
import { EventEmitter } from "events";
import WebSocket from "../services/WebSocket";
export declare class Listen {
    player: Player;
    voiceReceiverWs: WebSocket;
    constructor(player: Player);
    start(): EventEmitter;
    stop(): boolean;
}
