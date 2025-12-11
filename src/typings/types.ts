export type NodeSortStrategy =
    | "players"
    | "leastPlayers"
    | "playingPlayers"
    | "memory"
    | "cpuLavalink"
    | "cpuSystem"
    | "uptime"
    | "penalty"
    | "random"
    | "leastLoad"
    | "priority";

export enum NodeState {
    CONNECTING,
    CONNECTED,
    DISCONNECTED,
    DESTROYED,
    READY,
    RESUMING
}

export enum LoadType {
    TRACK = "track",
    PLAYLIST = "playlist",
    SEARCH = "search",
    EMPTY = "empty",
    ERROR = "error",
}

export enum VoiceConnectionState {
    CONNECTING,
    CONNECTED,
    DISCONNECTED,
    DESTROYED,
}

export type PlayerOptions = {
    guildId: string;
    voiceChannelId: string;
    textChannelId?: string;
    selfDeaf?: boolean;
    selfMute?: boolean;
}

export type VoiceState = {
    sessionId: string;
    token: string;
    endpoint: string;
    event?: any;
}

export type PlayerLoop = "off" | "track" | "queue";

export type TrackEndReason = "finished" | "loadFailed" | "stopped" | "replaced" | "cleanup";

export type TPartialTrackProperties = "title" | "author" | "duration" | "identifier" | "isSeekable" | "isStream" | "uri" | "artworkUrl" | "isrc" | "sourceName" | "position" | "requester" | "origin" | "pluginInfo" | "userData" | "retries" | "time";
