import { Player } from "../../index";
import { Equalizer, Karaoke, Timescale, Tremolo, Vibrato, Rotation, Distortion, ChannelMix, LowPass } from "../typings/Interfaces";
export declare class Filters {
    private player;
    private manager;
    private rest;
    private filters;
    constructor(player: Player);
    private setFilter;
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
