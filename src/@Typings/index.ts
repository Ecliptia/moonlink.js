//Nodes ---
export interface INodeStats {
    players: number;
    playingPlayers: number;
    uptime: number;
    memory: {
        reservable: number;
        used: number;
        free: number;
        allocated: number;
    };
    frameStats: {
        sent: number;
        deficit: number;
        nulled: number;
    };
    cpu: {
        cores: number;
        systemLoad: number;
        lavalinkLoad: number;
    };
}
export interface INode {
    host: string;
    identifier?: string;
    password: string;
    port: number;
    secure: boolean;
}

export interface IOptions {
    clientId?: string;
}

export interface IHeaders {
  Authorization: string;
  "User-Id": string;
  "Client-Name": string;
}