import { IPlayerConfig } from '../typings/Interfaces';
import { Node, Queue, Track } from '../../index';
export declare class Player {
    guildId: string;
    voiceChannelId: string;
    textChannelId: string;
    connected: boolean;
    playing: boolean;
    volume: number;
    paused: boolean;
    current: Track;
    queue: Queue;
    node: Node;
    data: Record<string, unknown>;
    constructor(config: IPlayerConfig);
    set(key: string, data: unknown): void;
    get<T>(key: string): T;
    connect(options: {
        setMute?: boolean;
        setDeaf?: boolean;
    }): boolean;
    disconnect(): boolean;
}
