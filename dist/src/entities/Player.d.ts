import { IPlayerConfig, IVoiceState } from "../typings/Interfaces";
import { TPlayerLoop } from "../typings/types";
import { Lyrics, Listen, Manager, Node, Queue, Track } from "../../index";
export declare class Player {
    readonly manager: Manager;
    guildId: string;
    voiceChannelId: string;
    textChannelId: string;
    voiceState: IVoiceState;
    autoPlay: boolean;
    autoLeave: boolean;
    connected: boolean;
    playing: boolean;
    paused: boolean;
    volume: number;
    loop: TPlayerLoop;
    current: Track;
    previous: Track | Track[];
    ping: number;
    queue: Queue;
    node: Node;
    data: Record<string, unknown>;
    listen: Listen;
    lyrics: Lyrics;
    constructor(manager: Manager, config: IPlayerConfig);
    set(key: string, data: unknown): void;
    get<T>(key: string): T;
    setVoiceChannelId(voiceChannelId: string): boolean;
    setTextChannelId(textChannelId: string): boolean;
    setAutoPlay(autoPlay: boolean): boolean;
    setAutoLeave(autoLeave: boolean): boolean;
    connect(options: {
        setMute?: boolean;
        setDeaf?: boolean;
    }): boolean;
    disconnect(): boolean;
    play(): boolean;
    pause(): boolean;
    resume(): boolean;
    stop(options?: {
        destroy?: boolean;
    }): boolean;
    skip(position?: number): Promise<boolean>;
    seek(position: number): boolean;
    shuffle(): boolean;
    setVolume(volume: number): boolean;
    setLoop(loop: TPlayerLoop): boolean;
    destroy(): boolean;
}
