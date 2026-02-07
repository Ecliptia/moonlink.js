export type NodeSortStrategy = "players" | "leastPlayers" | "playingPlayers" | "memory" | "cpuLavalink" | "cpuSystem" | "uptime" | "penalty" | "random" | "leastLoad" | "priority";
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
export declare enum VoiceConnectionState {
    CONNECTING = 0,
    CONNECTED = 1,
    DISCONNECTED = 2,
    DESTROYED = 3
}
export type VoiceStateUpdate = {
    guild_id: string;
    channel_id: string | null;
    session_id?: string;
    user_id?: string;
    self_mute?: boolean;
    self_deaf?: boolean;
    mute?: boolean;
    deaf?: boolean;
    suppress?: boolean;
};
export type VoiceServerUpdate = {
    guild_id: string;
    token: string;
    endpoint: string | null;
};
export type DiscordGatewayPacket = {
    t?: string;
    d?: any;
};
export type DiscordVoicePacket = {
    t: "VOICE_STATE_UPDATE";
    d: VoiceStateUpdate;
} | {
    t: "VOICE_SERVER_UPDATE";
    d: VoiceServerUpdate;
};
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
export type TrackEndReason = "finished" | "loadFailed" | "stopped" | "replaced" | "cleanup" | "gapless";
export type TPartialTrackProperties = "title" | "author" | "duration" | "identifier" | "isSeekable" | "isStream" | "uri" | "artworkUrl" | "isrc" | "sourceName" | "position" | "requester" | "origin" | "pluginInfo" | "userData" | "retries" | "time";
