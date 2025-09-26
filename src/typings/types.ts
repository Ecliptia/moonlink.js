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

export type TNativeSearchSources = "youtube" | "youtubemusic" | "soundcloud" | "local";

export type TLavaSrcSearchSources =
  | "spsearch"
  | "sprec"
  | "amsearch"
  | "dzsearch"
  | "dzisrc"
  | "dzrec"
  | "ymsearch"
  | "ymrec"
  | "ftts"
  | "vksearch"
  | "vkrec"
  | "tdsearch"
  | "tdrec"
  | "qbsearch"
  | "qbisrc"
  | "qbrec"
  | "phsearch"
  | "speak"
  | "mixcloud"
  | "ocremix"
  | "clypit"
  | "reddit"
  | "getyarn"
  | "tiktok"
  | "soundgasm"
  | "pixeldrain"
  | "streamdeck";

export type TDirectSources =
  | "mixcloud"
  | "ocremix"
  | "clypit"
  | "reddit"
  | "getyarn"
  | "tiktok"
  | "soundgasm"
  | "pixeldrain"
  | "streamdeck";

export type TSearchSources = TNativeSearchSources | TLavaSrcSearchSources | TDirectSources | string;

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
  | "finished"
  | "stale";

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