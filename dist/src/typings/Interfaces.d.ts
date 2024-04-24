import { Plugin, Node, Rest, Player } from "../../index";
export interface IEvents {
    debug: (...args: string[]) => void;
    nodeCreate: (node: INode) => void;
    nodeDestroy: (node: INode) => void;
}
export interface INode {
    host: string;
    id?: number;
    identifier?: string;
    port: number;
    password?: string;
    retryDelay?: number;
    retryAmount?: number;
    regions?: String[];
    secure?: boolean;
    sessionId?: string;
}
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
export interface IConfigManager {
    nodes: INode[];
    options: IOptionsManager;
    sendPayload: Function;
}
export interface IOptionsManager {
    clientName?: string;
    clientId?: string;
    defaultPlatformSearch?: string;
    plugins?: Plugin[];
    partialTrack?: any;
}
export interface IPlayerConfig {
    guildId: string;
    voiceChannelId: string;
    textChannelId: string;
    volume?: number;
}
export interface IExtendable {
    Node: typeof Node;
    Rest: typeof Rest;
    Player: typeof Player;
}
