import { Node } from "../entities/Node";
import { Player } from "../entities/Player";
import { Track } from "../entities/Track";
import { Filters } from "../entities/Filters";
import { NodeState, PlayerLoop, TrackEndReason, NodeSortStrategy, TPartialTrackProperties } from "./types";

export interface IManagerEvents {
    debug: (message: string) => void;

    // Node Events
    nodeCreate: (node: Node) => void;
    nodeReady: (node: Node, payload: any) => void;
    nodeConnected: (node: Node) => void;
    nodeError: (node: Node, error: Error) => void;
    nodeReconnect: (node: Node) => void;
    nodeReconnecting: (node: Node, attempt: number) => void;
    nodeResume: (node: Node) => void;
    nodeDisconnect: (node: Node, code: number, reason: string) => void;
    nodeDestroy: (identifier: string) => void;
    nodeRaw: (node: Node, payload: any) => void;
    nodeStateChange: (node: Node, oldState: NodeState, newState: NodeState) => void;

    // Player Events
    playerCreate: (player: Player) => void;
    playerDestroy: (player: Player, reason?: string) => void;
    playerUpdate: (player: Player, track: Track, payload: any) => void;
    playerSwitchedNode: (player: Player, oldNode: Node, newNode: Node) => void;
    playerConnecting: (player: Player) => void;
    playerConnected: (player: Player) => void;
    playerReady: (player: Player) => void;
    playerResuming: (player: Player) => void;
    playerResumed: (player: Player) => void;
    playerDisconnected: (player: Player) => void;
    playerReconnect: (player: Player, reason?: string) => void;
    playerMoved: (player: Player, oldChannel: string, newChannel: string) => void;
    playerMuteChange: (player: Player, selfMute: boolean, serverMute: boolean) => void;
    playerDeafChange: (player: Player, selfDeaf: boolean, serverDeaf: boolean) => void;
    playerSuppressChange: (player: Player, suppress: boolean) => void;
    playerAutoPlaySet: (player: Player, autoPlay: boolean) => void;
    playerAutoLeaveSet: (player: Player, autoLeave: boolean) => void;
    playerChangedVolume: (player: Player, oldVolume: number, volume: number) => void;
    playerChangedLoop: (player: Player, oldLoop: PlayerLoop, loop: PlayerLoop, oldLoopCount?: number, newLoopCount?: number) => void;
    playerTextChannelIdSet: (player: Player, oldChannel: string, newChannel: string) => void;
    playerVoiceChannelIdSet: (player: Player, oldChannel: string, newChannel: string) => void;
    playerNodeSet: (player: Player, oldNode: string, newNode: string) => void;
    playerRecoveryStarted: (player: Player) => void;
    playerRecoverySuccess: (player: Player) => void;
    playerRecoveryFailed: (player: Player) => void;
    
    // Failover Events
    playersMoved: (players: Player[], oldNode: Node, newNode: Node) => void;
    playersOrphaned: (players: Player[], deadNode: Node) => void;
    
    // Player Triggered Events
    playerTriggeredPlay: (player: Player, track: Track) => void;
    playerTriggeredPause: (player: Player) => void;
    playerTriggeredResume: (player: Player) => void;
    playerTriggeredStop: (player: Player) => void;
    playerTriggeredSkip: (player: Player, oldTrack: Record<string, any>, currentTrack: Track, position: number) => void;
    playerTriggeredSeek: (player: Player, position: number) => void;
    playerTriggeredShuffle: (player: Player, oldQueue: Record<string, any>, currentQueue: Track[]) => void;
    playerTriggeredBack: (player: Player, track: Track) => void;

    // Track Events
    trackStart: (player: Player, track: Track) => void;
    trackEnd: (player: Player, track: Track, reason: TrackEndReason, payload?: any) => void;
    trackStuck: (player: Player, track: Track, threshold: number, payload?: any) => void;
    trackException: (player: Player, track: Track, exception: any, payload?: any) => void;

    // Queue Events
    queueAdd: (player: Player, tracks: Track | Track[]) => void;
    queueRemove: (player: Player, tracks: Track | Track[]) => void;
    queueMoveRange: (player: Player, tracks: Track[], fromIndex: number, toIndex: number) => void;
    queueRemoveRange: (player: Player, tracks: Track[], startIndex: number, endIndex: number) => void;
    queueDuplicate: (player: Player, tracks: Track[], index: number) => void;
    queueEnd: (player: Player, lastTrack?: Track) => void;

    // Other Events
    filtersUpdate: (player: Player, filters: Filters) => void;
    socketClosed: (player: Player, code: number, reason: string, byRemote: boolean, payload?: any) => void;
    voiceSessionChanged: (player: Player, oldSessionId: string | boolean, sessionId: string) => void;
    autoPlayed: (player: Player, track: Track, previousTrack: Track) => void;
    autoLeaved: (player: Player, lastTrack?: Track) => void;
}

export interface IManagerNodeConfig {
    host: string;
    password: string;
    port: number;
    secure: boolean;
    identifier?: string;
    pathVersion?: string;
    retryDelay?: number;
    retryAmount?: number;
    regions?: string[];
    priority?: number;
}

export interface IManagerOptionsConfig {
    clientName?: string;
    userAgent?: string;
    noReplace?: boolean;
    resume?: boolean;
    resumeTimeout?: number;
    customFilters?: Record<string, string | IFilters>;
    defaultPlayer?: IDefaultPlayerOptions;
    voiceConnection?: IVoiceConnectionOptions;
    node?: INodeOptions;
    search?: ISearchOptions;
    queue?: IQueueOptions;
    sources?: ISourceOptions;
    playerDestruction?: IPlayerDestructionOptions;
    trackHandling?: ITrackHandlingOptions;
    trackPartial?: TPartialTrackProperties[];
    database?: {
        type: 'memory' | 'local';
        options?: any;
    };
}

export interface IDefaultPlayerOptions {
    volume?: number;
    autoPlay?: boolean;
    autoLeave?: boolean;
    selfDeaf?: boolean;
    selfMute?: boolean;
    loop?: "off" | "track" | "queue";
    historySize?: number;
}

export interface IVoiceConnectionOptions {
    timeout?: number;
    maxReconnectAttempts?: number;
    reconnectDelay?: number;
    autoReconnect?: boolean;
}

export interface INodeOptions {
    selectionStrategy?: NodeSortStrategy;
    retryDelay?: number;
    retryAmount?: number;
    avoidUnhealthyNodes?: boolean;
    maxCpuLoad?: number;
    maxMemoryUsage?: number;
    autoMovePlayers?: boolean;
    autoRebalance?: boolean;
}

export interface ISearchOptions {
    defaultPlatform?: "youtube" | "youtubemusic" | "soundcloud" | "local";
    resultLimit?: number;
    playlistLoadLimit?: number;
}

export interface IQueueOptions {
    maxSize?: number | "unlimited";
    allowDuplicates?: boolean;
    historyLimit?: number;
}

export interface ISourceOptions {
    disabledSources?: string[];
}

export interface IPlayerDestructionOptions {
    autoDestroyOnIdle?: boolean;
    idleTimeout?: number;
}

export interface ITrackHandlingOptions {
    autoSkipOnError?: boolean;
    skipStuckTracks?: boolean;
    trackStuckThreshold?: number;
    retryFailedTracks?: boolean;
    maxRetryAttempts?: number;
}

export interface IManagerConfig {
    nodes: IManagerNodeConfig[];
    options?: IManagerOptionsConfig;
    send?: (guildId: string, payload: any) => void;
}

export interface ISearchQuery {
    query: string;
    source?: string;
    requester?: any;
    node?: string;
}

export interface INodeStats {
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
}

export interface INode {
  host: string;
  port: number;
  identifier: string;
  password?: string;
  pathVersion?: string;
  retryDelay?: number;
  retryAmount?: number;
  regions?: string[];
  secure?: boolean;
  priority?: number;
}

export interface ITrackInfo {
    title: string;
    author: string;
    length: number;
    identifier: string;
    isSeekable: boolean;
    isStream: boolean;
    uri: string | null;
    artworkUrl?: string | null;
    isrc?: string | null;
    sourceName: string;
    position: number;
}

export interface ITrack {
    encoded: string;
    info: ITrackInfo;
    pluginInfo: Record<string, any>;
    userData: Record<string, any>;
}

export interface IPlayerState {
    time: number;
    position: number;
    connected: boolean;
    ping: number;
}

export interface IPlayerConfig {
    guildId: string;
    voiceChannelId: string;
    textChannelId?: string;
    node?: string;
    volume?: number;
    selfDeaf?: boolean;
    selfMute?: boolean;
    autoPlay?: boolean;
    autoLeave?: boolean;
    loop?: "off" | "track" | "queue";
    loopCount?: number;
}

export interface IRESTOptions {
    guildId: string;
    data: any;
}

export interface IRESTLoadTracks {
    loadType: string;
    data: any;
}

export interface IRESTGetLyrics {
    text?: string;
    lines?: Array<{ timestamp: number; text: string }>;
}

export interface IRESTGetPlayers {
    guildId: string;
    track?: ITrack;
    volume: number;
    paused: boolean;
    state: {
        time: number;
        position: number;
        connected: boolean;
        ping: number;
    };
    filters: any;
    voice: {
        token: string;
        endpoint: string;
        sessionId: string;
        connected?: boolean;
        ping?: number;
    };
}

export interface IEqualizerBand {
    band: number;
    gain: number;
}

export interface IKaraoke {
    level?: number;
    monoLevel?: number;
    filterBand?: number;
    filterWidth?: number;
}

export interface ITimescale {
    speed?: number;
    pitch?: number;
    rate?: number;
}

export interface ITremolo {
    frequency?: number;
    depth?: number;
}

export interface IVibrato {
    frequency?: number;
    depth?: number;
}

export interface IRotation {
    rotationHz?: number;
}

export interface IDistortion {
    sinOffset?: number;
    sinScale?: number;
    cosOffset?: number;
    cosScale?: number;
    tanOffset?: number;
    tanScale?: number;
    offset?: number;
    scale?: number;
}

export interface IChannelMix {
    leftToLeft?: number;
    leftToRight?: number;
    rightToLeft?: number;
    rightToRight?: number;
}

export interface ILowPass {
    smoothing?: number;
}

export interface IFilters {
    volume?: number;
    equalizer?: IEqualizerBand[];
    karaoke?: IKaraoke;
    timescale?: ITimescale;
    tremolo?: ITremolo;
    vibrato?: IVibrato;
    rotation?: IRotation;
    distortion?: IDistortion;
    channelMix?: IChannelMix;
    lowPass?: ILowPass;
    pluginFilters?: Record<string, any>;
}

export type RoutePlannerType = "RotatingIpRoutePlanner" | "NanoIpRoutePlanner" | "RotatingNanoIpRoutePlanner" | "BalancingIpRoutePlanner";
export type IpBlockType = "Inet4Address" | "Inet6Address";

export interface IFailingAddress {
    failingAddress: string;
    failingTimestamp: number;
    failingTime: string;
}

export interface IIpBlock {
    type: IpBlockType;
    size: string;
}

export interface IRoutePlannerDetails {
    ipBlock: IIpBlock;
    failingAddresses: IFailingAddress[];
    rotateIndex?: string;
    ipIndex?: string;
    currentAddress?: string;
    currentAddressIndex?: string;
    blockIndex?: string;
}

export interface IRoutePlannerStatus {
    class?: RoutePlannerType;
    details?: IRoutePlannerDetails;
}