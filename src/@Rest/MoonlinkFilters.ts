import { MoonlinkPlayer, MoonlinkManager, MoonlinkRest } from '../../index';

export class MoonlinkFilters {
  private player: MoonlinkPlayer;
  private manager: MoonlinkManager;
  private rest: MoonlinkRest;
  volume: number | null;
  equalizer: Equalizer[] | null;
  karaoke: Karaoke | null;
  timescale: Timescale | null;
  tremolo: Tremolo | null;
  vibrato: Vibrato | null;
  rotation: Rotation | null;
  distortion: Distortion | null;
  channelMix: ChannelMix | null;
  lowPass: LowPass | null;
  pluginFilters: PluginFilters | null;

  constructor(player) {
    this.player = player;
    this.rest = player.rest;
    this.manager = player.manager;
    this.volume = this.player.get('volume') || null;
    this.equalizer = this.player.get('equalizer') || null;
    this.karaoke = this.player.get('karaoke') || null;
    this.timescale = this.player.get('timescale') || null;
    this.tremolo = this.player.get('tremolo') || null;
    this.vibrato = this.player.get('vibrato') || null;
    this.rotation = this.player.get('rotation') || null;
    this.distortion = this.player.get('distortion') || null;
    this.channelMix = this.player.get('channelMix') || null;
    this.lowPass = this.player.get('lowPass') || null;
    this.pluginFilters = this.player.get('pluginFilters') || null;
  }

  public setVolume(volume: number | null): this {
    this.player.set('volume', volume);
    this.volume = volume;
    this.updateFiltersFromRest();
    return this;
  }

  public setEqualizer(equalizer: Equalizer[] | null): this {
    this.player.set('equalizer', equalizer);
    this.equalizer = equalizer;
    this.updateFiltersFromRest();
    return this;
  }

  public setKaraoke(karaoke: Karaoke | null): this {
    this.player.set('karaoke', karaoke);
    this.karaoke = karaoke;
    this.updateFiltersFromRest();
    return this;
  }

  public setTimescale(timescale: Timescale | null): this {
    this.player.set('timescale', timescale);
    this.timescale = timescale;
    this.updateFiltersFromRest();
    return this;
  }

  public setTremolo(tremolo: Tremolo | null): this {
    this.player.set('tremolo', tremolo);
    this.tremolo = tremolo;
    this.updateFiltersFromRest();
    return this;
  }

  public setVibrato(vibrato: Vibrato | null): this {
    this.player.set('vibrato', vibrato);
    this.vibrato = vibrato;
    this.updateFiltersFromRest();
    return this;
  }

  public setRotation(rotation: Rotation | null): this {
    this.player.set('rotation', rotation);
    this.rotation = rotation;
    this.updateFiltersFromRest();
    return this;
  }

  public setDistortion(distortion: Distortion | null): this {
    this.player.set('distortion', distortion);
    this.distortion = distortion;
    this.updateFiltersFromRest();
    return this;
  }

  public setChannelMix(channelMix: ChannelMix | null): this {
    this.player.set('channelMix', channelMix);
    this.channelMix = channelMix;
    this.updateFiltersFromRest();
    return this;
  }

  public setLowPass(lowPass: LowPass | null): this {
    this.player.set('lowPass', lowPass);
    this.lowPass = lowPass;
    this.updateFiltersFromRest();
    return this;
  }

  public setPluginFilters(pluginFilters: PluginFilters | null): this {
    this.player.set('pluginFilters', pluginFilters);
    this.pluginFilters = pluginFilters;
    this.updateFiltersFromRest();
    return this;
  }

  public resetFilters(): this {
    this.setVolume(null);
    this.setEqualizer(null);
    this.setKaraoke(null);
    this.setTimescale(null);
    this.setTremolo(null);
    this.setVibrato(null);
    this.setRotation(null);
    this.setDistortion(null);
    this.setChannelMix(null);
    this.setLowPass(null);
    this.setPluginFilters(null);
		this.updateFiltersFromRest();
    return this;
  }

  private async updateFiltersFromRest(): Promise<boolean> {
    let { volume, equalizer, karaoke, timescale, tremolo, vibrato, rotation, distortion, channelMix, lowPass, pluginFilters } = this;

    const dataToUpdate = {
      guildId: this.player.guildId,
      data: {
        filters: { 
					...(volume !== null && { volume }),
        ...(equalizer !== null && { equalizer }),
        ...(karaoke !== null && { karaoke }),
        ...(timescale !== null && { timescale }),
        ...(tremolo !== null && { tremolo }),
        ...(vibrato !== null && { vibrato }),
        ...(rotation !== null && { rotation }),
        ...(distortion !== null && { distortion }),
        ...(channelMix !== null && { channelMix }),
        ...(lowPass !== null && { lowPass }),
        ...(pluginFilters !== null && { pluginFilters }),
				}
			},
    };

    await this.rest.update(dataToUpdate);
    return true;
  }
}

export interface Equalizer {
  band: number;
  gain: number;
}

export interface Karaoke {
  level?: number;
  monoLevel?: number;
  filterBand?: number;
  filterWidth?: number;
}

export interface Timescale {
  speed?: number;
  pitch?: number;
  rate?: number;
}

export interface Tremolo {
  frequency?: number;
  depth?: number;
}

export interface Vibrato {
  frequency?: number;
  depth?: number;
}

export interface Rotation {
  rotationHz?: number;
}

export interface Distortion {
  sinOffset?: number;
  sinScale?: number;
  cosOffset?: number;
  cosScale?: number;
  tanOffset?: number;
  tanScale?: number;
  offset?: number;
  scale?: number;
}

export interface ChannelMix {
  leftToLeft?: number;
  leftToRight?: number;
  rightToLeft?: number;
  rightToRight?: number;
}

export interface LowPass {
  smoothing?: number;
}

export interface PluginFilters {
  [key: string]: any;
}
