import { EventEmitter } from "node:events";
import {
  IEvents,
  IVoiceState,
  IConfigManager,
  IOptionsManager,
  IPlayerConfig
} from "../typings/Interfaces";
import { SearchSources, TSearchSources, TNativeSearchSources, TLavaSrcSearchSources } from "../typings/types";
import {
  Log,
  Structure,
  Database,
  NodeManager,
  PlayerManager,
  SourceManager,
  Player,
  validateProperty,
  SearchResult,
  PluginManager
} from "../../index";

import { LavaSrcPlugin } from "../plugins/LavaSrcPlugin";
import { YouTubePlugin } from "../plugins/YouTubePlugin";
import { GoogleCloudTTSPlugin } from "../plugins/GoogleCloudTTSPlugin";
import { SponsorBlockPlugin } from "../plugins/SponsorBlockPlugin";

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
  public sources: SourceManager;
  public pluginManager: PluginManager;
  constructor(config: IConfigManager) {
    super();

    validateProperty(
      config,
      (value) => value !== undefined,
      "Moonlink.js > Manager > Config is required."
    );

    validateProperty(
      config.sendPayload,
      (value) => typeof value === "function",
      "Moonlink.js > Manager > sendPayload function is required in config."
    );

    validateProperty(
      config.nodes,
      (value) => Array.isArray(value) && value.length > 0,
      "Moonlink.js > Manager > At least one node is required in config.nodes."
    );

    this.sendPayload = config.sendPayload;
    this.options = {
      clientName: `Moonlink.js/${this.version} (https://github.com/Ecliptia/moonlink.js)`,
      defaultPlatformSearch: SearchSources.YouTube,
      NodeLinkFeatures: false,
      logFile: { path: undefined, log: false },
      movePlayersOnReconnect: false,
      sortPlayersByRegion: false,
      resume: false,
      autoResume: false,
      disableDatabase: false,
      ...config.options,
    };
    this.nodes = new (Structure.get("NodeManager"))(this, config.nodes);
    this.pluginManager = new (Structure.get("PluginManager"))(this);
    //register plugins supported by client
    this.pluginManager.registerPlugin(LavaSrcPlugin);
    this.pluginManager.registerPlugin(YouTubePlugin);
    this.pluginManager.registerPlugin(GoogleCloudTTSPlugin);
    this.pluginManager.registerPlugin(SponsorBlockPlugin);
  }

  public async init(clientId: string): Promise<void> {
    if (this.initialize) return;
    try {
      if (this.options.logFile?.log) {
        validateProperty(
          this.options.logFile?.path,
          value => typeof value === "string",
          "Moonlink.js > Options > A path to save the log was not provided"
        );
        this.on("debug", (message: string) => Log(message, this.options.logFile?.path));
      }
      Structure.manager = this;
      this.options.clientId = clientId;
      this.database = await (Structure.get("Database")).create(this);
      this.sources = new (Structure.get("SourceManager"))(this);
      this.nodes.init();
      this.initialize = true;
      this.emit("debug", "Moonlink.js > initialized with clientId(" + clientId + "), ready to go!");
      this.emit("debug", "Moonlink.js > Version: " + this.version);
      this.emit("debug", "Moonlink.js > environment: " + (typeof globalThis.Deno !== "undefined" ? "Deno" : typeof globalThis.bun !== "undefined" ? "Bun" : "Node.js") + "; version: " + (typeof globalThis.Deno !== "undefined" ? (globalThis as any).Deno.version.deno : typeof globalThis.bun !== "undefined" ? (globalThis as any).Bun.version : process.version));
    } catch (e) {
      this.emit("debug", `Moonlink.js > Failed to initialize: ${e.message}`);
    }
  }
  public async search(options: {
    query: string;
    source?: TSearchSources;
    node?: string;
    requester?: unknown;
    fallbackSources?: TSearchSources[];
  }): Promise<SearchResult> {
    validateProperty(
      options,
      (value) => value !== undefined,
      "(Moonlink.js) - Manager > Search > Options is required"
    );
    validateProperty(
      options.query,
      (value) => typeof value === "string",
      "(Moonlink.js) - Manager > Search > Query is required"
    );

    const { query, source, node: preferredNode, requester, fallbackSources } = options;
    const initialSource = source ?? this.options.defaultPlatformSearch;
    const sourcesToTry = this.options.enableSourceFallback ? [initialSource, ...(fallbackSources || [])] : [initialSource];

    for (const sourceName of sourcesToTry) {
      let result: SearchResult | undefined;
      try {
        const [matched, sourceMatched] = this.sources.isLinkMatch(query, sourceName);

        if (!this.options.disableNativeSources && matched) {
          const nativeSource = this.sources.get(sourceMatched)!;
          if (nativeSource) {
            const data = await nativeSource.load(query, options);
            result = new (Structure.get("SearchResult"))(data, options);
          }
        } else if (!this.options.disableNativeSources && this.sources.has(sourceName)) {
          const nativeSource = this.sources.get(sourceName)!;
          const data = await nativeSource.search(query, options);
          result = new (Structure.get("SearchResult"))(data, options);
        } else {
          const capability = `search:${sourceName}`;
          let targetNode = preferredNode
            ? this.nodes.get(preferredNode)
            : this.nodes.getNodeWithCapability(capability);

          if (!targetNode || !targetNode.connected) {
            this.emit("debug", `Moonlink.js > Search > No connected node found with capability '${capability}'. Attempting to use any connected node.`);
            targetNode = this.nodes.sortByUsage("players");
            if (!targetNode || !targetNode.connected) {
              this.emit("debug", `Moonlink.js > Search > No connected node available to handle the request.`);
              continue; 
            }
          }

          const data = await targetNode.rest.loadTracks(sourceName, query);
          result = new (Structure.get("SearchResult"))(data, { ...options, originNodeIdentifier: targetNode.identifier });
        }

        if (result && result.loadType !== "empty" && result.loadType !== "error") {
          return result; 
        }
      } catch (e: any) {
        this.emit("debug", `Moonlink.js > Search > Failed to search with source ${sourceName}: ${e.message}`);
      }
    }

    return new (Structure.get("SearchResult"))({ loadType: "empty", data: {} }, options);
  }
  
  public async packetUpdate(packet: any): Promise<void> {
    if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t)) return;

    if (!packet.d.token && !packet.d.session_id) return;

    const player = this.players.get(packet.d.guild_id);
    if (!player) return;

    if (!player.voiceState) player.voiceState = {};

    if (packet.t === "VOICE_SERVER_UPDATE") {
      this._handleVoiceServerUpdate(packet, player);
    } else if (packet.t === "VOICE_STATE_UPDATE") {
      this._handleVoiceStateUpdate(packet, player);
    }
  }

  private async _handleVoiceServerUpdate(packet: any, player: Player): Promise<void> {
    player.voiceState.token = packet.d.token;
    player.voiceState.endpoint = packet.d.endpoint;

    if (packet.d.endpoint) {
      const match = packet.d.endpoint.match(/^([a-z-]+)[0-9]*\.discord\.media/i);
      if (match) {
        const region = match[1];
        player.region = region;
        this.emit(
          "debug",
          `Moonlink.js > Updated region (${region}) for guild ${player.guildId}`
        );
        if (this.options.sortPlayersByRegion && !player.node.regions.includes(region)) {
          let hasNode = [...this.nodes.cache.values()].some(node =>
            node.regions.includes(region)
          );
          if (hasNode) {
            let newNode = [...this.nodes.cache.values()].find(node =>
              node.regions.includes(region)
            );

            this.emit(
              "debug",
              `Moonlink.js > Moved player from ${player.node.uuid} to ${newNode.uuid}`
            );

            player.node = newNode;
          }
        }
      }
    }

    this.emit("debug", `Moonlink.js > Received voice server update for guild ${player.guildId}`);
    await this.attemptConnection(player.guildId);
    this.emit("playerReady", player);
  }

  private _handleVoiceStateUpdate(packet: any, player: Player): void {
    if (packet.d.user_id !== this.options.clientId) return;

    if (!packet.d.channel_id) {
      player.connected = false;
      player.playing = false;
      player.voiceChannelId = null;
      player.voiceState = {};

      this.emit("playerDisconnected", player);
      this.emit("debug", "Moonlink.js > Is disconnected from guild " + player.guildId);
      return;
    }

    if (packet.d.channel_id !== player.voiceChannelId) {
      this.emit("playerMoved", player, player.voiceChannelId, packet.d.channel_id);
      this.emit(
        "debug",
        `Moonlink.js > Moved to channel ${packet.d.channel_id} in guild ${player.guildId}`
      );
      player.voiceChannelId = packet.d.channel_id;
    }

    player.voiceState.sessionId = packet.d.session_id;

    this.emit("debug", `Moonlink.js > Received voice state update for guild ${player.guildId}`);
    this.attemptConnection(player.guildId);
    this.emit("playerReady", player);
  }

  public async attemptConnection(guildId: string): Promise<boolean> {
    const player = this.players.get(guildId);
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

    this.emit("playerConnecting", player);
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