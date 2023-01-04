
  import { EventEmitter } from 'events';
  import { MoonlinkManager } from 'MoonlinkManager';
  import { MoonlinkUtils } from 'MoonlinkUtils';

  export class MoonlinkNodes {
    ws: WebSocket;
    manager: MoonlinkManager;
    nodes: any[];
    options: any;
    sPayload: any;
    clientId: string;
    stats: {
      players: number;
      playingPlayers: number;
      uptime: number;
      memory: {
        free: number;
        used: number;
        allocated: number;
        reservable: number;
      };
      cpu: {
        cores: number;
        systemLoad: number;
        lavalinkLoad: number;
      };
      frameStats: {
        sent: number;
        nulled: number;
        deficit: number;
      };
    };
    retryTime: number;
    reconnectAtattempts: number;
    retryAmount: number;

    constructor(MoonlinkManager: MoonlinkManager, nodes: any[], options: any, sPayload: any, clientId: string);

    init(): void;
    idealNode(): any;
    sendWs(json: any): void;
    create(options: any[], clientId: string): void;
    onConnect(ws: WebSocket): void;
    onMessage(ws: WebSocket, data: any): void;
    onClose(ws: WebSocket, code: number, reason: string): void;
  }

