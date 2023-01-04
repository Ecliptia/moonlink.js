import { EventEmitter } from 'events';

declare module 'ws' {
  export default class WebSocket {
    constructor(url: string, protocols?: string | string[]);
  }
}

declare module './MoonlinkUtils' {
  export function request(options: any): Promise<any>;
  export function esdw(sPayload: (json: any) => void): void;
  export function makeRequest(url: string, method: string, options: any): Promise<any>;
  export const map: Map<string, any>;
}

declare module './MoonlinkNodes' {
  export default class Nodes {
    constructor(manager: any, nodes: any[], options: any, sPayload: (json: any) => void, clientId: string);
    init(): void;
    sendWs(json: any): any;
  }
}

interface MoonlinkManagerOptions {
  shard?: number;
  clientName?: string;
}

interface MoonlinkManagerNode {
  host: string;
  port?: number;
  password: string;
}

interface MoonlinkManagerPacket {
  t: string;
  d: {
    guild_id: string;
  }
}

interface MoonlinkManagerVoiceServer {
  [key: string]: {
    event: any;
  }
}

interface MoonlinkManagerVoiceStates {
  [key: string]: any;
}

declare class MoonlinkManager extends EventEmitter {
  #reconnectAtattempts: number;
  #retryAmount: number;
  #retryTime: number;
  #TokenSpotify: string;
  #request: (options: any) => Promise<any>;
  #on: boolean;
  #ws: any;
  #options: MoonlinkManagerOptions;
  #sPayload: (json: any) => void;
  #nodes: MoonlinkManagerNode[];

  version: string;
  nodes: any;
  sendWs: (json: any) => any;
  clientId: string;

  constructor(
    lavalinks: MoonlinkManagerNode[],
    options: MoonlinkManagerOptions,
    sPayload: (json: any) => void,
  );

  init(clientId: string): void;
  updateVoiceState(packet: MoonlinkManagerPacket): void;
  request(node: MoonlinkManagerNode, endpoint: string, params: string): Promise<any>;
  search(...options: any[]): Promise<any>;
}

declare var manager: MoonlinkManager;
export MoonlinkManager
