import { Player } from "../../index";
import { Equalizer, Karaoke, Timescale, Tremolo, Vibrato, Rotation, Distortion, ChannelMix, LowPass, HighPass, LowPass as LowPassDSPX, Normalization, Echo } from "../typings/Interfaces";
export declare class Filters {
    private player;
    private manager;
    private rest;
    private filters;
    constructor(player: Player);
    private setFilter;
    setVolume(volume: number | undefined): this;
    setEqualizer(equalizer: Equalizer[] | undefined): this;
    setKaraoke(karaoke: Karaoke | undefined): this;
    setTimescale(timescale: Timescale | undefined): this;
    setTremolo(tremolo: Tremolo | undefined): this;
    setVibrato(vibrato: Vibrato | undefined): this;
    setRotation(rotation: Rotation | undefined): this;
    setDistortion(distortion: Distortion | undefined): this;
    setChannelMix(channelMix: ChannelMix | undefined): this;
    setLowPass(lowPass: LowPass | undefined): this;
    setHighPass(highPass: HighPass | undefined): this;
    setLowPassDSPX(lowPassDSPX: LowPassDSPX | undefined): this;
    setNormalization(normalization: Normalization | undefined): this;
    setEcho(echo: Echo | undefined): this;
    resetFilters(): this;
    private updateFiltersFromRest;
}
