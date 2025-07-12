import { Plugin, Node, Rest, Player, Queue, Track, Filters, Lyrics, Listen, PlayerManager, NodeManager, SearchResult, Database } from "../../index";
import { TLoadResultType, TPlayerLoop, TSortTypeNode, TTrackEndType, TPartialTrackProperties, NodeState } from "./types";
export interface IEvents {
    autoLeaved: (player: Player, track: Track) => void;
    debug: (...args: any) => void;
    nodeRaw: (node: INode, payload: any) => void;
    nodeCreate: (node: INode) => void;
    nodeReady: (node: INode, stats: INodeStats) => void;
    nodeConnected: (node: INode) => void;
    nodeError: (node: INode, error: Error) => void;
    nodeReconnect: (node: INode) => void;
    nodeDisconnect: (node: INode, code: number, reason: string) => void;
    nodeDestroy: (identifier: string) => void;
    nodeAutoResumed: (node: INode, players: Player[]) => void;
    playerCreate: (player: Player) => void;
    playerUpdate: (player: Player, track: Track, payload: any) => void;
    playerDestroy: (player: Player) => void;
    playerSwitchedNode: (player: Player, oldNode: Node, newNode: Node) => void;
    playerTriggeredPlay: (player: Player, track: Track) => void;
    playerTriggeredPause: (player: Player) => void;
    playerTriggeredResume: (player: Player) => void;
    playerTriggeredStop: (player: Player) => void;
    playerTriggeredSkip: (player: Player, oldTrack: Record<string, any>, currentTrack: Track, postion: number) => void;
    playerTriggeredSeek: (player: Player, position: number) => void;
    playerTriggeredShuffle: (player: Player, oldQueue: Record<string, any>, currentQueue: Track[]) => void;
    playerChangedVolume: (player: Player, oldVolume: number, volume: number) => void;
    playerChangedLoop: (player: Player, oldLoop: TPlayerLoop, loop: TPlayerLoop, oldLoopCount?: number, newLoopCount?: number) => void;
    playerAutoPlaySet: (player: Player, autoPlay: boolean) => void;
    playerAutoLeaveSet: (player: Player, autoLeave: boolean) => void;
    playerTextChannelIdSet: (player: Player, oldChannel: string, newChannel: string) => void;
    playerVoiceChannelIdSet: (player: Player, oldChannel: string, newChannel: string) => void;
    playerNodeSet: (player: Player, oldNode: string, newNode: string) => void;
    playerConnecting: (player: Player) => void;
    playerReady: (player: Player) => void;
    playerResuming: (player: Player) => void;
    playerResumed: (player: Player) => void;
    playerConnected: (player: Player) => void;
    playerDisconnected: (player: Player) => void;
    playerReconnect: (player: Player, reason?: string) => void;
    playerMoved: (player: Player, oldChannel: string, newChannel: string) => void;
    playerDestroyed: (player: Player, reason?: string) => void;
    playerTriggeredBack: (player: Player, track: Track) => void;
    trackStart: (player: Player, track: Track) => void;
    trackEnd: (player: Player, track: Track, type: TTrackEndType, payload?: any) => void;
    trackStuck: (player: Player, track: Track, threshold: number) => void;
    trackException: (player: Player, track: Track, exception: any) => void;
    queueEnd: (player: Player, track?: any) => void;
    socketClosed: (player: Player, code: number, reason: string, byRemote: boolean) => void;
    queueAdd: (player: Player, tracks: Track | Track[]) => void;
    queueRemove: (player: Player, tracks: Track | Track[]) => void;
    queueMoveRange: (player: Player, tracks: Track[], fromIndex: number, toIndex: number) => void;
    queueRemoveRange: (player: Player, tracks: Track[], startIndex: number, endIndex: number) => void;
    queueDuplicate: (player: Player, tracks: Track[], index: number) => void;
    filtersUpdate: (player: Player, filters: Filters) => void;
    sourceAdd: (source: ISource) => void;
    sourceRemove: (source: string) => void;
    sourceClear: () => void;
    nodeStateChange: (node: Node, oldState: NodeState, newState: NodeState) => void;
    playerSpeak: (player: Player, text: string, options?: IFloweryTTSOptions) => void;
}
export interface INode {
    host: string;
    id?: number;
    identifier?: string;
    port: number;
    password?: string;
    retryDelay?: number;
    retryAmount?: number;
    regions?: string[];
    secure?: boolean;
    sessionId?: string;
    pathVersion?: string;
    priority?: number;
}
export interface ISource {
    name: string;
    load: (url: string, options: any) => Promise<any>;
    search: (query: string, options: any) => Promise<any>;
    resolve: (url: string, options: any) => Promise<any>;
    match: (url: string) => boolean;
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
    logFile?: {
        path: string;
        log: boolean;
    };
    movePlayersOnReconnect?: boolean;
    sortPlayersByRegion?: boolean;
    autoResume?: boolean;
    resume?: boolean;
    partialTrack?: TPartialTrackProperties[];
    disableDatabase?: boolean;
    disableNativeSources?: boolean;
    blacklisteSources?: string[];
    enabledSources?: string[];
    spotify?: {
        limitLoadPlaylist?: number;
        limitLoadAlbum?: number;
        limitLoadArtist?: number;
        limitLoadSearch?: number;
        limitLoadRecommendations?: number;
    };
    deezer?: {
        maxSearchResults?: number;
        maxAlbumTracks?: number;
        maxPlaylistTracks?: number;
        maxArtistTracks?: number;
    };
    nodeHealthCheckInterval?: number;
    defaultPlayer?: IPlayerConfig;
    enableSourceFallback?: boolean;
}
export interface IPlayerConfig {
    guildId: string;
    voiceChannelId: string;
    textChannelId: string;
    volume?: number;
    loop?: TPlayerLoop;
    loopCount?: number;
    autoPlay?: boolean;
    autoLeave?: boolean;
    node?: string;
}
export interface IVoiceState {
    token?: string;
    sessionId?: string;
    endpoint?: string;
    attempt?: boolean;
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
    originNodeIdentifier?: string;
}
export interface IPlaylistInfo {
    name: string;
    selectedTrack: number;
    duration: number;
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
    Database: typeof Database;
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
    SearchResult: typeof SearchResult;
}
export interface IRESTGetPlayers {
    guildId: string;
    track: ITrack;
    volume: number;
    paused: boolean;
    state: Object;
    voice: IVoiceState;
    filters: Object;
}
export interface INodeInfo {
    version: {
        semver: string;
        major: number;
        minor: number;
        patch: number;
        preRelease?: string;
    };
    buildTime: number;
    git: {
        branch: string;
        commit: string;
        commitTime: number;
    };
    jvm: string;
    lavaplayer: string;
    sourceManagers: string[];
    filters: string[];
    plugins: {
        name: string;
        version: string;
    }[];
}
export interface INodeVersion {
    semver: string;
    major: number;
    minor: number;
    patch: number;
    preRelease?: string;
}
export interface ISession {
    resuming: boolean;
    timeout: number;
}
export interface IRoutePlannerStatus {
    class?: string;
    details?: {
        ipBlock: {
            type: string;
            size: string;
        };
        failingAddresses: {
            address: string;
            failingTimestamp: number;
            failingTime: string;
        }[];
        rotateIndex: string;
        ipIndex: string;
        currentAddress: string;
        blockIndex: string;
        currentAddressIndex: string;
    };
}
export interface IFloweryTTSOptions {
    voice?: string;
    translate?: boolean;
    silence?: number;
    speed?: number;
    audio_format?: "mp3" | "ogg_opus" | "ogg_vorbis" | "aac" | "wav" | "flac";
}
