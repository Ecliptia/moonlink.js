export type TSearchSources = "youtube" | "youtubemusic" | "soundcloud";
export type TLoadResultType = "track" | "playlist" | "search" | "empty" | "error" | TLoadResultNodeLinkType;
export type TLoadResultNodeLinkType = "short" | "album" | "artist" | "playlist" | "station" | "podcast" | "show";
export type TSortTypeNode = "players" | "playingPlayers" | "memory" | "cpuLavalink" | "cpuSystem" | "uptime" | "random";
export type TPlayerLoop = "off" | "track" | "queue";
export type TTrackEndType = "queueEnd" | "loadFailed" | "stopped" | "replaced" | "cleanup" | "finished";
