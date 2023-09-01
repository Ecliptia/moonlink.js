import { MoonlinkManager, MoonlinkQueue, MoonlinkRest, MoonlinkNode } from "../../index";

export interface connectOptions {
  setMute?: boolean;
  setDeaf?: boolean;
}
export interface PlayerInfos {
  guildId: string;
  textChannel: string;
  voiceChannel: string | null;
  autoPlay?: boolean | null;
  connected?: boolean | null;
  playing?: boolean | null;
  paused?: boolean | null;
  loop?: number | null;
  volume?: number | null;
}

export class MoonlinkPlayer {
  private manager: MoonlinkManager;
  public payload: Function;
  public guildId: string;
  public textChannel: string;
  public voiceChannel: string;
  public autoPlay: boolean | null;
  public connected: boolean | null;
  public playing: boolean | null;
  public paused: boolean | null;
  public loop: number | null;
  public volume: number;
  public queue: MoonlinkQueue;
  public current: any;
  public data: any;
  public node: MoonlinkNode | any;
  public rest: MoonlinkRest;

  constructor(
    infos: PlayerInfos,
    manager: MoonlinkManager,
    map: Map<string, any>
  ) {
    this.payload = manager._sPayload;
    this.manager = manager;
    this.guildId = infos.guildId;
    this.textChannel = infos.textChannel;
    this.voiceChannel = infos.voiceChannel;
    this.autoPlay = infos.autoPlay;
    this.connected = infos.connected || null;
    this.playing = infos.playing || null;
    this.paused = infos.paused || null;
    this.loop = infos.loop || null;
    this.volume = infos.volume || 90;

    if (manager.options && manager.options.custom.queue) {
      this.queue = new manager.options.custom.queue(manager, this);
    } else {
      this.queue = new MoonlinkQueue(manager, this);
    }

    this.current = map.get("current") || {};
    this.current = this.current[this.guildId];
    this.data = map.get('players') || {};
    this.data = this.data[this.guildId];
    this.node = manager.nodes.get(this.get('node'));
    this.rest = this.node.rest;
  }

  private updatePlayers(): void {
    let players = this.map.get('players') || {};
    players[this.guildId] = this.data;
    this.map.set('players', players);
  }

  public set(key: string, value: unknown): void {
    this.data[key] = value;
    this.updatePlayers();
  }

  public get<T>(key: string): T {
    this.updatePlayers();
    return this.data[key] as T;
  }

  private validateChannelId(channelId: string): void {
  if (!channelId) {
    throw new Error('[ @Moonlink/Player ]: "channelId" option is empty');
  }
  if (typeof channelId !== "string") {
    throw new Error('[ @Moonlink/Player ]: option "channelId" is different from string');
  }
}

  public setTextChannel(channelId: string): boolean {
  this.validateChannelId(channelId);
  this.set('textChannel', channelId);
  this.textChannel = channelId;
  return true;
}

  public setVoiceChannel(channelId: string): boolean {
  this.validateChannelId(channelId);
  this.set('voiceChannel', channelId);
  this.voiceChannel = channelId;
  return true;
}

  public setAutoPlay(mode: boolean): boolean {
    if (!mode && typeof mode !== "boolean") {
      throw new Error('[ @Moonlink/Player ]: "mode" option is empty or is different from boolean');
    }
    this.set('autoPlay', mode);
    this.autoPlay = mode;
    return mode;
  }

  public connect(options: connectOptions): boolean | null {
    options = options || { setDeaf: false, setMute: false };
    const { setDeaf, setMute } = options;
    this.set("connected", true);
    this.payload(this.guildId, JSON.stringify({
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: this.voiceChannel,
        self_mute: setMute,
        self_deaf: setDeaf,
      },
    }));
    return true;
  }

  public disconnect(): boolean {
    this.set("connected", false);
    this.set("voiceChannel", null);
    this.payload(this.guildId, JSON.stringify({
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: null,
        self_mute: false,
        self_deaf: false,
      },
    }));
    return true;
  }

  public async restart(): Promise<void> {
    if (!this.current && !this.queue.size) return;
    if (!this.current) this.play();
    await this.rest.update({
      guildId: this.guildId,
      data: {
        encodedTrack: this.current.encoded,
        position: this.current.position,
        volume: this.volume,
      },
    });
  }

  public async play(): Promise<void> {
    if (!this.queue.size) return;
    let queue: any = this.queue.db.get(`queue.${this.guildId}`);
    let data: any = queue.shift();
    if (!data) return;
    let current = this.map.get("current") || {};
    current[this.guildId] = {
      ...data,
      thumbnail: data.thumbnail,
      requester: data.requester,
    };
    this.current = current[this.guildId];
    this.map.set("current", current);
    await this.queue.db.set(`queue.${this.guildId}`, queue);
    await this.rest.update({
      guildId: this.guildId,
      data: {
        encodedTrack: data.encoded,
        volume: this.volume,
      },
    });
  }

  public async pause(): Promise<boolean> {
    if (!this.paused) return true;
    await this.updatePlaybackStatus(true);
    return true;
  }

  public async resume(): Promise<boolean> {
    if (this.playing) return true;
    await this.updatePlaybackStatus(false);
    return true;
  }

  private async updatePlaybackStatus(paused: boolean): Promise<void> {
    await this.rest.update({
      guildId: this.guildId,
      data: { paused },
    });
    this.set("paused", paused);
    this.set("playing", !paused);
  }

  public async stop(): Promise<boolean> {
    const clearData = () => {
      delete this.map.get(`players`)[this.guildId];
      this.set("connected", false);
      this.set("voiceChannel", null);
    };

    if (!this.queue.size) {
      await this.rest.update({
        guildId: this.guildId,
        data: { encodedTrack: null },
      });
      clearData();
      return true;
    } else {
      clearData();
      return true;
    }
    return false;
  }

  public async skip(): Promise<boolean> {
    if (!this.queue.size) {
      this.destroy();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public async setVolume(percent: number): Promise<number> {
    if (typeof percent == "undefined" && typeof percent !== "number") {
      throw new Error('[ @Moonlink/Player ]: option "percent" is empty or different from number');
    }
    if (!this.playing) {
      throw new Error('[ @Moonlink/Player ]: cannot change volume while player is not playing');
    }
    await this.rest.update({
      guildId: this.guildId,
      data: { volume: percent },
    });
    let players = this.map.get("players") || {};
    players[this.guildId] = {
      ...players[this.guildId],
      volume: percent,
    };
    this.volume = percent;
    this.map.set("players", players);
    return percent;
  }

  public setLoop(mode: number | null): number | null {
    if (typeof mode !== 'number' || (mode !== null && (mode < 0 || mode > 2))) {
      throw new Error('[ @Moonlink/Player ]: the option "mode" is different from number or the option does not exist');
    }

    this.set("loop", mode);
    return mode;
  }

  public async destroy(): Promise<boolean> {
    if (this.connected) this.disconnect();
    await this.rest.destroy(this.guildId);
    this.queue.db.delete(`queue.${this.guildId}`);
    let players = this.map.get("players");
    delete players[this.guildId];
    this.map.set("players", players);
    return true;
  }

  private validateNumberParam(param: number, paramName: string): void {
    if (typeof param !== "number") {
      throw new Error(`[ @Moonlink/Player ]: option "${paramName}" is empty or different from number`);
    }
  }

  public async seek(position: number): Promise<number | null> {
    this.validateNumberParam(position, "position");
    if (position >= this.current.duration) {
      throw new Error(`[ @Moonlink/Player ]: parameter "position" is greater than the duration of the current track`);
    }
    if (!this.current.isSeekable && this.current.isStream) {
      throw new Error(`[ @Moonlink/Player ]: seek function cannot be applied on live video | or cannot be applied in "isSeekable"`);
    }
    await this.rest.update({
      guildId: this.guildId,
      data: { position },
    });
    return position;
  }

  public async skipTo(position: number): Promise<boolean | void> {
    this.validateNumberParam(position, "position");
    if (!this.queue.size) {
      throw new Error(`[ @Moonlink/Player ]: the queue is empty to use this function`);
    }
    let queue = this.queue.db.get(`queue.${this.guildId}`);
    if (!queue[position - 1]) {
      throw new Error(`[ @Moonlink/Player ]: the indicated position does not exist, make security in your code to avoid errors`);
    }
    let data: any = queue.splice(position - 1, 1)[0];
    let currents: any = this.map.get("current") || {};
    currents[this.guildId] = data;
    this.map.set("current", currents);
    this.queue.db.set(`queue.${this.guildId}`, queue);
    await this.rest.update({
      guildId: this.guildId,
      data: {
        encodedTrack: data.track
          ? data.track
          : data.encoded
          ? data.encoded
          : data.trackEncoded
          ? data.trackEncoded
          : null,
        volume: 90,
      },
    });
    return true;
  }

  public async shuffle(): Promise<boolean> {
    if (!this.queue.size) {
      throw new Error(`[ @Moonlink/Player ]: the queue is empty to use this function`);
    }
    let queue: any = this.queue.all;
    this.shuffleArray(queue);
    this.queue.db.set(`queue.${this.guildId}`, queue);
    return true;
  }

  private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
