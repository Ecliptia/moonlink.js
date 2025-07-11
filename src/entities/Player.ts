import { IPlayerConfig, IVoiceState } from "../typings/Interfaces";
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
      (value) => typeof value !== "string",
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
      (value) => typeof value !== "string",
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
      (value) => typeof value !== "boolean",
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
      (value) => typeof value !== "boolean",
      "Moonlink.js > Player#setAutoLeave - autoLeave must be a boolean."
    );
    if (this.autoLeave === autoLeave) return false;

    this.autoLeave = autoLeave;
    this.manager.emit("playerAutoLeaveSet", this, autoLeave);
    this.updateData("autoLeave", autoLeave);
    return true;
  }

  public connect(options: { setMute?: boolean; setDeaf?: boolean } = {}): boolean {
    this.manager.emit("playerConnecting", this);
    this.voiceState.attempt = false;
    this._sendVoiceUpdate({
      channel_id: this.voiceChannelId,
      self_mute: options.setMute ?? false,
      self_deaf: options.setDeaf ?? false,
    });
    this.manager.emit("playerConnected", this);
    return (this.connected = true);
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
    } = {}
  ): Promise<boolean> {
    if (!options.encoded && !this.queue.size) return false;
    await isVoiceStateAttempt(this);

    if (options.encoded) {
      const decodedTrack = decodeTrack(options.encoded);
      this.current = new Track(decodedTrack, options.requestedBy);
    } else {
      this.current = this.queue.shift();
    }

    if (typeof options.requestedBy === "string" || typeof this.current?.requestedBy === "string") {
      this.current.setRequester({ id: options.requestedBy ?? this.current?.requestedBy });
    }

    if (this.current?.pluginInfo?.MoonlinkInternal && !(await this.current.resolve())) {
      return false;
    }

    this.updateData("current", {
      encoded: this.current.encoded,
      position: 0,
      requestedBy: this.current.requestedBy,
    });

    this.node.rest.update({
      guildId: this.guildId,
      data: {
        track: {
          encoded: this.current.encoded,
          userData: options.requestedBy ?? this.current?.requestedBy,
        },
        position: options.position ?? 0,
        endTime: options.endTime,
        volume: this.volume,
      },
    });

    this.manager.emit("playerTriggeredPlay", this, this.current);
    return (this.playing = true);
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

    if (this.current) {
      this.queue.unshift(this.current);
    }

    this.current = lastTrack;
    await this.play({ encoded: this.current.encoded, requestedBy: this.current.requestedBy });

    this.manager.emit("playerTriggeredBack", this, lastTrack);
    return true;
  }

  public async restart(): Promise<boolean> {
    if (!this.current && !this.queue.size) return false;

    await this.connect();

    if (this.current) {
      await this.play({
        encoded: this.current.encoded,
        requestedBy: this.current.requestedBy,
        position: this.current.position,
      });
    } else {
      await this.play();
    }
    return true;
  }

  public async transferNode(node: Node | string): Promise<boolean> {
    validateProperty(
      node,
      (value) => !(value instanceof Node || typeof value === "string"),
      "Moonlink.js > Player#transferNode - node is not a valid Node or string."
    );

    const targetNode = typeof node === "string" ? this.manager.nodes.get(node) : node;
    if (!targetNode) return false;

    const oldNode = this.node;
    this.node = targetNode;

    if (this.current || this.queue.size) {
      await this.restart();
    } else {
      await this.connect();
    }

    this.manager.emit("playerSwitchedNode", this, oldNode, targetNode);
    return true;
  }

  public pause(): boolean {
    if (this.paused) return true;

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

    this.playing = false;
    this.manager.emit("playerTriggeredStop", this);
    return true;
  }

  public async skip(position?: number): Promise<boolean> {
    if (!this.queue.size) {
      if(this.autoPlay) {
        await this.stop();
      }
      return false;
    }

    validateProperty(
      position,
      value => value !== undefined || isNaN(value) || value < 0 || value > this.queue.size - 1,
      "Moonlink.js > Player#skip - position not a number or out of range"
    );

    const oldTrack = this.current;
    if (position !== undefined) {
      const trackToSkipTo = this.queue.get(position);
      if (!trackToSkipTo) return false;

      this.queue.remove(position);
      this.current = trackToSkipTo;

      await this.play({ encoded: this.current.encoded });
    } else {
      await this.play();
    }

    this.manager.emit("playerTriggeredSkip", this, oldTrack, this.current, position ?? 0);
    return true;
  }

  public seek(position: number): boolean {
    validateProperty(
      position,
      (value) => typeof value !== "number" || isNaN(value) || value < 0 || value > this.current.duration,
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
      (value) => typeof value !== "number" || isNaN(value) || value < 0 || value > 1000, // Lavalink supports up to 1000%
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
      (value) => !["off", "track", "queue"].includes(value),
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

  private updateData<T>(path?: string, data?: T): void {
    const dbPath = `players.${this.guildId}${path ? `.${path}` : ''}`;
    this.manager.database.set(dbPath, data);
  }

  public getHistory(limit?: number): Track[] {
    if (limit === undefined) {
      return [...this.previous];
    }
    return this.previous.slice(Math.max(0, this.previous.length - limit));
  }
}