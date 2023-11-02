import { EventEmitter } from "node:events";
import {
  MoonlinkNode,
  MoonlinkPlayer,
  MoonlinkTrack,
  MoonlinkQueue,
  Spotify,
  Plugin,
} from "../../index";

export type Constructor<T> = new (...args: any[]) => T;

export interface Nodes {
  host: string;
  port?: number;
  identifier?: string;
  secure?: boolean;
  password?: string | null;
  pathVersion?: string | null;
}

export interface spotifyOptions {
  clientId?: string;
  clientSecret?: string;
}

export interface customOptions {
  player?: Constructor<MoonlinkPlayer>;
  queue?: Constructor<MoonlinkQueue>;
}

export interface Options {
  clientName?: string;
  reconnectAtattemps?: number;
  retryTime?: number;
  retryAmount?: number;
  resume?: boolean;
  resumeStatus?: boolean;
  resumeTimeout?: number;
  autoResume?: boolean;
  plugins?: Plugin[];
  spotify?: spotifyOptions;
  custom?: customOptions;
  sortNode?: SortType;
}

export interface createOptions {
  guildId: string;
  textChannel: string;
  voiceChannel: string;
  autoPlay?: boolean | null;
  volume?: number;
  node?: string;
}

export type SortType =
  | "memory"
  | "cpuLavalink"
  | "cpuSystem"
  | "calls"
  | "playingPlayers"
  | "players";

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

export type LoadType = "track" | "playlist" | "search" | "empty" | "error";

export interface TrackData {
  encoded?: string;
  info: TrackDataInfo;
  pluginInfo: object;
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
  | "spotify";

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
  all: any;
}

export interface PlaylistInfo {
  name: string;
  selectedTrack?: MoonlinkTrack;
  duration: number;
}

export interface LavalinkResult {
  data: TrackData[];
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
  /* Logic created by PiscesXD */
  autoLeaved: (player: MoonlinkPlayer, track?: any) => void;
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
  playerCreated: (guildId: string) => void;
  playerDisconnect: (player: MoonlinkPlayer) => void;
  playerResume: (player: MoonlinkPlayer) => void;
  playerMove: (
    player: MoonlinkPlayer,
    newVoiceChannel: string,
    oldVoiceChannel: string,
  ) => void;
  socketClosed: (player: MoonlinkPlayer, track: any) => void;
}

export declare interface MoonlinkManager {
  on<K extends keyof MoonlinkEvents>(
    event: K,
    listener: MoonlinkEvents[K],
  ): this;
  once<K extends keyof MoonlinkEvents>(
    event: K,
    listener: MoonlinkEvents[K],
  ): this;
  emit<K extends keyof MoonlinkEvents>(
    event: K,
    ...args: Parameters<MoonlinkEvents[K]>
  ): boolean;
  off<K extends keyof MoonlinkEvents>(
    event: K,
    listener: MoonlinkEvents[K],
  ): this;
}

/**
 * Creates a new MoonlinkManager instance.
 * @param {Nodes[]} nodes - An array of objects containing information about the Lavalink nodes.
 * @param {Options} options - An object containing options for the MoonlinkManager.
 * @param {Function} sPayload - A function to send payloads to the Lavalink nodes.
 * @returns {MoonlinkManager} - The new MoonlinkManager instance.
 * @throws {Error} - If the nodes parameter is empty or not an array.
 * @throws {Error} - If there are no parameters with node information in the nodes object.
 * @throws {Error} - If the clientName option is not set correctly.
 * @throws {RangeError} - If a plugin is not compatible.
 */

export class MoonlinkManager extends EventEmitter {
  public readonly _nodes: Nodes[];
  public readonly _sPayload: Function;
  public initiated: boolean;
  public options: Options;
  public nodes: Map<string, MoonlinkNode>;
  public spotify: Spotify;
  public clientId: string;
  public version: string;
  public map: Map<string, any> = new Map();
  constructor(nodes: Nodes[], options: Options, sPayload: Function) {
    super();
    if (!nodes)
      throw new Error('[ @Moonlink/Manager ]: "nodes" option is empty');
    if (nodes && !Array.isArray(nodes))
      throw new Error(
        '[ @Moonlink/Manager ]: the "nodes" option has to be in an array',
      );
    if (nodes && nodes.length == 0)
      throw new Error(
        '[ @Moonlink/Manager ]: there are no parameters with "node(s)" information in the object',
      );
    if (
      options &&
      typeof options.clientName !== "string" &&
      typeof options.clientName !== "undefined"
    )
      throw new Error(
        '[ @Moonlink/Manager ]: clientName option of the "options" parameter must be in string format',
      );
    if (!options.sortNode) options.sortNode = "players";
    if (!options.custom) options.custom = {};
    if (options.plugins) {
      options.plugins.forEach((plugin) => {
        if (!(plugin instanceof Plugin))
          throw new RangeError(
            `[ @Moonlink/Manager ]: this plugin is not compatible`,
          );
        plugin.load(this);
      });
    }
    this._nodes = nodes;
    this._sPayload = sPayload;
    this.options = options;
    this.nodes = new Map();
    this.spotify = new Spotify(options.spotify, this);
    this.version = require("../../index").version;
  }

  /**
   * Initializes the MoonlinkManager by connecting to the Lavalink nodes.
   * @param {string} clientId - The ID of the Discord client.
   * @returns {MoonlinkManager} - The MoonlinkManager instance.
   * @throws {TypeError} - If the clientId option is empty.
   */

  public init(clientId: string): this {
    if (this.initiated) return this;
    if (!clientId)
      throw new TypeError(
        '[ @Moonlink/Manager ]: "clientId" option is required.',
      );
    this.clientId = clientId;
    this._nodes.forEach((node) => this.addNode(node));
    this.initiated = true;
    return this;
  }

  /**
   * Adds a new Lavalink node to the MoonlinkManager.
   * @param {Node} node - An object containing information about the Lavalink node.
   * @returns {Node} - The added node.
   * @throws {Error} - If the host option is not configured correctly.
   * @throws {Error} - If the password option is not set correctly.
   * @throws {Error} - If the port option is not set correctly.
   */

  public addNode(node: Nodes): Nodes {
    const new_node: MoonlinkNode = new MoonlinkNode(this, node, this.map);
    if (node.identifier) this.nodes.set(node.identifier, new_node);
    else this.nodes.set(node.host, new_node);
    new_node.init();
    return new_node;
  }

  /**
   * Sorts the connected Lavalink nodes based on the specified criteria and returns the sorted nodes array.
   * @param sortType - The criteria by which to sort the nodes (e.g., "memory", "cpuLavalink", "cpuSystem", "calls", "playingPlayers", "players").
   * @returns The sorted array of nodes based on the specified criteria.
   */
  public sortByUsage(sortType: SortType): MoonlinkNode[] {
    const connectedNodes = [...this.nodes.values()].filter(
      (node) => node.isConnected,
    );
    if (connectedNodes.length == 0)
      throw new TypeError(
        "[ @Moonlink/Manager ]: No lavalink server connected",
      );
    switch (sortType) {
      case "memory":
        return this.sortNodesByMemoryUsage(connectedNodes);
      case "cpuLavalink":
        return this.sortNodesByLavalinkCpuLoad(connectedNodes);
      case "cpuSystem":
        return this.sortNodesBySystemCpuLoad(connectedNodes);
      case "calls":
        return this.sortNodesByCalls(connectedNodes);
      case "playingPlayers":
        return this.sortNodesByPlayingPlayers(connectedNodes);
      case "players":
      default:
        return this.sortNodesByPlayers(connectedNodes);
    }
  }

  /**
   * Sorts the connected Lavalink nodes by memory usage and returns the sorted nodes array.
   * @param nodes - The connected Lavalink nodes to sort.
   * @returns The sorted array of nodes by memory usage.
   */
  private sortNodesByMemoryUsage(nodes: MoonlinkNode[]): MoonlinkNode[] {
    return nodes.sort(
      (a, b) => (a.stats?.memory?.used || 0) - (b.stats?.memory?.used || 0),
    );
  }

  /**
   * Sorts the connected Lavalink nodes by Lavalink CPU load and returns the sorted nodes array.
   * @param nodes - The connected Lavalink nodes to sort.
   * @returns The sorted array of nodes by Lavalink CPU load.
   */
  private sortNodesByLavalinkCpuLoad(nodes: MoonlinkNode[]): MoonlinkNode[] {
    return nodes.sort(
      (a, b) =>
        (a.stats?.cpu?.lavalinkLoad || 0) - (b.stats?.cpu?.lavalinkLoad || 0),
    );
  }

  /**
   * Sorts the connected Lavalink nodes by system CPU load and returns the sorted nodes array.
   * @param nodes - The connected Lavalink nodes to sort.
   * @returns The sorted array of nodes by system CPU load.
   */
  private sortNodesBySystemCpuLoad(nodes: MoonlinkNode[]): MoonlinkNode[] {
    return nodes.sort(
      (a, b) =>
        (a.stats?.cpu?.systemLoad || 0) - (b.stats?.cpu?.systemLoad || 0),
    );
  }

  /**
   * Sorts the connected Lavalink nodes by the number of calls and returns the sorted nodes array.
   * @param nodes - The connected Lavalink nodes to sort.
   * @returns The sorted array of nodes by the number of calls.
   */
  private sortNodesByCalls(nodes: MoonlinkNode[]): MoonlinkNode[] {
    return nodes.sort((a, b) => a.calls - b.calls);
  }

  /**
   * Sorts the connected Lavalink nodes by the number of playing players and returns the sorted nodes array.
   * @param nodes - The connected Lavalink nodes to sort.
   * @returns The sorted array of nodes by the number of playing players.
   */
  private sortNodesByPlayingPlayers(nodes: MoonlinkNode[]): MoonlinkNode[] {
    return nodes.sort(
      (a, b) => (a.stats?.playingPlayers || 0) - (b.stats?.playingPlayers || 0),
    );
  }

  /**
   * Sorts the connected Lavalink nodes by the number of total players and returns the sorted nodes array.
   * @param nodes - The connected Lavalink nodes to sort.
   * @returns The sorted array of nodes by the number of total players.
   */
  private sortNodesByPlayers(nodes: MoonlinkNode[]): MoonlinkNode[] {
    return nodes.sort(
      (a, b) => (a.stats?.players || 0) - (b.stats?.players || 0),
    );
  }

  /**
   * Removes a Lavalink node from the MoonlinkManager.
   * @param {string} name - The name or identifier of the node to remove.
   * @returns {boolean} - True if the node is removed, false otherwise.
   * @throws {Error} - If the name option is empty.
   */

  public removeNode(name: string): boolean {
    if (!name) throw new Error('[ @Moonlink/Manager ]: option "name" is empty');
    let node = this.nodes.get(name);
    if (!node) return false;
    this.nodes.delete(name);
    return true;
  }

  public packetUpdate(packet: VoicePacket): void {
    const { t, d } = packet;
    if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(t)) return;

    const update: any = d;
    const guildId = update.guild_id;
    const player: any = this.players.get(guildId);

    if (!update || (!update.token && !update.session_id)) return;

    if (t === "VOICE_SERVER_UPDATE") {
      this.handleVoiceServerUpdate(update, guildId);
    }

    if (t === "VOICE_STATE_UPDATE" && update.user_id === this.clientId) {
      if (!player) return;

      if (!update.channel_id) {
        this.handlePlayerDisconnect(player, guildId);
      }

      if (update.channel_id && update.channel_id !== player.voiceChannel) {
        this.handlePlayerMove(
          player,
          update.channel_id,
          player.voiceChannel,
          guildId,
        );
      }

      this.updateVoiceStates(guildId, update);
      this.attemptConnection(guildId);
    }
  }

  private handleVoiceServerUpdate(update: any, guildId: string): void {
    const voiceServerData = { event: update };
    const existingVoiceServer = this.map.get("voiceServer") || {};
    existingVoiceServer[guildId] = voiceServerData;

    this.map.set("voiceServer", existingVoiceServer);
    this.attemptConnection(guildId);
  }

  private handlePlayerDisconnect(
    player: MoonlinkPlayer,
    guildId: string,
  ): void {
    this.emit("playerDisconnect", player);
    const players = this.map.get("players") || {};
    players[guildId] = {
      ...players[guildId],
      connected: false,
      voiceChannel: null,
      playing: false,
    };
    player.connected = false;
    player.voiceChannel = null;
    player.playing = false;
    player.stop();
  }

  private handlePlayerMove(
    player: MoonlinkPlayer,
    newChannelId: string,
    oldChannelId: string,
    guildId: string,
  ): void {
    this.emit("playerMove", player, newChannelId, oldChannelId);
    const players: any = this.map.get("players") || {};
    players[guildId] = {
      ...players[guildId],
      voiceChannel: newChannelId,
    };
    this.map.set("players", players);
    player.voiceChannel = newChannelId;
  }

  private updateVoiceStates(guildId: string, update: any): void {
    const voiceStates = this.map.get("voiceStates") || {};
    voiceStates[guildId] = update;
    this.map.set("voiceStates", voiceStates);
  }
  /**
   * Searches for tracks using the specified query and source.
   * @param {string | SearchQuery} options - The search query or an object containing the search options.
   * @returns {Promise<SearchResult>} - A promise that resolves with the search result.
   * @throws {Error} - If the search option is empty or not in the correct format.
   */
  public async search(options: string | SearchQuery): Promise<SearchResult> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!options) {
          throw new Error(
            "[ @Moonlink/Manager ]: the search option has to be in string format or in an array",
          );
        }

        let query;
        let source;

        if (typeof options === "object") {
          query = options.query;
          source = options.source;
        } else {
          query = options;
        }

        if (source && typeof source !== "string") {
          throw new Error(
            "[ @Moonlink/Manager ]: the source option has to be in string format",
          );
        }

        if (typeof query !== "string" && typeof query !== "object") {
          throw new Error(
            "[ @Moonlink/Manager ]: (search) the search option has to be in string or array format",
          );
        }

        const sources = {
          youtube: "ytsearch",
          youtubemusic: "ytmsearch",
          soundcloud: "scsearch",
          spotify: "spotify",
        };

        if (this.spotify.isSpotifyUrl(query)) {
          return resolve(await this.spotify.resolve(query));
        }

        let searchIdentifier =
          query.startsWith("http://") || query.startsWith("https://")
            ? query
            : source
            ? sources[source] ? `${sources[source]}:${query}` : `${source}:${query}`
            : `ytsearch:${query}`;

        const params = new URLSearchParams({ identifier: searchIdentifier });
        const res: any = await this.sortByUsage("memory")[0].request(
          "loadtracks",
          params,
        );
        if (
          ["error", "empty", "LOAD_FAILED", "NO_MATCHES"].includes(res.loadType)
        ) {
          this.emit(
            "debug",
            "[ @Moonlink/Manager ]: not found or there was an error loading the track",
          );
          return resolve(res);
        }

        if (["track", "TRACK_LOADED"].includes(res.loadType)) {
          res.data = [res.loadType === "TRACK_LOADED" ? res.tracks : res.data];
        }

        if (["playlist", "PLAYLIST_LOADED"].includes(res.loadType)) {
          res.data = {
            tracks: res.tracks,
            info: res.playlistInfo,
          };
          res.playlistInfo = {
            duration: res.data.tracks.reduce(
              (acc, cur) => acc + cur.info.length,
              0,
            ),
            name: res.data.info.name,
            selectedTrack: res.data.info.selectedTrack,
          };
          res.pluginInfo = res.data.pluginInfo;
          res.data = [...res.data.tracks];
        }

        if (res.loadType === "SEARCH_RESULT" && res.tracks) {
          res.data = res.tracks;
        }

        res.tracks = null;
        const tracks = res.data.map((x) => new MoonlinkTrack(x));

        resolve({
          ...res,
          tracks,
        });
      } catch (error) {
        this.emit(
          "debug",
          "[ @Moonlink/Manager ]: An error occurred: " + error.message,
        );
        reject(error);
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
      `[ @Moonlink/Manager ]: Application connection information being sent to Lavalink (${guildId})`,
    );
    await this.nodes.get(players[guildId].node).rest.update({
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
          '[ @Moonlink/Manager ]: "guildId" option in parameter to get player is empty or type is different from string',
        );
      if (!has(guildId)) return null;
      if (this.options.custom.player) {
        this.emit("debug", "[ @Moonlink/Custom ]: the player is customized");
        return new this.options.custom.player(
          this.map.get("players")[guildId],
          this,
          this.map,
        );
      }
      return new MoonlinkPlayer(
        this.map.get("players")[guildId],
        this,
        this.map,
      );
    };

    /**
     * Creates a new MoonlinkPlayer instance or gets an existing player for the specified guild.
     * @param {createOptions} data - The options for creating the player.
     * @returns {MoonlinkPlayer | null} - The MoonlinkPlayer instance or null if the guild does not have a player.
     * @throws {Error} - If the data parameter is not an object.
     * @throws {Error} - If the guildId option is empty or not a string.
     * @throws {Error} - If the textChannel option is empty or not a string.
     * @throws {Error} - If the voiceChannel option is empty or not a string.
     * @throws {TypeError} - If the autoPlay option is not a boolean.
     */

    let create: Function = (data: createOptions): MoonlinkPlayer => {
      if (
        typeof data !== "object" ||
        !data.guildId ||
        typeof data.guildId !== "string" ||
        !data.textChannel ||
        typeof data.textChannel !== "string" ||
        !data.voiceChannel ||
        typeof data.voiceChannel !== "string" ||
        (data.autoPlay !== undefined && typeof data.autoPlay !== "boolean") ||
        (data.node && typeof data.node !== "string")
      ) {
        const missingParams = [];
        if (!data.guildId || typeof data.guildId !== "string")
          missingParams.push("guildId");
        if (!data.textChannel || typeof data.textChannel !== "string")
          missingParams.push("textChannel");
        if (!data.voiceChannel || typeof data.voiceChannel !== "string")
          missingParams.push("voiceChannel");
        if (data.autoPlay !== undefined && typeof data.autoPlay !== "boolean")
          missingParams.push("autoPlay");
        if (data.node && typeof data.node !== "string")
          missingParams.push("node");

        throw new Error(
          `[ @Moonlink/Manager ]: Invalid or missing parameters for player creation: ${missingParams.join(
            ", ",
          )}`,
        );
      }

      if (has(data.guildId)) return get(data.guildId);

      let players_map: Map<string, object> | object =
        this.map.get("players") || {};
      let nodeSorted = this.sortByUsage(
        `${this.options.sortNode ? this.options.sortNode : "players"}`,
      )[0];

      players_map[data.guildId] = {
        guildId: data.guildId,
        textChannel: data.textChannel,
        voiceChannel: data.voiceChannel,
        volume: data.volume || 80,
        playing: false,
        connected: false,
        paused: false,
        shuffled: false,
        loop: null,
        autoPlay: data.autoPlay !== undefined ? data.autoPlay : true, // Default to true if not provided
        node: data.node || nodeSorted?.identifier || nodeSorted?.host,
      };
      this.map.set("players", players_map);

      if (this.options.custom.player) {
        this.emit("debug", "[ @Moonlink/Custom ]: the player is customized");
        this.emit("playerCreated", data.guildId);
        return new this.options.custom.player(
          players_map[data.guildId],
          this,
          this.map,
        );
      }
      this.emit("playerCreated", data.guildId);
      return new MoonlinkPlayer(players_map[data.guildId], this, this.map);
    };

    let all: any = this.map.get("players") ? this.map.get("players") : null;
    return {
      create: create.bind(this),
      get: get.bind(this),
      has: has.bind(this),
      all,
    };
  }
}
