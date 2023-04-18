import { MoonlinkManager } from './MoonlinkManager';
import { MoonlinkQueue } from '../@Rest/MoonlinkQueue';
import { MoonlinkRest } from './MoonlinkRest';
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
export declare class MoonlinkPlayer {
    private sendWs;
    private manager;
    private infos;
    private map;
    payload: Function;
    guildId: string;
    textChannel: string;
    voiceChannel: string;
    autoPlay: boolean | null;
    connected: boolean | null;
    playing: boolean | null;
    paused: boolean | null;
    loop: number | null;
    volume: number;
    queue: MoonlinkQueue;
    current: any;
    rest: MoonlinkRest;
    constructor(infos: PlayerInfos, manager: MoonlinkManager, map: Map<string, any>, rest?: MoonlinkRest);
    setTextChannel(channelId: string): boolean;
    setVoiceChannel(channelId: string): boolean;
    setAutoPlay(mode: boolean): boolean;
    connect(options: connectOptions): boolean | null;
    disconnect(): boolean;
    play(): Promise<void>;
    pause(): Promise<boolean>;
    resume(): Promise<boolean>;
    stop(): Promise<boolean>;
    skip(): Promise<boolean>;
    setVolume(percent: number): Promise<number>;
    setLoop(mode: number | null): number | null;
    destroy(): Promise<boolean>;
    seek(position: number): Promise<number | null>;
    skipTo(position: number): Promise<boolean | void>;
}
export interface Track {
    readonly track?: string | null;
    readonly encoded?: string | null;
    readonly trackEncoded?: string | null;
    readonly title: string;
    readonly identifier: string;
    readonly author: string;
    readonly duration: BigInt;
    readonly position: BigInt;
    readonly isSeekable: boolean;
    readonly isStream: boolean;
    readonly url?: string | null;
    readonly requester: unknown | null;
    readonly sourceName: string | null;
    thumbnail(): string | null;
    setRequester(data: unknown): void;
}
