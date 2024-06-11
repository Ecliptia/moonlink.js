import {
  Plugin,
  Node,
  Rest,
  Player,
  Queue,
  Track,
  PlayerManager,
  NodeManager,
} from "../../index";
import {
  TLoadResultType,
  TPlayerLoop,
  TSortTypeNode,
  TTrackEndType,
} from "./types";
export interface IEvents {
  debug: (...args: string[]) => void;
  nodeCreate: (node: INode) => void;
  nodeConnected: (node: INode) => void;
  nodeError: (node: INode, error: Error) => void;
  nodeReconnect: (node: INode) => void;
  nodeDisconnect: (node: INode, error: Error) => void;
  nodeDestroy: (node: INode) => void;
  playerCreate: (player: Player) => void;
  playerDestroy: (player: Player) => void;
  trackStart: (player: Player, track: Track) => void;
  trackEnd: (
    player: Player,
    track: Track,
    type: TTrackEndType,
    payload?: any,
  ) => void;
  trackStuck: (player: Player, track: Track, threshold: number) => void;
  trackException: (player: Player, track: Track, exception: any) => void;
  socketClosed: (
    player: Player,
    code: number,
    reason: string,
    byRemote: boolean,
  ) => void;
}
export interface INode {
  host: string;
  id?: number;
  identifier?: string;
  port: number;
  password?: string;
  retryDelay?: number;
  retryAmount?: number;
  regions?: String[];
  secure?: boolean;
  sessionId?: string;
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
}
export interface IPlayerConfig {
  guildId: string;
  voiceChannelId: string;
  textChannelId: string;
  volume?: number;
  loop?: TPlayerLoop;
  autoPlay?: boolean;
  autoLeave?: boolean;
  node?: string;
}
export interface IVoiceState {
  token?: string;
  sessionId?: string;
  endpoint?: string;
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
export interface ILoadResultData {
  info: IPlaylistInfo;
  tracks?: ITrack[];
  pluginInfo: Object;
}
export interface ITrack {
  encoded: string;
  info: ITrackInfo;
  pluginInfo: Object;
  userData: Object;
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
export interface IPlaylistInfo {
  name: string;
  selectedTrack?: number;
}
export interface IObjectTrack {
  encoded?: string;
  identifier?: string;
  userData?: unknown;
}
export interface ISearchResult {
  loadType: TLoadResultType;
  tracks: Track[];
  playlistInfo: IPlaylistInfo;
}
export interface IExtendable {
  Node: typeof Node;
  Rest: typeof Rest;
  Player: typeof Player;
  Track: typeof Track;
  Queue: typeof Queue;
  PlayerManager: typeof PlayerManager;
  NodeManager: typeof NodeManager;
}
