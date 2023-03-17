export = MoonlinkNodes;
declare class MoonlinkNodes {
    constructor(MoonlinkManager: any, nodes: any, options: any, sPayload: any, clientId: any);
    manager: any;
    nodes: any;
    options: any;
    sPayload: any;
    clientId: any;
    version: string;
    retryTime: number;
    reconnectAtattempts: number;
    retryAmount: number;
    init(): void;
    idealNode(): any;
    sendWs(json: any): void;
    create(options: any, clientId: any): void;
    ws: WebSocket;
    ManagerNodes(node: any, ws: any): void;
    reconnect(node: any): void;
    get(identify: any): any;
    get size(): number;
    #private;
}
import WebSocket = require("ws");
