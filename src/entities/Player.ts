import { IPlayerConfig } from '../typings/Interfaces';
import { Structure, Node, Queue, Track } from '../../index';
export class Player {
    public guildId: string;
    public voiceChannelId: string;
    public textChannelId: string;
    public connected: boolean;
    public playing: boolean;
    public volume: number;
    public paused: boolean;
    public current: Track;
    public queue: Queue;
    public node: Node;
    public data: Record<string, unknown> = {};
    constructor(config: IPlayerConfig) {
        this.guildId = config.guildId;
        this.voiceChannelId = config.voiceChannelId;
        this.textChannelId = config.textChannelId;
        this.connected = false;
        this.playing = false;
        this.volume = config.volume || 80;
        this.paused = false;
        this.queue = new Queue();
    }
    public set(key: string, data: unknown): void {
        this.data[key] = data;
    }
    public get<T>(key: string): T {
        return this.data[key] as T;
    }
    public connect(options: { setMute?: boolean, setDeaf?: boolean }): boolean {
        Structure.getManager().sendPayload({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.voiceChannelId,
                self_mute: options.setMute || false,
                self_deaf: options.setDeaf || false
            }
        })

        this.connected = true;
        return true;
    }
    public disconnect(): boolean {
        Structure.getManager().sendPayload({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: null,
                self_mute: false,
                self_deaf: false
            }
        })

        this.connected = false;
        return true;
    }
    
}