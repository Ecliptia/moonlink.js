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
    pluginFilters: PluginFilters | null;
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
    setPluginFilters(pluginFilters: PluginFilters | null): this;
    resetFilters(): this;
    private updateFiltersFromRest;
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
