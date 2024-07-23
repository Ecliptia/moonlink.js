/// <reference types="node" />
import { Player } from './Player';
import { EventEmitter } from 'events';
import WebSocket from 'ws';
export declare class Listen {
    player: Player;
    voiceReceiverWs: WebSocket;
    constructor(player: Player);
    start(): EventEmitter;
    stop(): boolean;
}
