import { MoonlinkManager, MoonlinkQueue, MoonlinkRest, MoonlinkNode, MoonlinkFilters } from "../../index";
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
    filters: MoonlinkFilters;
    current: any;
    data: any;
    node: MoonlinkNode | any;
    rest: MoonlinkRest;
    constructor(infos: PlayerInfos, manager: MoonlinkManager, map: Map<string, any>);
    private updatePlayers;
    set(key: string, value: unknown): void;
    get<T>(key: string): T;
    setTextChannel(channelId: string): boolean;
    setVoiceChannel(channelId: string): boolean;
    setAutoPlay(mode: boolean): boolean;
    connect(options: connectOptions): boolean | null;
    disconnect(): boolean;
    restart(): Promise<void>;
    play(): Promise<void>;
    pause(): Promise<boolean>;
    resume(): Promise<boolean>;
    private updatePlaybackStatus;
    stop(): Promise<boolean>;
    skip(): Promise<boolean>;
    setVolume(percent: number): Promise<number>;
    setLoop(mode: number | null): number | null;
    destroy(): Promise<boolean>;
    private validateNumberParam;
    seek(position: number): Promise<number | null>;
    skipTo(position: number): Promise<boolean | void>;
    shuffle(): Promise<boolean>;
    private shuffleArray;
}
