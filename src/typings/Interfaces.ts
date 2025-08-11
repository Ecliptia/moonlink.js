import { AbstractDatabase } from "../database/AbstractDatabase";
import {
  Plugin,
  Node,
  Rest,
  Player,
  Queue,
  Track,
  Filters,
  Lyrics,
  Listen,
  PlayerManager,
  NodeManager,
  SearchResult,
  DatabaseManager,
} from "../../index";
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
  playerTriggeredSkip: (
    player: Player,
    oldTrack: Record<string, any>,
    currentTrack: Track,
    postion: number
  ) => void;
  playerTriggeredSeek: (player: Player, position: number) => void;
  playerTriggeredShuffle: (
    player: Player,
    oldQueue: Record<string, any>,
    currentQueue: Track[]
  ) => void;
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
  playerChapterSkipped: (player: Player, chapter: IChapter) => void;
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
  playerSpeak: (player: Player, text: string, options?: ISpeakOptions) => void;
  trackBlacklisted: (player: Player, track: Track) => void;
  segmentsLoaded: (player: Player, segments: ISegment[]) => void;
  segmentSkipped: (player: Player, segment: ISegment) => void;
  chaptersLoaded: (player: Player, chapters: IChapter[]) => void;
  chapterStarted: (player: Player, chapter: IChapter) => void;
  playerStale: (player: Player) => void;
  trackStale: (player: Player, track: Track) => void;
  playerStateSync: (player: Player, serverState: IRESTGetPlayers) => void;
  playerMuteChange: (player: Player, selfMute: boolean, serverMute: boolean) => void;
  playerDeafChange: (player: Player, selfDeaf: boolean, serverDeaf: boolean) => void;
  playerSuppressChange: (player: Player, suppress: boolean) => void;
  playerVoiceJoin: (player: Player, userId: string) => void;
  playerVoiceLeave: (player: Player, userId: string) => void;
  voiceSessionChanged: (player: Player, oldSessionId: string | boolean, sessionId: string) => void;
}

export interface IChapter {
  name: string;
  start: number;
  end: number;
  duration: string;
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
  logFile?: { path: string; log: boolean };
  movePlayersOnReconnect?: boolean;
  sortPlayersByRegion?: boolean;
  autoResume?: boolean;
  resume?: boolean;
  partialTrack?: TPartialTrackProperties[];
  disableNativeSources?: boolean;
  blacklisteSources?: string[];
  enabledSources?: string[];
  playlistLoadLimit?: number;
  spotify?: {
    clientId?: string;
    clientSecret?: string;
    limitLoadPlaylist?: number;
    limitLoadAlbum?: number;
    limitLoadArtist?: number;
    limitLoadSearch?: number;
    limitLoadRecommendations?: number;
    limitLoadPlaylistPage?: number;
    limitLoadAlbumPage?: number;
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
  blacklistedSources?: string[];
  defaultSponsorBlockCategories?: string[];
  database?: {
    provider?: 'local' | 'memory' | 'mongoose' | (new () => AbstractDatabase);
    options?: {
      path?: string;
      mongoose?: {
        connectionString: string;
      };
    };
  };
  playerHealthCheck?: {
    stalePlayerTimeout?: number;
  }
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
  self_mute?: boolean;
  self_deaf?: boolean;
  mute?: boolean;
  deaf?: boolean;
  suppress?: boolean;
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
}

export interface ITrack {
  encoded: string;
  info: ITrackInfo;
  pluginInfo: Object;
  userData: Object;
  origin?: string;
  chapters?: IChapter[];
  currentChapterIndex?: number;
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

export interface ILavaSearchAlbum extends ILoadResultData {
  tracks: [];
}

export interface ILavaSearchArtist extends ILoadResultData {
  tracks: [];
}

export interface ILavaSearchPlaylist extends ILoadResultData {
  tracks: []
}

export interface ILavaSearchText {
  text: string;
  plugin: Object;
}

export interface ILavaSearchResultData {
  tracks?: ITrack[];
  albums?: ILavaSearchAlbum[];
  artists?: ILavaSearchArtist[];
  playlists?: ILavaSearchPlaylist[];
  texts?: ILavaSearchText[];
  plugin?: Object;
}

export interface ISearchResult {
  loadType: TLoadResultType;
  tracks: Track[];
  playlistInfo: IPlaylistInfo;
  data: ILoadResultData | ILavaSearchResultData; 
  exception?: {
    message: string;
    severity: string;
  };
  albums?: ILavaSearchAlbum[];
  artists?: ILavaSearchArtist[];
  playlists?: ILavaSearchPlaylist[];
  texts?: ILavaSearchText[];
  lavasearchPluginInfo?: Object;
  isLavaSearchResult?: boolean;
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
  DatabaseManager: typeof DatabaseManager;
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

export interface IPlayerState {
  time: number;
  position: number;
  connected: boolean;
  ping: number;
}

export interface IRESTGetPlayers {
  guildId: string;
  track: ITrack;
  volume: number;
  paused: boolean;
  state: IPlayerState;
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

export interface ISegment {
  category: string;
  start: number;
  end: number;
}

export interface ISpeakOptions {
  text: string;
  provider?: 'flowery' | 'google' | 'skybot';
  options?: IFloweryTTSOptions | { language?: string };
  addToQueue?: boolean;
}

export interface ILavaLyricsLine {
  timestamp: number;
  duration?: number;
  line: string;
  plugin: Object;
}

export interface ILavaLyricsObject {
  type: "timed" | "text";
  track?: {
    title: string;
    author: string;
    album?: string;
    albumArt?: {
      url: string;
      height: number;
      width: number;
    }[];
  };
  source?: string;
  text?: string;
  lines: ILavaLyricsLine[];
  plugin: Object;
}

export interface IRESTGetLyricsLavaLyrics extends ILavaLyricsObject {}

export interface HighPass {
  cutoffFrequency: number;
  boostFactor?: number;
}

export interface LowPass {
  cutoffFrequency: number;
  boostFactor?: number;
}

export interface Normalization {
  maxAmplitude?: number;
  adaptive?: boolean;
}

export interface Echo {
  echoLength?: number;
  decay?: number;
}