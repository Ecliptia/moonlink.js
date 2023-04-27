import { EventEmitter } from "node:events";
import { MoonlinkNode } from "./MoonlinkNodes";
import { MoonlinkPlayer } from "./MoonlinkPlayers";
import { MoonlinkTrack } from "../@Rest/MoonlinkTrack";
import { Spotify } from "../@Sources/Spotify";
import { Deezer } from "../@Sources/Deezer";

export type Constructor<T> = new (...args: any[]) => T;

export interface Nodes {
 host: string;
 port?: number;
 identifier?: string;
 secure?: boolean;
 password?: string | null;
}
export interface spotifyOptions {
 clientId?: string;
 clientSecret?: string;
}
export interface Options {
 clientName?: string;
 spotify: spotifyOptions;
}

export interface createOptions {
 guildId: string;
 textChannel: string;
 voiceChannel: string;
 autoPlay?: boolean | null;
}

export interface VoiceState {
 op: "voiceUpdate";
 guildId: string;
 event: VoiceServer;
 sessionId?: string;
}

export interface VoiceServer {
 token: string;
 guild_id: string;
 endpoint: string;
}

export interface VoiceState {
 guild_id: string;
 user_id: string;
 session_id: string;
 channel_id: string;
}

export interface VoicePacket {
 t?: "VOICE_SERVER_UPDATE" | "VOICE_STATE_UPDATE";
 d: VoiceState | VoiceServer;
}

export type LoadType =
 | "TRACK_LOADED"
 | "PLAYLIST_LOADED"
 | "SEARCH_RESULT"
 | "LOAD_FAILED"
 | "NO_MATCHES";

export interface TrackData {
 track?: string;
 trackEncoded?: string;
 encoded?: string;
 info: TrackDataInfo;
}

export interface TrackDataInfo {
 title: string;
 identifier: string;
 author: string;
 length: number;
 position: number;
 isSeekable: boolean;
 isStream: boolean;
 uri: string;
}

export type SearchPlatform =
 | "youtube"
 | "youtubemusic"
 | "soundcloud"
 | "spotify"
 | "deezer";

export interface SearchQuery {
 source?: SearchPlatform | string | undefined | null;
 query: string;
}

export interface SearchResult {
 loadType: LoadType;
 tracks: MoonlinkTrack[];
 playlistInfo?: PlaylistInfo;
 exception?: {
  message: string;
  severity: string;
 };
}

export interface playersOptions {
  create: (data: createOptions) => MoonlinkPlayer;
  get: (guildId: string) => MoonlinkPlayer | null;
  has: (guildId: string) => boolean;
}

export interface PlaylistInfo {
 name: string;
 selectedTrack?: MoonlinkTrack;
 duration: number;
}

export interface LavalinkResult {
 tracks: TrackData[];
 loadType: LoadType;
 exception?: {
  message: string;
  severity: string;
 };
 playlistInfo: {
  name: string;
  selectedTrack?: number;
 };
}

export interface MoonlinkEvents {
 debug: (...args: any) => void;
 nodeCreate: (node: MoonlinkNode) => void;
 nodeDestroy: (node: MoonlinkNode) => void;
 nodeReconnect: (node: MoonlinkNode) => void;
 nodeClose: (node: MoonlinkNode, code: number, reason: any) => void;
 nodeRaw: (node: MoonlinkNode, payload: object) => void;
 nodeError: (node: MoonlinkNode, error: Error) => void;
 trackStart: (player: MoonlinkPlayer, current: any) => void;
 trackEnd: (player: MoonlinkPlayer, track: any, payload?: any) => void;
 trackStuck: (player: MoonlinkPlayer, track: any) => void;
 trackError: (player: MoonlinkPlayer, track: any) => void;
 queueEnd: (player: MoonlinkPlayer, track?: any) => void;
 playerDisconnect: (player: MoonlinkPlayer) => void;
 playerMove: (player: MoonlinkPlayer, newVoiceChannel: string, oldVoiceChannel: string) => void;
 socketClosed: (player: MoonlinkPlayer, track: any) => void;
}

export declare interface MoonlinkManager {
 on<K extends keyof MoonlinkEvents>(
  event: K,
  listener: MoonlinkEvents[K]
 ): this;
 once<K extends keyof MoonlinkEvents>(
  event: K,
  listener: MoonlinkEvents[K]
 ): this;
 emit<K extends keyof MoonlinkEvents>(
  event: K,
  ...args: Parameters<MoonlinkEvents[K]>
 ): boolean;
 off<K extends keyof MoonlinkEvents>(
  event: K,
  listener: MoonlinkEvents[K]
 ): this;
}
export class MoonlinkManager extends EventEmitter {
 public readonly _nodes: Nodes[];
 public readonly _sPayload: Function;
 public initiated: boolean;
 public options: Options;
 public nodes: Map<string, Nodes>;
 public spotify: Spotify;
 public deezer: Deezer;
 public sendWs: any;
 public clientId: string;
 public version: string;
 public map: Map<string, any> = new Map();
 constructor(nodes: Nodes[], options: Options, sPayload: Function) {
  super();
  if (!nodes) throw new Error('[ @Moonlink/Manager ]: "nodes" option is empty');
  if (nodes && !Array.isArray(nodes))
   throw new Error(
    '[ @Moonlink/Manager ]: the "nodes" option has to be in an array'
   );
  if (nodes && nodes.length == 0)
   throw new Error(
    '[ @Moonlink/Manager ]: there are no parameters with "node(s)" information in the object'
   );
  if (
   options &&
   typeof options.clientName !== "string" &&
   typeof options.clientName !== "undefined"
  )
   throw new Error(
    '[ @Moonlink/Manager ]: clientName option of the "options" parameter must be in string format'
   );
  this._nodes = nodes;
  this._sPayload = sPayload;
  this.options = options;
  this.nodes = new Map();
  this.spotify = new Spotify(this, options);
  this.deezer = new Deezer(this, options);
  this.sendWs;
  this.version = require("../../index").version;
 }
 public init(clientId: string): this {
  if (this.initiated) return this;
  if (!clientId)
   throw new TypeError('[ @Moonlink/Manager ]: "clientId" option is required.');
  this.clientId = clientId;
  this._nodes.forEach((node) => this.addNode(node));
  this.initiated = true;
  return this;
 }
 public addNode(node: Nodes): Nodes {
  const new_node: MoonlinkNode = new MoonlinkNode(this, node, this.map);
  if (node.identifier) this.nodes.set(node.identifier, new_node);
  else this.nodes.set(node.host, new_node);
  new_node.init();
  return new_node;
 }
 public removeNode(name: string): boolean {
if(!name) throw new Error('[ @Moonlink/Manager ]: option "name" is empty')
	 let node = this.nodes.get(name);
   if(!node) return false;
	 this.nodes.delete(name);
	 return true;
} 
 public get leastUsedNodes(): any {
  return [...this.nodes.values()]
   .filter((node: any) => node.isConnected)
   .sort((a: any, b: any) => b.calls - a.calls)[0];
 }
 packetUpdate(packet: VoicePacket) {
  if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t)) return;
  const update: any = packet.d;
	let player: any = this.players.get(update.guild_id);
  if (!update || (!("token" in update) && !("session_id" in update))) return;
	 if ("t" in packet && "VOICE_SERVER_UPDATE".includes(packet.t)) {
	let voiceServer: object = {};
   voiceServer[update.guild_id] = {
    event: update,
   };
   this.map.set("voiceServer", voiceServer);
   return this.attemptConnection(update.guild_id);
  }
  if ("t" in packet && "VOICE_STATE_UPDATE".includes(packet.t)) {
   if (update.user_id !== this.clientId) return;
		if(!player) return;
if(!update.channel_id) {
	this.emit('playerDisconnect', player)
    let players = this.map.get('players') || {};
    players[update.guild_id] = {
			...players[update.guild_id],
			connected: false,
			voiceChannel: null,
			playing: false
		}
		player.connected = false;
		player.voiceChannel = null;
	  player.playing = false;
    player.stop();
 }
if(update.channel_id !== player.voiceChannel) {
this.emit('playerMove', player, update.channel_id, player.voiceChannel)
    let players: any = this.map.get('players') || {};
    players[update.guild_id] = {
			...players[update.guild_id],
			voiceChannel: update.channel_id
		}
			this.map.set('players', players)
      player.voiceChannel = update.channel_id;
		}
    let voiceStates: object = {};
    voiceStates[update.guild_id] = update;
    this.map.set("voiceStates", voiceStates);
    return this.attemptConnection(update.guild_id);
	}
}
 public async search(options: string | SearchQuery): Promise<SearchResult> {
  return new Promise(async (resolve) => {
   if (!options)
    throw new Error(
     "[ @Moonlink/Manager ]: the search option has to be in string format or in an array"
    );
   let query: string | undefined;
   let source: string | undefined;
   if (typeof options == "object") {
    query = options.query ? options.query : undefined;
    source = options.source ? options.source : undefined;
   } else {
    query = options;
   }

   if (source && typeof source !== "string")
    throw new Error(
     "[ @Moonlink/Manager ]: the source option has to be in string format"
    );
   if (typeof query !== "string" && typeof query !== "object")
    throw new Error(
     "[ @Moonlink/Manager ]: (search) the search option has to be in string or array format"
    );
   let sources = {
    youtube: "ytsearch",
    youtubemusic: "ytmsearch",
    soundcloud: "scsearch",
    spotify: "spotify",
    deezer: "deezer",
   };
   if (this.spotify.check(query)) {
    return resolve(await this.spotify.resolve(query));
   }
   if (this.deezer.check(query)) {
    return resolve(await this.deezer.resolve(query));
   }
   let opts: string | null;
   if (
    query &&
    !(query as string).startsWith("http://") &&
    !(query as string).startsWith("https://")
   ) {
    if (source && !sources[source]) {
     this.emit(
      "debug",
      "[ Moonlink/Manager]: no default found, changing to custom source"
     );
     opts = `${source}:${query}`;
    } else {
     opts = sources[source] || `ytsearch:${query}`;
    }
   }
   if (source == "spotify") {
    return resolve(this.spotify.fetch(query));
   }
   if (source == "deezer") {
    return resolve(this.deezer.fetch(query));
   }
   let params = new URLSearchParams({ identifier: opts });
   let res = await this.leastUsedNodes.request("loadtracks", params);
   if (res.loadType === "LOAD_FAILED" || res.loadType === "NO_MATCHES") {
    this.emit(
     "debug",
     "[ @Moonlink/Manager ]: not found or there was an error loading the track"
    );
    return resolve(res);
   } else {
    const tracks = res.tracks.map((x) => new MoonlinkTrack(x));
    if (res.loadType === "PLAYLIST_LOADED") {
     res.playlistInfo.duration = tracks.reduce(
      (acc, cur) => acc + cur.duration,
      0
     );
    }
    return resolve({
     ...res,
     tracks,
    });
   }
  });
 }
 public async attemptConnection(guildId: string): Promise<boolean> {
  let voiceServer = this.map.get("voiceServer") || {};
  let voiceStates = this.map.get("voiceStates") || {};
  let players = this.map.get("players") || {};
  if (!players[guildId]) return false;
  if (!voiceServer[guildId]) return false;
  this.emit(
   "debug",
   `[ @Moonlink/Manager ]: sending to lavalink, player data from server (${guildId})`
  );
  if ((this.leastUsedNodes.version as string).replace(/\./g, "") <= "370")
   this.leastUsedNodes.sendWs({
    op: "voiceUpdate",
    sessionId: voiceStates[guildId].session_id,
    guildId: voiceServer[guildId].event.guild_id,
    event: voiceServer[guildId].event,
   });
   else await this.leastUsedNodes.rest.update({
    guildId,
    data: {
     voice: {
      sessionId: voiceStates[guildId].session_id,
      endpoint: voiceServer[guildId].event.endpoint,
      token: voiceServer[guildId].event.token,
     },
    },
   });
  return true;
 }
 public get players(): playersOptions {
  let has: Function = (guildId: string): boolean => {
   let players = this.map.get("players") || {};
   if (players[guildId]) players = true;
   else players = false;
   return players;
  };
  let get: Function = (guildId: string): MoonlinkPlayer | null => {
   if (!guildId && typeof guildId !== "string")
    throw new Error(
     '[ @Moonlink/Manager ]: "guildId" option in parameter to get player is empty or type is different from string'
    );
   if (!has(guildId)) return null;
   return new MoonlinkPlayer(
    this.map.get("players")[guildId],
    this,
    this.map,
    this.leastUsedNodes.rest
   );
  };
  let create: Function = (data: createOptions): MoonlinkPlayer => {
   if (typeof data !== "object")
    throw new Error('[ @Moonlink/Manager ]: parameter "data" is not an object');
   if (!data.guildId && typeof data.guildId !== "string")
    throw new Error(
     '[ @Moonlink/Manager ]: "guildId" parameter in player creation is empty or not string type'
    );
   if (!data.textChannel && typeof data.textChannel !== "string")
    throw new Error(
     '[ @Moonlink/Manager ]: "textChannel" parameter in player creation is empty or not string type'
    );
   if (!data.voiceChannel && typeof data.voiceChannel !== "string")
    throw new Error(
     '[ @Moonlink/Manager ]: "voiceChannel" parameter in player creation is empty or not string type'
    );
   if ("autoPlay" in data && typeof data.autoPlay !== "boolean")
    throw new Error(
     "[ @Moonlink/Manager ]: autoPlay parameter of player creation has to be boolean type"
    );
   if (has(data.guildId)) return get(data.guildId);
   let players_map: Map<string, object> | object =
    this.map.get("players") || {};
   players_map[data.guildId] = {
    guildId: data.guildId,
    textChannel: data.textChannel,
    voiceChannel: data.voiceChannel,
    playing: false,
    connected: false,
    paused: false,
    loop: null,
    autoPlay: false,
   };
   this.map.set("players", players_map);
   return new MoonlinkPlayer(
    players_map[data.guildId],
    this,
    this.map,
    this.leastUsedNodes.rest
   );
  };

  return {
   create: create.bind(this),
   get: get.bind(this),
   has: has.bind(this),
  };
 }
}