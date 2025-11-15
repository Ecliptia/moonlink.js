import { NodeSortStrategy } from "./types";
export interface IManagerEvents {
    debug: (message: string) => void;
    nodeStateChange: (node: any, oldState: any, newState: any) => void;
    nodeConnected: (node: any) => void;
    nodeDisconnect: (node: any, code: number, reason: string) => void;
    nodeReady: (node: any, payload: any) => void;
    nodeError: (node: any, error: Error) => void;

    playerCreate: (player: any) => void;
    playerDestroy: (player: any) => void;
    playerSwitchedNode: (player: any, oldNode: any, newNode: any) => void;
    playerVoiceChannelSet: (player: any, oldChannel: string, newChannel: string) => void;
    playerTextChannelSet: (player: any, oldChannel: string, newChannel: string) => void;
    playerTriggeredBack: (player: any, track: any) => void;
    trackStart: (player: any, track: any) => void;
    trackEnd: (player: any, track: any, reason: string, payload: any) => void;
    trackStuck: (player: any, track: any, threshold: number, payload: any) => void;
    trackException: (player: any, track: any, exception: any, payload: any) => void;
    socketClosed: (player: any, code: number, reason: string, byRemote: boolean, payload: any) => void;
    queueEnd: (player: any, lastTrack: any) => void;
    autoPlayed: (player: any, track: any, previousTrack: any) => void;
    autoLeaved: (player: any, lastTrack: any) => void;
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
    sessionId?: string;
}

export interface IManagerOptionsConfig {
    database?: IDatabaseOptions;
    clientName?: string;
    resume?: boolean;
    resumeTimeout?: number;
    autoResume?: boolean;
    playerAutoFailover?: boolean;
    movePlayersOnNodeDisconnect?: boolean;
    noReplace?: boolean;
    customFilters?: Record<string, string | IFilters>;
    defaultPlayer?: IDefaultPlayerOptions;
    voiceConnection?: IVoiceConnectionOptions;
    node?: INodeOptions;
    search?: ISearchOptions;
    queue?: IQueueOptions;
    sources?: ISourceOptions;
    playerDestruction?: IPlayerDestructionOptions;
    trackHandling?: ITrackHandlingOptions;
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
  sessionId?: string;
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
    playerState: any;
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

export interface IDatabaseOptions {
    provider?: "memory" | "lmdb";
    path?: string;
    maxDbs?: number;
    compression?: boolean;
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