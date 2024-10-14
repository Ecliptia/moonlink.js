import { Plugin, Node, Rest, Player, Queue, Track, Filters, Lyrics, Listen, PlayerManager, NodeManager } from "../../index";
import { TLoadResultType, TPlayerLoop, TSortTypeNode, TTrackEndType } from "./types";
export interface IEvents {
    debug: (...args: any) => void;
    nodeRaw: (node: INode, player: Player, payload: any) => void;
    nodeCreate: (node: INode) => void;
    nodeReady: (node: INode, stats: INodeStats) => void;
    nodeConnected: (node: INode) => void;
    nodeError: (node: INode, error: Error) => void;
    nodeReconnect: (node: INode) => void;
    nodeDisconnect: (node: INode, code: number, reason: string) => void;
    nodeDestroy: (identifier: string) => void;
    playerCreate: (player: Player) => void;
    playerUpdate: (player: Player, track: Track, payload: any) => void;
    playerDestroy: (player: Player) => void;
    playerTriggeredPlay: (player: Player, track: Track) => void;
    playerTriggeredPause: (player: Player) => void;
    playerTriggeredResume: (player: Player) => void;
    playerTriggeredStop: (player: Player) => void;
    playerTriggeredSkip: (player: Player, oldTrack: Record<string, any>, currentTrack: Track, postion: number) => void;
    playerTriggeredSeek: (player: Player, position: number) => void;
    playerTriggeredShuffle: (player: Player, oldQueue: Record<string, any>, currentQueue: Track[]) => void;
    playerChangedVolume: (player: Player, oldVolume: number, volume: number) => void;
    playerChangedLoop: (player: Player, oldLoop: TPlayerLoop, loop: TPlayerLoop) => void;
    playerAutoPlaySet: (player: Player, autoPlay: boolean) => void;
    playerAutoLeaveSet: (player: Player, autoLeave: boolean) => void;
    playerTextChannelIdSet: (player: Player, oldChannel: string, newChannel: string) => void;
    playerVoiceChannelIdSet: (player: Player, oldChannel: string, newChannel: string) => void;
    playerNodeSet: (player: Player, oldNode: string, newNode: string) => void;
    playerConnected: (player: Player) => void;
    playerDisconnected: (player: Player) => void;
    playerMoved: (player: Player, oldChannel: string, newChannel: string) => void;
    playerDestroyed: (player: Player) => void;
    trackStart: (player: Player, track: Track) => void;
    trackEnd: (player: Player, track: Track, type: TTrackEndType, payload?: any) => void;
    trackStuck: (player: Player, track: Track, threshold: number) => void;
    trackException: (player: Player, track: Track, exception: any) => void;
    socketClosed: (player: Player, code: number, reason: string, byRemote: boolean) => void;
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
    sortTypeNode?: TSortTypeNode;
    plugins?: Plugin[];
    noReplace?: boolean;
    NodeLinkFeatures?: boolean;
    previousInArray?: boolean;
}
export interface IPlayerConfig {
    guildId: string;
    voiceChannelId: string;
    textChannelId: string;
    volume?: number;
    loop?: TPlayerLoop;
    autoPlay?: boolean;
    autoLeave?: boolean;
    node?: string;
}
export interface IVoiceState {
    token?: string;
    sessionId?: string;
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
export interface IRESTLoadTracks {
    loadType: TLoadResultType;
    data?: ILoadResultData;
}
export interface IRESTGetLyrics {
    loadType: TLoadResultType;
    data?: {
        name: string;
        synced: boolean;
        data: {
            startTime: number;
            endTime: number;
            text: string;
        }[];
        rtl: boolean;
    };
}
export interface ILoadResultData {
    info: IPlaylistInfo;
    tracks?: ITrack[];
    pluginInfo: Object;
}
export interface ITrack {
    encoded: string;
    info: ITrackInfo;
    pluginInfo: Object;
    userData: Object;
}
export interface ITrackInfo {
    title: string;
    uri?: string;
    author: string;
    length: number;
    isStream: boolean;
    isSeekable: boolean;
    position: number;
    artworkUrl?: string;
    identifier?: string;
    isrc?: string;
    sourceName?: string;
}
export interface IPlaylistInfo {
    name: string;
    selectedTrack?: number;
}
export interface IObjectTrack {
    encoded?: string;
    identifier?: string;
    userData?: unknown;
}
export interface ISearchResult {
    loadType: TLoadResultType;
    tracks: Track[];
    playlistInfo: IPlaylistInfo;
    data: {
        playlistInfo: IPlaylistInfo;
        tracks: ITrack[];
        pluginInfo: any;
    };
    exception?: {
        message: string;
        severity: string;
    };
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
export interface Equalizer {
    band: number;
    gain: number;
}
export interface Karaoke {
    level?: number;
    monoLevel?: number;
    filterBand?: number;
    filterWidth?: number;
}
export interface Timescale {
    speed?: number;
    pitch?: number;
    rate?: number;
}
export interface Tremolo {
    frequency?: number;
    depth?: number;
}
export interface Vibrato {
    frequency?: number;
    depth?: number;
}
export interface Rotation {
    rotationHz?: number;
}
export interface Distortion {
    sinOffset?: number;
    sinScale?: number;
    cosOffset?: number;
    cosScale?: number;
    tanOffset?: number;
    tanScale?: number;
    offset?: number;
    scale?: number;
}
export interface ChannelMix {
    leftToLeft?: number;
    leftToRight?: number;
    rightToLeft?: number;
    rightToRight?: number;
}
export interface LowPass {
    smoothing?: number;
}
export interface Extendable {
    Node: typeof Node;
    Rest: typeof Rest;
    Player: typeof Player;
    Track: typeof Track;
    Queue: typeof Queue;
    Filters: typeof Filters;
    Lyrics: typeof Lyrics;
    Listen: typeof Listen;
    PlayerManager: typeof PlayerManager;
    NodeManager: typeof NodeManager;
}
