import { IPlayerConfig, IVoiceState } from "../typings/Interfaces";
import { TPlayerLoop } from "../typings/types";
import { Lyrics, Listen, Manager, Node, Queue, Track, validateProperty } from "../../index";

export class Player {
  readonly manager: Manager;
  public guildId: string;
  public voiceChannelId: string;
  public textChannelId: string;
  public voiceState: IVoiceState = {};
  public autoPlay: boolean;
  public autoLeave: boolean;
  public connected: boolean;
  public playing: boolean;
  public paused: boolean;
  public volume: number = 80;
  public loop: TPlayerLoop = "off";
  public current: Track;
  public previous: Track | Track[];
  public ping: number = 0;
  public queue: Queue;
  public node: Node;
  public data: Record<string, unknown> = {};
  public listen: Listen;
  public lyrics: Lyrics;

  constructor(manager: Manager, config: IPlayerConfig) {
    this.manager = manager;
    this.guildId = config.guildId;
    this.voiceChannelId = config.voiceChannelId;
    this.textChannelId = config.textChannelId;
    this.connected = false;
    this.playing = false;
    this.paused = false;
    this.previous = manager.options.previousInArray ? [] : null;
    this.volume = config.volume || 80;
    this.loop = config.loop || "off";
    this.autoPlay = config.autoPlay || false;
    this.autoLeave = config.autoLeave || false;
    this.queue = new Queue();
    this.node = this.manager.nodes.get(config.node);
    if (manager.options.NodeLinkFeatures || this.node.info.isNodeLink) {
      this.listen = new Listen(this);
      this.lyrics = new Lyrics(this);
    }
  }

  public set(key: string, data: unknown): void {
    this.data[key] = data;
  }

  public get<T>(key: string): T {
    return this.data[key] as T;
  }

  public setVoiceChannelId(voiceChannelId: string): boolean {
    validateProperty(
      voiceChannelId,
      (value) => value !== undefined || typeof value !== "string",
      "Moonlink.js > Player#setVoiceChannelId - voiceChannelId not a string"
    );
    let oldVoiceChannelId = String(this.voiceChannelId);

    this.voiceChannelId = voiceChannelId;
    this.manager.emit("playerVoiceChannelIdSet", this, oldVoiceChannelId, voiceChannelId);
    return true;
  }

  public setTextChannelId(textChannelId: string): boolean {
    validateProperty(
      textChannelId,
      (value) => value !== undefined || typeof value !== "string",
      "Moonlink.js > Player#setTextChannelId - textChannelId not a string"
    );
    let oldTextChannelId = String(this.textChannelId);
    this.textChannelId = textChannelId;
    this.manager.emit("playerTextChannelIdSet", this, oldTextChannelId, textChannelId);
    return true;
  }

  public setAutoPlay(autoPlay: boolean): boolean {
    validateProperty(
      autoPlay,
      (value) => value !== undefined || typeof value !== "boolean",
      "Moonlink.js > Player#setAutoPlay - autoPlay not a boolean"
    );

    this.autoPlay = autoPlay;
    this.manager.emit("playerAutoPlaySet", this, autoPlay);
    return true;
  }

  public setAutoLeave(autoLeave: boolean): boolean {
    validateProperty(
      autoLeave,
      (value) => value !== undefined || typeof value !== "boolean",
      "Moonlink.js > Player#setAutoLeave - autoLeave not a boolean"
    );

    this.autoLeave = autoLeave;
    this.manager.emit("playerAutoLeaveSet", this, autoLeave);
    return true;
  }

  public connect(options: { setMute?: boolean; setDeaf?: boolean }): boolean {
    this.manager.sendPayload(
      this.guildId,
      JSON.stringify({
        op: 4,
        d: {
          guild_id: this.guildId,
          channel_id: this.voiceChannelId,
          self_mute: options?.setMute || false,
          self_deaf: options?.setDeaf || false,
        },
      })
    );

    this.connected = true;
    this.manager.emit("playerConnected", this);
    return true;
  }

  public disconnect(): boolean {
    this.manager.sendPayload(
      this.guildId,
      JSON.stringify({
        op: 4,
        d: {
          guild_id: this.guildId,
          channel_id: null,
          self_mute: false,
          self_deaf: false,
        },
      })
    );

    this.connected = false;
    this.manager.emit("playerDisconnected", this);
    return true;
  }

  public play(): boolean {
    if (!this.queue.size) return false;

    this.current = this.queue.shift();

    this.node.rest.update({
      guildId: this.guildId,
      data: {
        track: {
          encoded: this.current.encoded,
        },
        volume: this.volume,
      },
    });

    this.playing = true;
    this.manager.emit("playerTriggeredPlay", this, this.current);
    return true;
  }

  public pause(): boolean {
    if (this.paused) return true;

    this.node.rest.update({
      guildId: this.guildId,
      data: {
        paused: true,
      },
    });

    this.paused = true;
    this.manager.emit("playerTriggeredPause", this);
    return true;
  }

  public resume(): boolean {
    if (!this.paused) return true;

    this.node.rest.update({
      guildId: this.guildId,
      data: {
        paused: false,
      },
    });

    this.paused = false;
    this.manager.emit("playerTriggeredResume", this);
    return true;
  }

  public stop(options?: {
    destroy?: boolean;
  }): boolean {
    if (!this.playing) return false;

    this.node.rest.update({
      guildId: this.guildId,
      data: {
        track: {
          encoded: null,
        },
      },
    });
    
    options?.destroy ? this.destroy()
            : this.queue.clear();

    this.playing = false;
    this.manager.emit("playerTriggeredStop", this);
    return true;
  }

  public async skip(position?: number): Promise<boolean> {
    if(!this.queue.size && this.autoPlay) {
      await this.node.rest.update({
        guildId: this.guildId,
        data: {
          track: {
            encoded: null,
          },
        },
      });
    } else if (!this.queue.size) return false;
    
    validateProperty(
      position,
      (value) =>
        value !== undefined ||
        isNaN(value) ||
        value < 0 ||
        value > this.queue.size - 1,
      "Moonlink.js > Player#skip - position not a number or out of range"
    );
    let oldTrack = { ...this.current };
    if (position) {
      this.current = this.queue.get(position);
      this.queue.remove(position);

      this.node.rest.update({
        guildId: this.guildId,
        data: {
          track: {
            encoded: this.current.encoded,
          },
        },
      });
    } else this.play();

    this.manager.emit("playerTriggeredSkip", this, oldTrack, this.current, position ?? 0);
    return true;
  }

  public seek(position: number): boolean {
    validateProperty(
      position,
      (value) =>
        value !== undefined ||
        isNaN(value) ||
        value < 0 ||
        value > this.current.duration,
      "Moonlink.js > Player#seek - position not a number or out of range"
    );

    this.node.rest.update({
      guildId: this.guildId,
      data: {
        position: position,
      },
    });

    this.manager.emit("playerTriggeredSeek", this, position);
    return true;
  }

  public shuffle(): boolean {
    if (this.queue.size < 2) return false;

    let oldQueue = { ...this.queue.tracks };
    this.queue.shuffle();
    this.manager.emit("playerTriggeredShuffle", this, oldQueue, this.queue.tracks);
    return true;
  }

  public setVolume(volume: number): boolean {
    validateProperty(
      volume,
      (value) =>
        value !== undefined || isNaN(value) || value < 0 || value > 100,
      "Moonlink.js > Player#setVolume - volume not a number or out of range"
    );
    let oldVolume = Number(this.volume);
    this.volume = volume;

    this.node.rest.update({
      guildId: this.guildId,
      data: {
        volume: this.volume,
      },
    });
    
    this.manager.emit("playerChangedVolume", this, oldVolume, volume);
    return true;
  }

  public setLoop(loop: TPlayerLoop): boolean {
    validateProperty(
      loop,
      (value: any) =>
        value !== undefined ||
        value !== "off" ||
        value !== "track" ||
        value !== "queue",
      "Moonlink.js > Player#setLoop - loop not a valid value"
    );
    let oldLoop: TPlayerLoop = this.loop;

    this.loop = loop;
    this.manager.emit("playerChangedLoop", this, oldLoop, loop);
    return true;
  }

  public destroy(): boolean {
    if (this.connected) this.disconnect();
    this.queue.clear();
    this.manager.players.delete(this.guildId);

    this.manager.emit("playerDestroyed", this);
    return true;
  }
}
