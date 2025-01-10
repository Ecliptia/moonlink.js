import { EventEmitter } from "node:events";
import {
  IEvents,
  IVoiceState,
  IConfigManager,
  IOptionsManager,
  IPlayerConfig,
  ISearchResult,
  ITrack,
} from "../typings/Interfaces";
import { TSearchSources } from "../typings/types";
import {
  Log,
  Structure,
  Database,
  NodeManager,
  PlayerManager,
  Player,
  validateProperty,
  Track,
  SearchResult,
} from "../../index";

export declare interface Manager {
  on<K extends keyof IEvents>(event: K, listener: IEvents[K]): this;
  once<K extends keyof IEvents>(event: K, listener: IEvents[K]): this;
  emit<K extends keyof IEvents>(event: K, ...args: Parameters<IEvents[K]>): boolean;
  off<K extends keyof IEvents>(event: K, listener: IEvents[K]): this;
}

export class Manager extends EventEmitter {
  public initialize: boolean = false;
  public readonly options: IOptionsManager;
  public readonly sendPayload: Function;
  public nodes: NodeManager;
  public players: PlayerManager = new (Structure.get("PlayerManager"))(this);
  public version: string = require("../../index").version;
  public database: Database;
  constructor(config: IConfigManager) {
    super();
    this.sendPayload = config?.sendPayload;
    this.options = {
      clientName: `Moonlink.js/${this.version} (https://github.com/Ecliptia/moonlink.js)`,
      defaultPlatformSearch: "youtube",
      NodeLinkFeatures: false,
      previousInArray: false,
      logFile: { path: undefined, log: false },
      movePlayersOnReconnect: false,
      ...config.options,
    };
    this.nodes = new (Structure.get("NodeManager"))(this, config.nodes);

    if (this.options.plugins) {
      this.options.plugins.forEach(plugin => {
        plugin.load(this);
      });
    }
  }
  public init(clientId: string): void {
    if (this.initialize) return;
    if (this.options.logFile?.log) {
      validateProperty(
        this.options.logFile?.path,
        value => value !== undefined || typeof value !== "string",
        "Moonlink.js > Options > A path to save the log was not provided"
      );
      this.on("debug", (message: string) => Log(message, this.options.logFile?.path));
    }
    this.options.clientId = clientId;
    this.nodes.init();
    this.initialize = true;
    Structure.manager = this;
    this.emit("debug", "Moonlink.js > initialized with clientId(" + clientId + ")");
    this.database = new (Structure.get("Database"))(this);
  }
  public async search(options: {
    query: string;
    source?: TSearchSources;
    node?: string;
    requester?: unknown;
  }): Promise<SearchResult> {
    return new Promise(async resolve => {
      validateProperty(
        options,
        value => value !== undefined,
        "(Moonlink.js) - Manager > Search > Options is required"
      );
      validateProperty(
        options.query,
        value => value !== undefined || value !== "string",
        "(Moonlink.js) - Manager > Search > Query is required"
      );
      let query = options.query;
      let source = options.source || this.options.defaultPlatformSearch;
      let requester = options.requester || null;

      if (![...this.nodes.cache.values()].filter(node => node.connected))
        throw new Error("No available nodes to search from.");

      let node = this.nodes.cache.has(options?.node)
        ? this.nodes.get(options?.node)
        : this.nodes.best;

      let req = await node.rest.loadTracks(source, query);

      return resolve(new (Structure.get("SearchResult"))(req, options));
    });
  }
  public async packetUpdate(packet: any): Promise<void> {
    if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t)) return;

    if (!packet.d.token && !packet.d.session_id) return;

    const player = this.getPlayer(packet.d.guild_id);
    if (!player) return;

    if (!player.voiceState) player.voiceState = {};

    if (packet.t === "VOICE_SERVER_UPDATE") {
      player.voiceState.token = packet.d.token;
      player.voiceState.endpoint = packet.d.endpoint;

      this.emit("debug", `Moonlink.js > Received voice server update for guild ${player.guildId}`);
      await this.attemptConnection(player.guildId);
    } else if (packet.t === "VOICE_STATE_UPDATE") {
      if (packet.d.user_id !== this.options.clientId) return;

      if (!packet.d.channel_id) {
        player.connected = false;
        player.playing = false;
        player.voiceChannelId = null;
        player.voiceState = {};

        this.emit("playerDisconnected", player);
        return;
      }

      if (packet.d.channel_id !== player.voiceChannelId) {
        this.emit("playerMoved", player, player.voiceChannelId, packet.d.channel_id);
        player.voiceChannelId = packet.d.channel_id;
      }

      player.voiceState.sessionId = packet.d.session_id;

      this.emit("debug", `Moonlink.js > Received voice state update for guild ${player.guildId}`);
      await this.attemptConnection(player.guildId);
    }
  }
  public async attemptConnection(guildId: string): Promise<boolean> {
    const player = this.getPlayer(guildId);
    if (!player) return;

    const voiceState: IVoiceState = player.voiceState;

    if (!voiceState.token || !voiceState.sessionId || !voiceState.endpoint) {
      this.emit("debug", `Moonlink.js > Missing voice server data for guild ${guildId}, wait...`);
      return false;
    }

    let attempts: any = await player.node.rest.update({
      guildId,
      data: {
        voice: {
          sessionId: voiceState.sessionId,
          token: voiceState.token,
          endpoint: voiceState.endpoint,
        },
      },
    });

    this.emit(
      "debug",
      `Moonlink.js > Attempting to connect to ${
        player.node.identifier ?? player.node.host
      } for guild ${guildId}`
    );

    if (attempts) player.voiceState.attempt = true;
    return true;
  }
  public createPlayer(config: IPlayerConfig): Player {
    return this.players.create(config);
  }
  public getPlayer(guildId: string): Player {
    return this.players.get(guildId);
  }
  public hasPlayer(guildId: string): boolean {
    return this.players.has(guildId);
  }
  public deletePlayer(guildId: string): boolean {
    this.players.delete(guildId);
    return true;
  }
  public getAllPlayers(): Map<string, Player> {
    return this.players.cache;
  }
}
