export enum SearchSources {
  YouTube = "ytsearch",
  YouTubeMusic = "ytmsearch",
  SoundCloud = "scsearch",
  Local = "local",
}

export enum NodeState {
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  READY = "READY",
  RESUMING = "RESUMING",
  RESUMED = "RESUMED",
  DISCONNECTED = "DISCONNECTED",
  DESTROYED = "DESTROYED",
}

export type TSearchSources = "youtube" | "youtubemusic" | "soundcloud" | string;
export type TLoadResultType =
  | "track"
  | "playlist"
  | "search"
  | "empty"
  | "error"
  | TLoadResultNodeLinkType
export type TLoadResultNodeLinkType = 
  | "short"
  | "album"
  | "artist"
  | "playlist"
  | "station"
  | "podcast"
  | "podcast";
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
  | "finished";

export type TPartialTrackProperties = 
  | "url"
  | "duration"
  | "position"
  | "identifier"
  | "isSeekable"
  | "isStream"
  | "artworkUrl"
  | "isrc"
  | "sourceName";

export type YoutubeThumbnailQuality = "default" | "hqdefault" | "mqdefault" | "sddefault" | "maxresdefault";
