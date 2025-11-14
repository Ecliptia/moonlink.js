export type NodeSortStrategy = "players" | "playingPlayers" | "memory" | "cpuLavalink" | "cpuSystem" | "uptime" | "penalty" | "random";
export declare enum NodeState {
    CONNECTING = 0,
    CONNECTED = 1,
    DISCONNECTED = 2,
    DESTROYED = 3,
    READY = 4,
    RESUMING = 5
}
export declare enum LoadType {
    TRACK = "track",
    PLAYLIST = "playlist",
    SEARCH = "search",
    EMPTY = "empty",
    ERROR = "error"
}
export type PlayerOptions = {
    guildId: string;
    voiceChannelId: string;
    textChannelId?: string;
    selfDeaf?: boolean;
    selfMute?: boolean;
};
export type VoiceState = {
    sessionId: string;
    token: string;
    endpoint: string;
    event?: any;
};
export type PlayerLoop = "off" | "track" | "queue";
export type TrackEndReason = "finished" | "loadFailed" | "stopped" | "replaced" | "cleanup";
