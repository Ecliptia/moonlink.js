export type TSearchSources = "youtube" | "youtubemusic" | "soundcloud";
export type TLoadResultType =
  | "track"
  | "playlist"
  | "search"
  | "empty"
  | "error";
export type TSortTypeNode =
  | "players"
  | "playingPlayers"
  | "memory"
  | "cpuLavalink"
  | "cpuSystem"
  | "uptime"
  | "random";
export type TPlayerLoop = "off" | "track" | "queue";
export type TTrackEndType =
  | "queueEnd"
  | "loadFailed"
  | "stopped"
  | "replaced"
  | "cleanup"
  | "finish";
