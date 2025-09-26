import { EventEmitter } from "node:events";
import {
  IEvents,
  IVoiceState,
  IConfigManager,
  IOptionsManager,
  IPlayerConfig,
  ILavaLyricsObject,
  ILavaLyricsLine,
  INode
} from "../typings/Interfaces";
import { SearchSources, TSearchSources, TNativeSearchSources, TLavaSrcSearchSources } from "../typings/types";
import {
  Log,
  Structure,
  DatabaseManager,
  NodeManager,
  PlayerManager,
  SourceManager,
  Player,
  validateProperty,
  SearchResult,
  PluginManager,
  Node,
  isSourceBlacklisted,
  decodeTrack,
  isValidDiscordId,
} from "../../index";

import { LavaSrcPlugin } from "../plugins/LavaSrcPlugin";
import { YouTubePlugin } from "../plugins/YouTubePlugin";
import { GoogleCloudTTSPlugin } from "../plugins/GoogleCloudTTSPlugin";
import { SponsorBlockPlugin } from "../plugins/SponsorBlockPlugin";
import { LavaLyricsPlugin } from "../plugins/LavaLyricsPlugin";
import { LavaSearchPlugin } from "../plugins/LavaSearchPlugin";
import { SkybotPlugin } from "../plugins/SkybotPlugin";
import { LyricsKtPlugin } from "../plugins/LyricsKtPlugin";
import { JavaLyricsPlugin } from "../plugins/JavaLyricsPlugin";
import { JavaLavaLyricsPlugin } from "../plugins/JavaLavaLyricsPlugin";
import { LavaDSPXPlugin } from "../plugins/LavaDSPXPlugin";

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
  public database: DatabaseManager;
  public sources: SourceManager;
  public pluginManager: PluginManager;
  private lyricsResultCache: Map<string, ILavaLyricsObject | null> = new Map();

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
      ...config.options,
    };
    this.nodes = new (Structure.get("NodeManager"))(this, config.nodes);
    this.pluginManager = new (Structure.get("PluginManager"))(this);
    //register plugins supported by client
    this.pluginManager.registerPlugin(LavaSrcPlugin);
    this.pluginManager.registerPlugin(YouTubePlugin);
    this.pluginManager.registerPlugin(GoogleCloudTTSPlugin);
    this.pluginManager.registerPlugin(SponsorBlockPlugin);
    this.pluginManager.registerPlugin(LavaLyricsPlugin);
    this.pluginManager.registerPlugin(LavaSearchPlugin);
    this.pluginManager.registerPlugin(SkybotPlugin);
    this.pluginManager.registerPlugin(LyricsKtPlugin);
    this.pluginManager.registerPlugin(JavaLyricsPlugin);
    this.pluginManager.registerPlugin(JavaLavaLyricsPlugin);
    this.pluginManager.registerPlugin(LavaDSPXPlugin);
  }

  public async init(clientId: string): Promise<void> {
    if (this.initialize) return;
    if (!isValidDiscordId(clientId)) {
      throw new Error("Moonlink.js > Invalid clientId: must be a valid Discord snowflake (17-20 digits).");
    }
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
      this.database = new (Structure.get("DatabaseManager"))(this);
      await this.database.init();
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
    limit?: number;
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

    const { query, source, node: preferredNode, requester, fallbackSources, limit } = options;
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
            this.emit("debug", `Moonlink.js > Search > No node with support for source '${sourceName}' was found. Attempting to use a generic node; the search may fail.`);
            targetNode = this.nodes.sortByUsage("players");
            if (!targetNode || !targetNode.connected) {
              this.emit("debug", `Moonlink.js > Search > No connected node available to handle the request.`);
              continue;
            }
          }

          const data = await targetNode.rest.loadTracks(sourceName, query);
          result = new (Structure.get("SearchResult"))(data, {
            ...options,
            originNodeIdentifier: targetNode.identifier
          });
        }

        if (result && result.loadType !== "empty" && result.loadType !== "error") {
          result.tracks = result.tracks.filter(track => !isSourceBlacklisted(this, track.sourceName));
          const max = limit ?? this.options.playlistLoadLimit;

          if (max && result.tracks.length > max) {
            result.tracks = result.tracks.slice(0, max);
          }

          if (result.tracks.length === 0) {
            result.loadType = "empty";
          }
          return result;
        }
      } catch (e: any) {
        this.emit("debug", `Moonlink.js > Search > Failed to search with source ${sourceName}: ${e.message}`);
      }
    }

    return new (Structure.get("SearchResult"))({ loadType: "empty", data: {} }, options);
  }

  public async lavaSearch(options: {
    query: string;
    source?: TSearchSources;
    node?: string;
    requester?: unknown;
    types?: string;
  }): Promise<SearchResult> {
    validateProperty(
      options,
      (value) => value !== undefined,
      "(Moonlink.js) - Manager > LavaSearch > Options is required"
    );
    validateProperty(
      options.query,
      (value) => typeof value === "string",
      "(Moonlink.js) - Manager > LavaSearch > Query is required"
    );

    const { query, source, node: preferredNode, requester, types } = options;
    const initialSource = source ?? this.options.defaultPlatformSearch;

    const capability = `search:${initialSource}`;
    let targetNode = preferredNode
      ? this.nodes.get(preferredNode)
      : this.nodes.getNodeWithCapability(capability);

    if (!targetNode || !targetNode.connected) {
      this.emit("debug", `Moonlink.js > LavaSearch > No connected node found with capability '${capability}'. Attempting to use any connected node.`);
      targetNode = this.nodes.sortByUsage("players");
      if (!targetNode || !targetNode.connected) {
        this.emit("debug", `Moonlink.js > LavaSearch > No connected node available to handle the request.`);
        return new (Structure.get("SearchResult"))({ loadType: "empty", data: {} }, options);
      }
    }

    if (!targetNode.capabilities.has("lavasearch")) {
      this.emit("debug", `Moonlink.js > LavaSearch > Node ${targetNode.identifier} does not support LavaSearch. Falling back to standard search.`);
      return this.search(options);
    }

    try {
      const lavaSearchPlugin = targetNode.plugins.get("lavasearch-plugin");
      if (lavaSearchPlugin && (lavaSearchPlugin as any).search) {
        const data = await (lavaSearchPlugin as any).search(query, { source: initialSource, types });
        const result = new (Structure.get("SearchResult"))(data, {
          ...options,
          originNodeIdentifier: targetNode.identifier
        });
        result.tracks = result.tracks.filter(track => !isSourceBlacklisted(this, track.sourceName));
        if (result.tracks.length === 0) {
          result.loadType = "empty";
        }
        return result;
      } else {
        this.emit("debug", `Moonlink.js > LavaSearch > LavaSearchPlugin not found or does not have a search method on node ${targetNode.identifier}. Falling back to standard search.`);
        return this.search(options);
      }
    } catch (e: any) {
      this.emit("debug", `Moonlink.js > LavaSearch > Failed to perform LavaSearch: ${e.message}. Falling back to standard search.`);
      return this.search(options);
    }
  }

  public async packetUpdate(packet: any): Promise<void> {
    if (!packet.t) {
      this.emit("debug", `Moonlink.js > Manager > packetUpdate: Received packet without 't' property: ${JSON.stringify(packet)}`);
      return;
    }

    if (packet.t === "CHANNEL_DELETE") {
      const guildId = packet.d?.guild_id;
      const channelId = packet.d?.id;
      if (!guildId || !channelId) {
        this.emit("debug", `Moonlink.js > Manager > packetUpdate: CHANNEL_DELETE packet missing guild_id or id: ${JSON.stringify(packet)}`);
        return;
      }

      const player = this.players.get(guildId);
      if (player && player.voiceChannelId === channelId) {
        this.emit("debug", `Moonlink.js > Manager > packetUpdate: Voice channel ${channelId} for guild ${guildId} deleted. Destroying player.`);
        player.destroy("channelDeleted");
      }
      return;
    }

    if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t)) return;

    if (!packet.d || (!packet.d.token && !packet.d.session_id)) {
      this.emit("debug", `Moonlink.js > Manager > packetUpdate: Voice packet missing 'd' property or token/session_id: ${JSON.stringify(packet)}`);
      return;
    }

    const player = this.players.get(packet.d.guild_id);
    if (!player) {
      this.emit("debug", `Moonlink.js > Manager > packetUpdate: No player found for guild ${packet.d.guild_id}`);
      return;
    }

    if (!player.voiceState) player.voiceState = {};

    if (packet.t === "VOICE_SERVER_UPDATE") {
      await this._handleVoiceServerUpdate(packet, player);
    } else if (packet.t === "VOICE_STATE_UPDATE") {
      await this._handleVoiceStateUpdate(packet, player);
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
    player.connected = true;
    this.emit("playerReady", player);
  }

  private async _handleVoiceStateUpdate(packet: any, player: Player): Promise<void> {
    if (!packet || packet.t !== "VOICE_STATE_UPDATE") return
    const update = packet.d
    if (!update) return

    if (update.user_id !== this.options.clientId) {
      if (update.channel_id === player.voiceChannelId && update.channel_id !== null) {
        this.emit("playerVoiceJoin", player, update.user_id)
        this.emit("debug", `Moonlink.js > User ${update.user_id} joined voice channel ${update.channel_id} in guild ${player.guildId}`)
      } else if (update.channel_id === null && player.voiceChannelId !== null) {
        this.emit("playerVoiceLeave", player, update.user_id)
        this.emit("debug", `Moonlink.js > User ${update.user_id} left voice channel ${player.voiceChannelId} in guild ${player.guildId}`)
      }
      return
    }

    const getOld = (key: keyof Player["voiceState"]) =>
      player.voiceState && player.voiceState[key] !== undefined ? player.voiceState[key] : null

    const oldChannelId = player.voiceChannelId
    const oldSessionId = getOld("sessionId")
    const oldSelfMute = getOld("self_mute")
    const oldSelfDeaf = getOld("self_deaf")
    const oldMute = getOld("mute")
    const oldDeaf = getOld("deaf")
    const oldSuppress = getOld("suppress")

    const disconnected = !update.channel_id

    if (disconnected) {
      player.connected = false
      player.playing = false
      player.voiceChannelId = null
      player.voiceState = {}
      this.emit("playerDisconnected", player)
      this.emit("debug", `Moonlink.js > Player ${player.guildId} disconnected from voice (previous channel: ${oldChannelId ?? "none"}).`)
    }

    const channelChanged = update.channel_id !== oldChannelId && !!update.channel_id

    if (channelChanged) {
      this.emit("playerMoved", player, oldChannelId, update.channel_id)
      this.emit("debug", `Moonlink.js > Player ${player.guildId} moved from ${oldChannelId ?? "none"} to ${update.channel_id} (session incoming: ${update.session_id ?? "none"})`)
      player.voiceChannelId = update.channel_id
    }

    const sessionChanged = !channelChanged && oldSessionId && update.session_id && oldSessionId !== update.session_id
    if (sessionChanged) {
      this.emit("voiceSessionChanged", player, oldSessionId, update.session_id)
      this.emit("debug", `Moonlink.js > Session changed for guild ${player.guildId}: ${oldSessionId} -> ${update.session_id}`)
    }

    if (typeof update.self_mute === "boolean" && oldSelfMute !== update.self_mute) {
      this.emit("playerMuteChange", player, update.self_mute, update.mute)
      if (update.self_mute) {
        this.emit("debug", `Moonlink.js > Player ${player.guildId} self-mute enabled (channel: ${player.voiceChannelId}). Pausing playback if playing.`)
        if (!player.paused) {
          try {
            await player.pause()
          } catch (e) {
            this.emit("debug", `Moonlink.js > pause error: ${String(e)}`)
          }
        }
      } else {
        this.emit("debug", `Moonlink.js > Player ${player.guildId} self-mute disabled (channel: ${player.voiceChannelId}). Resuming if applicable.`)
        if (!update.mute && player.paused && player.current) {
          try {
            await player.resume()
          } catch (e) {
            this.emit("debug", `Moonlink.js > resume error: ${String(e)}`)
          }
        }
      }
    }

    if (typeof update.mute === "boolean" && oldMute !== update.mute) {
      this.emit("playerMuteChange", player, update.self_mute, update.mute)
      if (update.mute) {
        this.emit("debug", `Moonlink.js > Player ${player.guildId} server-mute enabled (channel: ${player.voiceChannelId}). Pausing playback.`)
        if (!player.paused) {
          try {
            await player.pause()
          } catch (e) {
            this.emit("debug", `Moonlink.js > pause error: ${String(e)}`)
          }
        }
      } else {
        this.emit("debug", `Moonlink.js > Player ${player.guildId} server-mute disabled (channel: ${player.voiceChannelId}).`)
        if (!update.self_mute && player.paused && player.current) {
          try {
            await player.resume()
          } catch (e) {
            this.emit("debug", `Moonlink.js > resume error: ${String(e)}`)
          }
        }
      }
    }

    if (typeof update.self_deaf === "boolean" && oldSelfDeaf !== update.self_deaf) {
      this.emit("playerDeafChange", player, update.self_deaf, update.deaf)
      this.emit("debug", `Moonlink.js > Player ${player.guildId} self-deaf changed to ${update.self_deaf} (channel: ${player.voiceChannelId})`)
    }

    if (typeof update.deaf === "boolean" && oldDeaf !== update.deaf) {
      this.emit("playerDeafChange", player, update.self_deaf, update.deaf)
      this.emit("debug", `Moonlink.js > Player ${player.guildId} server-deaf changed to ${update.deaf} (channel: ${player.voiceChannelId})`)
    }

    if (typeof update.suppress === "boolean" && oldSuppress !== update.suppress) {
      this.emit("playerSuppressChange", player, update.suppress)
      this.emit("debug", `Moonlink.js > Player ${player.guildId} suppress changed to ${update.suppress} (channel: ${player.voiceChannelId})`)
    }

    player.voiceState = {
      sessionId: update.session_id ?? oldSessionId,
      self_mute: update.self_mute,
      self_deaf: update.self_deaf,
      mute: update.mute,
      deaf: update.deaf,
      suppress: update.suppress
    }

    if ((channelChanged && !player.connected) || (sessionChanged && player.connected)) {
      this.emit("debug", `Moonlink.js > Establishing voice connection for guild ${player.guildId} (channel: ${player.voiceChannelId ?? "none"}, session: ${player.voiceState.sessionId ?? "none"})`)
      try {
        await this.attemptConnection(player.guildId)
        player.connected = true
        this.emit("playerReady", player)
      } catch (e) {
        this.emit("debug", `Moonlink.js > attemptConnection failed for guild ${player.guildId}: ${String(e)}`)
      }
    }
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

  public async getLyrics(options: {
    player?: Player;
    encodedTrack?: string;
    videoId?: string;
    skipTrackSource?: boolean;
    provider?: 'lavalyrics' | 'lyrics' | 'java-lyrics-plugin';
  }): Promise<ILavaLyricsObject | null> {
    validateProperty(
      options,
      (value) => value !== undefined,
      "(Moonlink.js) - Manager > getLyrics > Options is required"
    );

    const { player, encodedTrack, videoId, skipTrackSource, provider } = options;

    let cacheKey: string | undefined;
    if (player && player.current) {
        cacheKey = `${player.guildId}-${player.current.encoded}`;
        if (this.lyricsResultCache.has(cacheKey)) {
            this.emit("debug", `Moonlink.js > getLyrics > Cache hit for guild ${player.guildId}`);
            return this.lyricsResultCache.get(cacheKey)!;
        }
    }

    const capabilityMap = {
      lavalyrics: 'lavalyrics-plugin',
      lyrics: 'lyrics',
      'java-lyrics-plugin': 'java-lyrics-plugin',
    };

    const fallbackPlugins = Object.values(capabilityMap);

    const capabilitiesToTry = player
      ? []
      : capabilityMap[provider]
        ? [capabilityMap[provider].replace('-plugin', '')]
        : encodedTrack
          ? Object.keys(capabilityMap)
          : videoId
            ? Object.keys(capabilityMap).slice(1)
            : [];

    const targetNode = player?.node
      ?? capabilitiesToTry
        .map(cap => this.nodes.getNodeWithCapability(cap))
        .find(Boolean);

    const guildId = player?.guildId;

    const pluginsToTry = capabilityMap[provider]
      ? [capabilityMap[provider]]
      : fallbackPlugins;


    for (const pluginName of pluginsToTry) {
      if (!targetNode || !targetNode.connected || !targetNode.capabilities.has(pluginName.replace('-plugin', ''))) {
        this.emit("debug", `Moonlink.js > getLyrics > No connected node with ${pluginName.replace('-plugin', '')} capability found.`);
        continue;
      }

      const lyricsPlugin = targetNode.plugins.get(pluginName);
      if (lyricsPlugin && ((lyricsPlugin as any).getLyricsForCurrentTrack || (lyricsPlugin as any).getLyricsForTrack || (lyricsPlugin as any).getLyricsByVideoId)) {
        try {
          let resultLyrics: ILavaLyricsObject | null = null;
          if (player && guildId) {
            resultLyrics = await (lyricsPlugin as any).getLyricsForCurrentTrack(guildId, skipTrackSource);
             if ((!resultLyrics || !resultLyrics.lines || resultLyrics.lines.length === 0) && (lyricsPlugin as any).getStaticLyricsForTrack) {
                this.emit("debug", `Moonlink.js > getLyrics > No timed lyrics found for guild ${guildId} with ${pluginName}. Attempting static search.`);
                resultLyrics = await (lyricsPlugin as any).getStaticLyricsForTrack(guildId);
            }
          } else if (pluginName === 'lavalyrics-plugin' && encodedTrack) {
            resultLyrics = await (lyricsPlugin as any).getLyricsForTrack(encodedTrack, skipTrackSource);
          } else if (videoId) {
            resultLyrics = await (lyricsPlugin as any).getLyricsByVideoId(videoId);
          } else if (encodedTrack) {
            const trackInfo = decodeTrack(encodedTrack);
            if (trackInfo && trackInfo.info.identifier && trackInfo.info.sourceName === 'youtube' && (lyricsPlugin as any).getLyricsByVideoId) {
              resultLyrics = await (lyricsPlugin as any).getLyricsByVideoId(trackInfo.info.identifier);
            }
          }

          if (resultLyrics && (resultLyrics.text || (resultLyrics.lines && resultLyrics.lines.length > 0))) {
              if (cacheKey && resultLyrics) {
                  this.lyricsResultCache.set(cacheKey, resultLyrics);
              }
              return resultLyrics;
          }
        } catch (e: any) {
          this.emit("debug", `Moonlink.js > getLyrics > Failed to fetch lyrics with ${pluginName}: ${e.message}`);
        }
      }
    }
    return null;
  }

  public clearLyricsCacheForGuild(guildId: string): void {
    for (const key of this.lyricsResultCache.keys()) {
      if (key.startsWith(guildId)) {
        this.lyricsResultCache.delete(key);
      }
    }
  }

  public async searchLyrics(options: {
    query: string;
    provider?: 'lavalyrics' | 'lyrics' | 'java-lyrics-plugin';
    node?: string;
    source?: string;
  }): Promise<any[] | null> {
    validateProperty(
      options,
      (value) => value !== undefined,
      "(Moonlink.js) - Manager > searchLyrics > Options is required"
    );
    validateProperty(
      options.query,
      (value) => typeof value === "string",
      "(Moonlink.js) - Manager > searchLyrics > Query is required"
    );

    const { query, provider, node: preferredNode, source } = options;

    const validPlugins = ['lavalyrics-plugin', 'lyrics', 'java-lyrics-plugin'];
    const pluginsToTry = validPlugins.includes(provider)
      ? [provider]
      : validPlugins;

    for (const pluginName of pluginsToTry) {
      const capability = pluginName
      let targetNode = preferredNode
        ? this.nodes.get(preferredNode)
        : this.nodes.getNodeWithCapability(capability);

      if (!targetNode || !targetNode.connected || !targetNode.capabilities.has(capability)) {
        this.emit("debug", `Moonlink.js > searchLyrics > No connected node found with capability '${capability}'.`);
        continue;
      }

      const lyricsPlugin = targetNode.plugins.get(pluginName);
      if (lyricsPlugin && (lyricsPlugin as any).search) {
        try {
          return await (lyricsPlugin as any).search(query, source);
        } catch (e: any) {
          this.emit("debug", `Moonlink.js > searchLyrics > Failed to search lyrics with ${pluginName}: ${e.message}`);
        }
      }
    }
    return null;
  }

  public async subscribeLyrics(guildId: string, callback: (line: ILavaLyricsLine) => void, skipTrackSource?: boolean, provider?: 'lavalyrics' | 'lyrics' | 'java-lyrics-plugin'): Promise<void> {
    validateProperty(
      guildId,
      (value) => typeof value === "string",
      "(Moonlink.js) - Manager > subscribeLyrics > guildId is required and must be a string."
    );
    validateProperty(
      callback,
      (value) => typeof value === "function",
      "(Moonlink.js) - Manager > subscribeLyrics > callback is required and must be a function."
    );

    const player = this.players.get(guildId);
    if (!player) return;

    const validPlugins = ['lavalyrics-plugin', 'lyrics', 'java-lyrics-plugin'];
    const pluginsToTry = validPlugins.includes(provider)
      ? [provider]
      : validPlugins;

    for (const pluginName of pluginsToTry) {
      const capability = pluginName.replace('-plugin', '');
      const targetNode = player.node;

      if (!targetNode || !targetNode.connected || !targetNode.capabilities.has(capability)) {
        this.emit("debug", `Moonlink.js > subscribeLyrics > No connected node with ${capability} capability found for player ${guildId}.`);
        continue;
      }

      const lyricsPlugin = targetNode.plugins.get(pluginName);
      if (lyricsPlugin && (lyricsPlugin as any).subscribeToLiveLyrics && (lyricsPlugin as any).registerLyricsCallback) {
        try {
          (lyricsPlugin as any).registerLyricsCallback(guildId, callback);
          await (lyricsPlugin as any).subscribeToLiveLyrics(guildId, skipTrackSource);
          this.emit("debug", `Moonlink.js > subscribeLyrics > Subscribed to live lyrics for guild ${guildId} using ${pluginName}.`);
          return;
        } catch (e: any) {
          this.emit("debug", `Moonlink.js > subscribeLyrics > Failed to subscribe with ${pluginName}: ${e.message}`);
        }
      }
    }
    this.emit("debug", `Moonlink.js > subscribeLyrics > No suitable plugin found to subscribe to live lyrics for guild ${guildId}.`);
  }

  public async unsubscribeLyrics(guildId: string, provider?: 'lavalyrics' | 'lyrics' | 'java-lyrics-plugin'): Promise<void> {
    validateProperty(
      guildId,
      (value) => typeof value === "string",
      "(Moonlink.js) - Manager > unsubscribeLyrics > guildId is required and must be a string."
    );

    const player = this.players.get(guildId);
    if (!player) return;

    const validPlugins = ['lavalyrics-plugin', 'lyrics', 'java-lyrics-plugin'];
    const pluginsToTry = validPlugins.includes(provider)
      ? [provider]
      : validPlugins;

    for (const pluginName of pluginsToTry) {
      const capability = pluginName.replace('-plugin', '');
      const targetNode = player.node;

      if (!targetNode || !targetNode.connected || !targetNode.capabilities.has(capability)) {
        this.emit("debug", `Moonlink.js > unsubscribeLyrics > No connected node with ${capability} capability found for player ${guildId}.`);
        continue;
      }

      const lyricsPlugin = targetNode.plugins.get(pluginName);
      if (lyricsPlugin && (lyricsPlugin as any).unsubscribeFromLiveLyrics && (lyricsPlugin as any).unregisterLyricsCallback) {
        try {
          (lyricsPlugin as any).unregisterLyricsCallback(guildId);
          await (lyricsPlugin as any).unsubscribeFromLiveLyrics(guildId);
          this.emit("debug", `Moonlink.js > unsubscribeLyrics > Unsubscribed from live lyrics for guild ${guildId} using ${pluginName}.`);
          return;
        } catch (e: any) {
          this.emit("debug", `Moonlink.js > unsubscribeLyrics > Failed to unsubscribe with ${pluginName}: ${e.message}`);
        }
      }
    }
    this.emit("debug", `Moonlink.js > unsubscribeLyrics > No suitable plugin found to unsubscribe from live lyrics for guild ${guildId}.`);
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