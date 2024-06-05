import { Plugin, Node, Rest, Player, Queue, Track, PlayerManager, NodeManager } from "../../index"

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
    noReplace?: boolean;
}
export interface IPlayerConfig {
    guildId: string;
    voiceChannelId: string;
    textChannelId: string;
    volume?: number;
    node?: string;
}
export interface IVoiceState {
    token?: string;
    session_id?: string;
    endpoint?: string;
}
export interface IRESTOptions {
    guildId: string;
    data: IRESTData;
}
export interface IRESTData {
    track?: IObjectTrack;
    identifier?: string;
    startTime?: number;
    endTime?: number;
    volume?: number;
    position?: number;
    paused?: Boolean;
    filters?: Object;
    voice?: IVoiceState;
}
export interface IObjectTrack {
    encoded?: string;
    identifier?: string;
    userData?: unknown;
}
export interface IExtendable {
    Node: typeof Node;
    Rest: typeof Rest;
    Player: typeof Player;
    Track: typeof Track;
    Queue: typeof Queue;
    PlayerManager: typeof PlayerManager;
    NodeManager: typeof NodeManager;
}