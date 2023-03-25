export class MoonlinkNodes {
    constructor(manager: any, my_information: any, manager_map: any);
    host: any;
    port: any;
    identifier: any;
    isConnected: boolean;
    secure: any;
    retryTime: number;
    reconnectAtattempts: number;
    retryAmount: number;
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
    options: any;
    sPayload: any;
    clientId: any;
    manager: any;
    version: string;
    calls: number;
    sendWs: (data: any) => Promise<any>;
    init(): void;
    request(endpoint: any, params: any): Promise<any>;
    create(): Promise<void>;
    ws: WebSocket;
    players(guildId: any): void;
    reconnect(): void;
    reconnectTimeout: NodeJS.Timeout;
    open(): void;
    close(code: any, reason: any): void;
    message(data: any): void;
    error(error: any): void;
    handleEvent(payload: any): Promise<any>;
    #private;
}
import WebSocket = require("ws");
