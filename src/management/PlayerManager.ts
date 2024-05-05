import { IPlayerConfig } from "../typings/Interfaces";
import { Player, Structure, validateProperty } from "../../index";
export class PlayerManager {
    public cache: Map<string, Player> = new Map();
    constructor() {}
    public create(config: IPlayerConfig): Player {
        validateProperty(config.guildId, (value) => value !== undefined || value !== "string", '(Moonlink.js) - Player > GuildId is required');
        validateProperty(config.voiceChannelId, (value) => value !== undefined || value == "string", '(Moonlink.js) - Player > VoiceChannelId is required');
        validateProperty(config.textChannelId, (value) => value !== undefined || value == "string", '(Moonlink.js) - Player > TextChannelId is required');
        validateProperty(config.volume, (value) => value === undefined || (value >= 0), '(Moonlink.js) - Player > Invalid volume value. Volume must be a number between 0.');
 
        const player: Player = new (Structure.get("Player"))(config);
        this.cache.set(config.guildId, player);
        return player;
    }
    public has(guildId: string): boolean {
        return this.cache.has(guildId);
    }
    public get(guildId: string): Player {
        return this.cache.get(guildId);
    }
    public remove(guildId: string): void {
        this.cache.delete(guildId);
    }
}