import { IPlayerConfig, IVoiceState, ISpeakOptions, IChapter, ILavaLyricsObject, ILavaLyricsLine, IRESTGetPlayers } from "../typings/Interfaces";
import { TPlayerLoop } from "../typings/types";
import {
  Lyrics,
  Listen,
  Manager,
  Node,
  Filters,
  Queue,
  Track,
  Structure,
  validateProperty,
  isVoiceStateAttempt,
  decodeTrack,
  isSourceBlacklisted,
} from "../../index";

export class Player {
  readonly manager: Manager;
  public guildId: string;
  public voiceChannelId: string;
  public textChannelId: string;
  public region: string;
  public voiceState: IVoiceState = {};
  public autoPlay: boolean;
  public autoLeave: boolean;
  public connected: boolean = false;
  public playing: boolean = false;
  public destroyed: boolean = false;
  public paused: boolean = false;
  public volume: number = 80;
  public loop: TPlayerLoop = "off";
  public loopCount?: number;
  public current: Track;
  public previous: Track[] = [];
  public historySize: number = 10;
  public ping: number = 0;
  public readonly queue: Queue;
  public node: Node;
  public readonly data: Record<string, unknown> = {};
  public readonly filters: Filters;
  public healthCheckTimeout: NodeJS.Timeout | null = null;
  public isResuming: boolean = false;

  private _listen: Listen;
  private _lyrics: Lyrics;

  constructor(manager: Manager, config: IPlayerConfig) {
    this.manager = manager;
    this.guildId = config.guildId;
    this.voiceChannelId = config.voiceChannelId;
    this.textChannelId = config.textChannelId;
    this.volume = config.volume ?? 80;
    this.loop = config.loop ?? "off";
    this.loopCount = config.loopCount;
    this.autoPlay = config.autoPlay ?? false;
    this.autoLeave = config.autoLeave ?? false;
    this.queue = new (Structure.get("Queue"))(this);
    this.node = this.manager.nodes.get(config.node);
    this.filters = new (Structure.get("Filters"))(this);

    this.updateData(undefined, config);
  }

  get listen(): Listen {
    if (!this._listen) {
      if (this.manager.options.NodeLinkFeatures || this.node.info.isNodeLink) {
        this._listen = new (Structure.get("Listen"))(this);
      }
    }
    return this._listen;
  }

  get lyrics(): Lyrics {
    if (!this._lyrics) {
      if (this.manager.options.NodeLinkFeatures || this.node.info.isNodeLink) {
        this._lyrics = new (Structure.get("Lyrics"))(this);
      }
    }
    return this._lyrics;
  }

  public set(key: string, data: unknown): void {
    this.data[key] = data;
  }

  public get<T>(key: string): T {
    return this.data[key] as T;
  }

  public has(key: string): boolean {
    return this.data[key] !== undefined;
  }

  public delete(key: string): boolean {
    if (!this.has(key)) return false;
    return delete this.data[key];
  }

  public setVoiceChannelId(voiceChannelId: string): boolean {
    validateProperty(
      voiceChannelId,
      (value) => typeof value === "string",
      "Moonlink.js > Player#setVoiceChannelId - voiceChannelId must be a string."
    );
    if (this.voiceChannelId === voiceChannelId) return false;

    const oldVoiceChannelId = this.voiceChannelId;
    this.voiceChannelId = voiceChannelId;
    this.manager.emit("playerVoiceChannelIdSet", this, oldVoiceChannelId, voiceChannelId);
    return true;
  }

  public setTextChannelId(textChannelId: string): boolean {
    validateProperty(
      textChannelId,
      (value) => typeof value === "string",
      "Moonlink.js > Player#setTextChannelId - textChannelId must be a string."
    );
    if (this.textChannelId === textChannelId) return false;

    const oldTextChannelId = this.textChannelId;
    this.textChannelId = textChannelId;
    this.manager.emit("playerTextChannelIdSet", this, oldTextChannelId, textChannelId);
    return true;
  }

  public setAutoPlay(autoPlay: boolean): boolean {
    validateProperty(
      autoPlay,
      (value) => typeof value === "boolean",
      "Moonlink.js > Player#setAutoPlay - autoPlay must be a boolean."
    );
    if (this.autoPlay === autoPlay) return false;

    this.autoPlay = autoPlay;
    this.manager.emit("playerAutoPlaySet", this, autoPlay);
    this.updateData("autoPlay", autoPlay);
    return true;
  }

  public setAutoLeave(autoLeave: boolean): boolean {
    validateProperty(
      autoLeave,
      (value) => typeof value === "boolean",
      "Moonlink.js > Player#setAutoLeave - autoLeave must be a boolean."
    );
    if (this.autoLeave === autoLeave) return false;

    this.autoLeave = autoLeave;
    this.manager.emit("playerAutoLeaveSet", this, autoLeave);
    this.updateData("autoLeave", autoLeave);
    return true;
  }

  public connect(options: { setMute?: boolean; setDeaf?: boolean } = {}): boolean {
    if (!this.voiceChannelId) {
      this.manager.emit("debug", "Moonlink.js > Player#connect - Cannot connect without a voiceChannelId. Please set it before connecting.");
      return false;
    }
    this.manager.emit("playerConnecting", this);
    this.voiceState.attempt = false;
    this._sendVoiceUpdate({
      channel_id: this.voiceChannelId,
      self_mute: options.setMute ?? false,
      self_deaf: options.setDeaf ?? false,
    });
    this.manager.emit("playerConnected", this);
    return true;
  }

  public disconnect(): boolean {
    if (!this.connected) return false;
    this._sendVoiceUpdate({ channel_id: null });
    this.connected = false;
    this.manager.emit("playerDisconnected", this);
    return true;
  }

  public async play(
    options: {
      encoded?: string;
      requestedBy?: string | { id?: any; userData?: any };
      position?: number;
      endTime?: number;
      isBackPlay?: boolean;
    } = {}
  ): Promise<boolean> {
    if (!options.encoded && !this.queue.size) return false;
    if (!(await isVoiceStateAttempt(this))) return false;

    let positionToStart = options.position ?? 0;

    if (options.encoded) {
      const decodedTrack = decodeTrack(options.encoded);
      this.current = new Track(decodedTrack, options.requestedBy);
    } else {
      const trackFromQueue = await this.queue.shift();
      if (trackFromQueue) {
        if (trackFromQueue instanceof Track) {
          this.current = trackFromQueue;
        } else {
          this.current = new Track(decodeTrack((trackFromQueue as any).encoded), (trackFromQueue as any).requestedBy);
        }
        positionToStart = options.position ?? trackFromQueue.position ?? 0;
        this.current.setRequester(options.requestedBy ?? trackFromQueue.requestedBy);
      }
    }

    if (this.current?.pluginInfo?.MoonlinkInternal && !(await this.current.resolve())) {
      return false;
    }

    if (isSourceBlacklisted(this.manager, this.current.sourceName)) {
      this.manager.emit("debug", `Moonlink.js > Player > Track from blacklisted source (${this.current.sourceName}) detected for guild ${this.guildId}. Skipping.`);
      this.manager.emit("trackBlacklisted", this, this.current);
      if (this.queue.size > 0) {
        return this.play();
      } else {
        this.current = null;
        this.playing = false;
        return false;
      }
    }

    let targetNode: Node = this.node;
    if (this.current) {
      const requiredCapability = this.current.sourceName ? `search:${this.current.sourceName}` : undefined;

      if (requiredCapability && (!this.node.connected || !this.node.capabilities.has(requiredCapability))) {
        this.manager.emit("debug", `Moonlink.js > Player > Current node ${this.node.identifier} not suitable for source ${this.current.sourceName}.`);

        let foundNode: Node | undefined;

        if (this.current.origin) {
          foundNode = this.manager.nodes.getNodeWithCapability(requiredCapability, this.current.origin);
          if (foundNode) {
            this.manager.emit("debug", `Moonlink.js > Player > Found suitable node from originNodeIdentifier: ${foundNode.identifier}`);
          }
        }

        if (!foundNode && requiredCapability) {
          foundNode = this.manager.nodes.getNodeWithCapability(requiredCapability);
          if (foundNode) {
            this.manager.emit("debug", `Moonlink.js > Player > Found best node with capability: ${foundNode.identifier}`);
          }
        }

        if (!foundNode) {
          this.manager.emit("debug", `Moonlink.js > Player > No node with support for source '${this.current.sourceName}' was found. Attempting a fallback search on the default source.`);
          const searchResult = await this.manager.search({
            query: `${this.current.title} ${this.current.author}`,
            source: this.manager.options.defaultPlatformSearch,
            requester: this.current.requestedBy,
          });

          if (searchResult.tracks.length > 0) {
            this.current = searchResult.tracks[0];
            foundNode = this.manager.nodes.getBestNodeForTrack(this.current);
            if (foundNode) {
              this.manager.emit("debug", `Moonlink.js > Player > Successfully reconstructed track and found new node: ${foundNode.identifier}`);
            } else {
              this.manager.emit("debug", `Moonlink.js > Player > Failed to find node for reconstructed track. Aborting play.`);
              return false;
            }
          } else {
            this.manager.emit("debug", `Moonlink.js > Player > Generic search fallback failed for track: ${this.current.title}. Aborting play.`);
            return false;
          }
        }

        if (foundNode && foundNode.identifier !== this.node.identifier) {
          this.manager.emit("debug", `Moonlink.js > Player > Transferring player to new suitable node: ${foundNode.identifier}`);
          try {
            await this.transferNode(foundNode);
            targetNode = foundNode;
          } catch (e: any) {
            this.manager.emit("debug", `Moonlink.js > Player > Failed to transfer to new node ${foundNode.identifier}: ${e.message}. Aborting play.`);
            return false;
          }
        } else if (foundNode && foundNode.identifier === this.node.identifier) {
          this.manager.emit("debug", `Moonlink.js > Player > Current node ${this.node.identifier} is now suitable.`);
        }
      }
    }

    this.updateData("current", {
      encoded: this.current.encoded,
      position: 0,
      requestedBy: this.current.requestedBy,
    });

    this.set("isBackPlay", options.isBackPlay ?? false);
    targetNode.rest.update({
      guildId: this.guildId,
      data: {
        track: {
          encoded: this.current.encoded,
          userData: typeof (options.requestedBy ?? this.current?.requestedBy) === 'string'
            ? { id: options.requestedBy ?? this.current?.requestedBy }
            : options.requestedBy ?? this.current?.requestedBy,
        },
        position: positionToStart,
        endTime: options.endTime,
        volume: this.volume,
      },
    });

    this.playing = true;
    this.paused = false;
    this.manager.emit("playerTriggeredPlay", this, this.current);
    return true;
  }

  public async speak(options: ISpeakOptions): Promise<boolean> {
    validateProperty(
      options.text,
      (value) => typeof value === "string" && value.length > 0,
      "Moonlink.js > Player#speak - text must be a non-empty string."
    );

    const provider = options.provider || 'flowery';
    let capability: string;
    let uri: string;

    switch (provider) {
      case 'flowery':
        capability = "search:flowerytts";
        uri = `ftts://${encodeURIComponent(options.text)}`;
        if (options.options) {
          const params = new URLSearchParams();
          const floweryOptions = options.options as any;
          if (floweryOptions.voice) params.append("voice", floweryOptions.voice);
          if (floweryOptions.translate !== undefined) params.append("translate", String(floweryOptions.translate));
          if (floweryOptions.silence !== undefined) params.append("silence", String(floweryOptions.silence));
          if (floweryOptions.speed !== undefined) params.append("speed", String(floweryOptions.speed));
          if (floweryOptions.audio_format) params.append("audio_format", floweryOptions.audio_format);
          if (params.toString()) {
            uri += `?${params.toString()}`;
          }
        }
        break;
      case 'google':
        capability = "search:tts";
        uri = `tts://${encodeURIComponent(options.text)}`;
        if (options.options && (options.options as any).language) {
          uri += `?language=${(options.options as any).language}`;
        }
        break;
      case 'skybot':
        capability = "search:speak";
        uri = `${options.text}`;
        break;
      default:
        this.manager.emit("debug", `Moonlink.js > Player#speak - Unsupported TTS provider: ${provider}`);
        return false;
    }

    if (!this.node.capabilities.has(capability)) {
      this.manager.emit("debug", `Moonlink.js > Player#speak - Node ${this.node.identifier} does not support ${provider} TTS.`);
      return false;
    }

    const searchResult = await this.manager.search({
      query: uri,
      source: capability.split(":")[1],
      requester: this.manager.options.clientId,
    });

    if (searchResult.loadType === "track" && searchResult.tracks.length > 0) {
      const ttsTrack = searchResult.tracks[0];
      if (options.addToQueue) {
        this.queue.add(ttsTrack);
        if (!this.playing) {
          await this.play();
        }
      } else {
        const trackToResume = this.current;

        if (trackToResume) {
          const clonedTrackToResume = new Track(trackToResume.raw(), trackToResume.requestedBy);
          clonedTrackToResume.setPosition(Number(trackToResume.position));
          this.queue.unshift(clonedTrackToResume);
        }

        this.queue.unshift(ttsTrack);
        await this.play();
      }
      this.manager.emit("playerSpeak", this, options.text, options);
      return true;
    } else {
      this.manager.emit("debug", `Moonlink.js > Player#speak - Failed to load TTS track for text: ${options.text}`);
      return false;
    }
  }

  public async replay(): Promise<boolean> {
    if (!this.current?.encoded) return false;
    return await this.play({
      encoded: this.current.encoded,
      requestedBy: this.current.requestedBy,
      position: 0,
    });
  }

  public async back(): Promise<boolean> {
    if (this.previous.length === 0) return false;

    const lastTrack = this.previous.pop();
    if (!lastTrack) return false;

    let trackToPlay = lastTrack;
    while (trackToPlay && isSourceBlacklisted(this.manager, trackToPlay.sourceName)) {
      this.manager.emit("debug", `Moonlink.js > Player > Skipping blacklisted track (${trackToPlay.sourceName}) from previous tracks.`);
      this.manager.emit("trackBlacklisted", this, trackToPlay);
      trackToPlay = this.previous.pop();
    }

    if (!trackToPlay) {
      this.manager.emit("debug", `Moonlink.js > Player > No non-blacklisted tracks found in previous tracks.`);
      return false;
    }

    if (this.current) {
      this.queue.unshift(this.current);
    }

    this.current = trackToPlay;
    await this.play({ encoded: this.current.encoded, requestedBy: this.current.requestedBy, isBackPlay: true });

    this.manager.emit("playerTriggeredBack", this, lastTrack);
    return true;
  }

  public async restart(): Promise<boolean> {
    if (!this.current && !this.queue.size) return false;

    await this.connect();

    const wasPaused = this.paused;

    if (this.current) {
      await this.play({
        encoded: this.current.encoded,
        requestedBy: this.current.requestedBy,
        position: this.current.position,
      });
    } else {
      await this.play();
    }

    if (wasPaused) {
      this.pause();
    }

    return true;
  }

  public async transferNode(node: Node | string): Promise<boolean> {
    validateProperty(
      node,
      (value) => (value instanceof Node || typeof value === "string"),
      "Moonlink.js > Player#transferNode - node is not a valid Node or string."
    );

    const targetNode = typeof node === "string" ? this.manager.nodes.get(node) : node;
    if (!targetNode || !targetNode.connected || targetNode.identifier === this.node.identifier) {
      return false;
    }

    const oldNode = this.node;
    this.manager.emit("debug", `Transferring player ${this.guildId} from ${oldNode.identifier} to ${targetNode.identifier}.`);

    try {
      await this.node.rest.destroy(this.guildId);
    } catch (e) {
      this.manager.emit("debug", `Error destroying player on old node during transfer: ${e.message}`);
    }
    
    this.node = targetNode;

    await this.restart();

    this.manager.emit("playerSwitchedNode", this, oldNode, targetNode);
    return true;
  }

  public pause(): boolean {
    if (this.paused) return true;

    this.clearHealthCheck();

    this.node.rest.update({
      guildId: this.guildId,
      data: { paused: true },
    });

    this.manager.emit("playerTriggeredPause", this);
    this.updateData("paused", true);
    return (this.paused = true);
  }

  public resume(): boolean {
    if (!this.paused) return true;

    this.node.rest.update({
      guildId: this.guildId,
      data: { paused: false },
    });

    this.manager.emit("playerTriggeredResume", this);
    this.updateData("paused", false);
    return !(this.paused = false);
  }

  public stop(options?: { destroy?: boolean }): boolean {
    if (!this.playing) return false;

    this.node.rest.update({
      guildId: this.guildId,
      data: { track: { encoded: null } },
    });

    if (options?.destroy) {
      this.destroy();
    } else {
      this.queue.clear();
    }

    this.clearHealthCheck();
    this.playing = false;
    this.manager.emit("playerTriggeredStop", this);
    return true;
  }

  public async skip(position?: number): Promise<boolean> {
    if (!this.queue.size) {
      if (this.autoPlay) {
        await this.stop();
        return true;
      }
      return false;
    }

    let trackToPlay: Track | undefined;
    if (position !== undefined) {
      validateProperty(
        position,
        (value) => typeof value === "number" && !isNaN(value) && value >= 0 && value <= this.queue.size - 1,
        "Moonlink.js > Player#skip - position not a number or out of range"
      );
      trackToPlay = this.queue.get(position);
      if (!trackToPlay) return false;
      this.queue.remove(position);
    } else {
      trackToPlay = await this.queue.shift();
    }

    while (trackToPlay && isSourceBlacklisted(this.manager, trackToPlay.sourceName)) {
      this.manager.emit("debug", `Moonlink.js > Player > Skipping blacklisted track (${trackToPlay.sourceName}) from queue.`);
      this.manager.emit("trackBlacklisted", this, trackToPlay);
      trackToPlay = await this.queue.shift();
    }

    if (!trackToPlay) {
      this.current = null;
      this.playing = false;
      this.manager.emit("debug", `Moonlink.js > Player > No non-blacklisted tracks found after skipping.`);
      return false;
    }

    const oldTrack = this.current;
    this.current = trackToPlay;

    await this.play({ encoded: this.current.encoded, requestedBy: this.current.requestedBy });

    this.manager.emit("playerTriggeredSkip", this, oldTrack, this.current, position ?? 0);
    return true;
  }

  public async skipChapter(value: number = 1, type: 'index' | 'count' = 'count'): Promise<boolean> {
    if (!this.current?.chapters || this.current.chapters.length === 0) {
      this.manager.emit("debug", `Moonlink.js > Player#skipChapter - No chapters available for guild ${this.guildId}.`);
      return false;
    }

    let targetIndex: number;

    if (type === 'index') {
      targetIndex = value;
    } else {
      targetIndex = (this.current.currentChapterIndex ?? -1) + value;
    }

    if (targetIndex < 0 || targetIndex >= this.current.chapters.length) {
      this.manager.emit("debug", `Moonlink.js > Player#skipChapter - Target chapter index ${targetIndex} is out of bounds for guild ${this.guildId}.`);
      return false;
    }

    const targetChapter = this.current.chapters[targetIndex];
    if (!targetChapter) {
      this.manager.emit("debug", `Moonlink.js > Player#skipChapter - Target chapter not found for index ${targetIndex} in guild ${this.guildId}.`);
      return false;
    }

    this.current.currentChapterIndex = targetIndex;
    await this.seek(targetChapter.start);
    this.manager.emit("playerChapterSkipped", this, targetChapter);
    this.manager.emit("debug", `Moonlink.js > Player#skipChapter - Skipped to chapter ${targetChapter.name} at ${targetChapter.start}ms for guild ${this.guildId}.`);
    return true;
  }

  public seek(position: number): boolean {
    validateProperty(
      position,
      (value) => typeof value === "number" && !isNaN(value) && value >= 0 && value <= this.current.duration,
      "Moonlink.js > Player#seek - position is not a number or is out of range."
    );

    this.node.rest.update({
      guildId: this.guildId,
      data: { position },
    });

    this.manager.emit("playerTriggeredSeek", this, position);
    this.updateData("current.position", position);
    return true;
  }

  public shuffle(): boolean {
    if (this.queue.size < 2) return false;

    const oldQueueTracks = Array.from(this.queue.tracks);
    this.queue.shuffle();
    this.manager.emit("playerTriggeredShuffle", this, oldQueueTracks, this.queue.tracks);
    return true;
  }

  public setVolume(volume: number): boolean {
    validateProperty(
      volume,
      (value) => typeof value === "number" && !isNaN(value) && value >= 0 && value <= 1000,
      "Moonlink.js > Player#setVolume - volume is not a number or is out of range (0-1000)."
    );
    if (this.volume === volume) return false;

    const oldVolume = this.volume;
    this.volume = volume;

    this.node.rest.update({
      guildId: this.guildId,
      data: { volume: this.volume },
    });

    this.manager.emit("playerChangedVolume", this, oldVolume, volume);
    this.updateData("volume", volume);
    return true;
  }

  public setLoop(loop: TPlayerLoop, count?: number): boolean {
    validateProperty(
      loop,
      (value) => ["off", "track", "queue"].includes(value),
      "Moonlink.js > Player#setLoop - loop must be 'off', 'track', or 'queue'."
    );
    if (count !== undefined) {
      validateProperty(
        count,
        (value) => typeof value === "number" && value >= 0,
        "Moonlink.js > Player#setLoop - count must be a non-negative number."
      );
    }

    if (this.loop === loop && this.loopCount === count) return false;

    const oldLoop = this.loop;
    const oldLoopCount = this.loopCount;
    this.loop = loop;
    this.loopCount = (loop === "track" || loop === "queue") && count !== undefined ? count : undefined;

    this.manager.emit("playerChangedLoop", this, oldLoop, loop, oldLoopCount, this.loopCount);
    this.updateData("loop", loop);
    this.updateData("loopCount", this.loopCount);
    return true;
  }

  public destroy(reason?: string): boolean {
    if (this.destroyed) return true;

    this.disconnect();
    this.queue.clear();
    this.clearHealthCheck();
    this.manager.players.delete(this.guildId);
    this.manager.emit("playerDestroyed", this, reason);

    return (this.destroyed = true);
  }

  private _sendVoiceUpdate(
    data: { channel_id: string | null; self_mute?: boolean; self_deaf?: boolean }
  ): void {
    this.manager.sendPayload(
      this.guildId,
      JSON.stringify({
        op: 4,
        d: {
          guild_id: this.guildId,
          ...data,
        },
      })
    );
  }

  public async getSponsorBlockCategories(): Promise<string[]> {
    const plugin = this.node.plugins.get("sponsorblock-plugin");
    if (plugin && (plugin as any).getCategories) {
      const categories = await (plugin as any).getCategories(this.guildId);
      return Array.isArray(categories) ? categories : [];
    }
    return [];
  }

  public async setSponsorBlockCategories(categories: string[]): Promise<void> {
    const plugin = this.node.plugins.get("sponsorblock-plugin");
    if (plugin && (plugin as any).setCategories) {
      return (plugin as any).setCategories(this.guildId, categories);
    }
  }

  public async clearSponsorBlockCategories(): Promise<void> {
    const plugin = this.node.plugins.get("sponsorblock-plugin");
    if (plugin && (plugin as any).deleteCategories) {
      return (plugin as any).deleteCategories(this.guildId);
    }
  }

  private async updateData<T>(path?: string, data?: T): Promise<void> {
    const dbPath = `players.${this.guildId}${path ? `.${path}` : ''}`;
    await this.manager.database.set(dbPath, data);
  }

  private lastPositionSaveTime: number = 0;
  private positionSaveThrottle: number = 5000;

  public async saveCurrentPosition(position: number): Promise<void> {
    const now = Date.now();
    if (now - this.lastPositionSaveTime > this.positionSaveThrottle) {
        await this.updateData("current.position", position);
        this.lastPositionSaveTime = now;
    }
  }

  public getHistory(limit?: number): Track[] {
    if (limit === undefined) {
      return [...this.previous];
    }
    return this.previous.slice(Math.max(0, this.previous.length - limit));
  }

  public async getLyrics(encodedTrack?: string, skipTrackSource?: boolean, provider?: 'lavalyrics' | 'lyrics'): Promise<ILavaLyricsObject | null> {
    return this.manager.getLyrics({
      player: this,
      encodedTrack,
      skipTrackSource,
      provider,
    });
  }

  public async subscribeLyrics(callback: (line: ILavaLyricsLine) => void, skipTrackSource?: boolean, provider?: 'lavalyrics' | 'lyrics'): Promise<void> {
    return this.manager.subscribeLyrics(this.guildId, callback, skipTrackSource, provider);
  }

  public async unsubscribeLyrics(provider?: 'lavalyrics' | 'lyrics'): Promise<void> {
    return this.manager.unsubscribeLyrics(this.guildId, provider);
  }

  public async searchLyrics(query: string, provider?: 'lavalyrics' | 'lyrics'): Promise<any[] | null> {
    return this.manager.searchLyrics({
      query,
      provider,
    });
  }

  public clearHealthCheck(): void {
    if (this.healthCheckTimeout) {
      clearTimeout(this.healthCheckTimeout);
      this.healthCheckTimeout = null;
    }
  }

  public scheduleHealthCheck(): void {
    this.clearHealthCheck();

    const timeout = this.manager.options.playerHealthCheck?.stalePlayerTimeout ?? 20000;
    if (timeout <= 0) return;

    this.healthCheckTimeout = setTimeout(() => {
      this.checkHealth();
    }, timeout);
  }

  public async checkHealth(): Promise<void> {
    if (!this.playing || !this.current) return this.clearHealthCheck();

    let serverState: IRESTGetPlayers;
    try {
      serverState = await this.node.rest.getPlayer(this.node.sessionId, this.guildId);
    } catch (e) {
      this.manager.emit("debug", `Health check failed for ${this.guildId}: Node unresponsive. Attempting to transfer.`);
      const newNode = this.manager.nodes.sortByUsage("players");
      if (newNode && newNode.identifier !== this.node.identifier) {
        await this.transferNode(newNode);
      } else {
        this.manager.emit("debug", `Health check failed for ${this.guildId}: No other nodes available.`);
        this.destroy("unresponsiveNode");
      }
      return;
    }

    if (!serverState || !serverState.track) {
      this.manager.emit("debug", `Health check for ${this.guildId}: Player/track gone on server. Treating as track end.`);
      this.manager.emit("trackStale", this, this.current);

      
      if (this.previous.length > 0) {
        const resumedPrevious = await this.back();
        if (resumedPrevious) {
          this.manager.emit("debug", `Health check for ${this.guildId}: Resumed previous track.`);
          return;
        }
      }

      
      const skipped = await this.skip();
      if (skipped) {
        this.manager.emit("debug", `Health check for ${this.guildId}: Skipped to next track.`);
        return;
      }

      
      this.stop();
      this.manager.emit("debug", `Health check for ${this.guildId}: Stopped player due to stale track and empty queue.`);
      return;
    }

    if (serverState.track.encoded !== this.current.encoded) {
      this.manager.emit("debug", `Health check for ${this.guildId}: Track de-sync. Trusting server.`);
      this.current = new Track(serverState.track);
      this.playing = !serverState.paused;
      this.paused = serverState.paused;
      this.manager.emit("playerStateSync", this, serverState);
      this.current.position = serverState.state.position;
      await this.restart();
      return;
    }

    if (serverState.paused !== this.paused) {
      this.manager.emit("debug", `Health check for ${this.guildId}: Pause state de-sync. Syncing from server (paused: ${serverState.paused}).`);
      this.paused = serverState.paused;
      this.playing = !this.paused;
      return;
    }

    this.manager.emit("debug", `Health check for ${this.guildId}: Nudging stuck track.`);
    this.current.position = serverState.state.position;

    await this.restart();
  }
}