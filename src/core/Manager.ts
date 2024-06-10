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
  NodeManager,
  PlayerManager,
  Player,
  validateProperty,
  Track,
} from "../../index";

export declare interface Manager {
  on<K extends keyof IEvents>(event: K, listener: IEvents[K]): this;
  once<K extends keyof IEvents>(event: K, listener: IEvents[K]): this;
  emit<K extends keyof IEvents>(
    event: K,
    ...args: Parameters<IEvents[K]>
  ): boolean;
  off<K extends keyof IEvents>(event: K, listener: IEvents[K]): this;
}

export class Manager extends EventEmitter {
  public initialize: boolean = false;
  public readonly options: IOptionsManager;
  public readonly sendPayload: Function;
  public nodes: NodeManager;
  public players: PlayerManager = new PlayerManager(this);
  public version: string = require("../../index").version;
  constructor(config: IConfigManager) {
    super();
    this.sendPayload = config?.sendPayload;
    this.options = {
      clientName: `Moonlink.js/${this.version} (https://github.com/Ecliptia/moonlink.js)`,
      defaultPlatformSearch: "youtube",
      ...config.options,
    };

    this.nodes = new NodeManager(this, config.nodes);
  }
  public init(clientId: string): void {
    if (this.initialize) return;
    this.options.clientId = clientId;
    this.nodes.init();
    this.initialize = true;
  }
  public async search(options: {
    query: string;
    source?: TSearchSources;
    node?: string;
    requester?: unknown;
  }): Promise<ISearchResult> {
    return new Promise(async (resolve) => {
      validateProperty(
        options,
        (value) => value !== undefined,
        "(Moonlink.js) - Manager > Search > Options is required",
      );
      validateProperty(
        options.query,
        (value) => value !== undefined || value !== "string",
        "(Moonlink.js) - Manager > Search > Query is required",
      );
      let query = options.query;
      let source = options.source || this.options.defaultPlatformSearch;
      let requester = options.requester || null;

      if (![...this.nodes.cache.values()].filter((node) => node.connected))
        throw new Error("No available nodes to search from.");

      let node = this.nodes.get(options?.node) ?? this.nodes.best;

      let req = await node.rest.loadTracks(source, query);

      if (req.loadType == "error" || req.loadType == "empty") resolve(req);
      if (req.loadType == "track") req.data.tracks = [req.data as any];
      if (req.loadType == "search") req.data.tracks = req.data as any;

      let tracks: Track = req.data.tracks.map(
        (data: ITrack) => new Track(data, requester),
      ) as any;

      return resolve({
        ...req,
        tracks,
      });
    });
  }
  public packetUpdate(packet: any): void {
    if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t))
      return;

    if (!packet.d.token && !packet.d.session_id) return;

    const player = this.getPlayer(packet.d.guild_id);
    if (!player) return;

    if (!player.voiceState) player.voiceState = {};

    if (packet.t === "VOICE_SERVER_UPDATE") {
      player.voiceState.token = packet.d.token;
      player.voiceState.endpoint = packet.d.endpoint;

      this.attemptConnection(player.guildId);
    } else if (packet.t === "VOICE_STATE_UPDATE") {
      if (packet.d.user_id !== this.options.clientId) return;

      if (!packet.d.channel_id) {
        player.connected = false;
        player.playing = false;
        player.voiceChannelId = null;
        return;
      }

      if (packet.d.channel_id !== player.voiceChannelId) {
        player.voiceChannelId = packet.d.channel_id;
      }

      player.voiceState.sessionId = packet.d.session_id;

      this.attemptConnection(player.guildId);
    }
  }
  public async attemptConnection(guildId: string): Promise<boolean> {
    const player = this.getPlayer(guildId);
    if (!player) return;

    const voiceState: IVoiceState = player.voiceState;

    if (!voiceState.token || !voiceState.sessionId || !voiceState.endpoint)
      return;

    await player.node.rest.update({
      guildId,
      data: {
        voice: {
          sessionId: voiceState.sessionId,
          token: voiceState.token,
          endpoint: voiceState.endpoint,
        },
      },
    });

    return true;
  }
  public createPlayer(config: IPlayerConfig): Player {
    return this.players.create(config);
  }
  public getPlayer(guildId: string): Player {
    return this.players.get(guildId);
  }
}
