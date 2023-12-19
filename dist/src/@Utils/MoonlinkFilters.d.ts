import { Equalizer, Karaoke, Timescale, Tremolo, Vibrato, Rotation, Distortion, ChannelMix, LowPass } from "../@Typings";
export declare class MoonlinkFilters {
    private player;
    private manager;
    private rest;
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
    constructor(player: any);
    setVolume(volume: number | null): this;
    setEqualizer(equalizer: Equalizer[] | null): this;
    setKaraoke(karaoke: Karaoke | null): this;
    setTimescale(timescale: Timescale | null): this;
    setTremolo(tremolo: Tremolo | null): this;
    setVibrato(vibrato: Vibrato | null): this;
    setRotation(rotation: Rotation | null): this;
    setDistortion(distortion: Distortion | null): this;
    setChannelMix(channelMix: ChannelMix | null): this;
    setLowPass(lowPass: LowPass | null): this;
    resetFilters(): this;
    private updateFiltersFromRest;
}
