import { Manager } from "../core/Manager";
import { Node } from "../entities/Node";
import { Player } from "../entities/Player";
import { Structure, validate, delay } from "../Util";
import { IPlayerConfig } from "../typings/Interfaces";

export class PlayerManager {
    public readonly manager: Manager;
    public readonly players: Map<string, Player> = new Map();

    constructor(manager: Manager) {
        this.manager = manager;
    }

    public get all(): Player[] {
        return [...this.players.values()];
    }

    public create(options: IPlayerConfig): Player {
        validate(options.guildId, (v) => typeof v === "string" && /^\d{17,20}$/.test(v), "IPlayerConfig#guildId must be a valid Discord Snowflake string.");
        validate(options.voiceChannelId, (v) => typeof v === "string" && /^\d{17,20}$/.test(v), "IPlayerConfig#voiceChannelId must be a valid Discord Snowflake string.");
        if (options.textChannelId) {
            validate(options.textChannelId, (v) => typeof v === "string" && /^\d{17,20}$/.test(v), "IPlayerConfig#textChannelId must be a valid Discord Snowflake string.");
        }
        if (options.volume) {
            validate(options.volume, (v) => typeof v === 'number' && v >= 0 && v <= 1000, "IPlayerConfig#volume must be a number between 0 and 1000.");
        }

        if (this.players.has(options.guildId)) {
            this.manager.emit("debug", `Moonlink.js > PlayerManager >> Player already exists for Guild: ${options.guildId}. Returning existing player.`);
            return this.players.get(options.guildId)!;
        }

        const node = this.manager.nodes.findNode();
        if (!node) {
            throw new Error("Moonlink.js > PlayerManager#create: No available nodes.");
        }

        const player = new (Structure.get("Player"))(this.manager, node, options);
        this.players.set(options.guildId, player);
        
        this.manager.emit("playerCreate", player);
        this.manager.emit("debug", `Moonlink.js > PlayerManager >> Player created. Guild: ${options.guildId}, Options: ${JSON.stringify(options)}`);
        return player;
    }

    public get(guildId: string): Player | undefined {
        return this.players.get(guildId);
    }

    public has(guildId: string): boolean {
        return this.players.has(guildId);
    }

    public get size(): number {
        return this.players.size;
    }

    public get playingPlayers(): Player[] {
        return this.all.filter(p => p.playing);
    }

    public get idlePlayers(): Player[] {
        return this.all.filter(p => !p.playing);
    }

    public filter(predicate: (player: Player) => boolean): Player[] {
        return this.all.filter(predicate);
    }

    public find(predicate: (player: Player) => boolean): Player | undefined {
        return this.all.find(predicate);
    }

    public map<T>(callback: (player: Player) => T): T[] {
        return this.all.map(callback);
    }

    public forEach(callback: (player: Player) => void): void {
        this.all.forEach(callback);
    }

    public async clear(): Promise<void> {
        if (this.players.size === 0) return;
        await Promise.all([...this.all].map(p => p.destroy("clear")));
    }

    public async destroyAll(): Promise<void> {
        await this.clear();
    }

    public async destroy(guildId: string, reason?: string): Promise<boolean> {
        const player = this.get(guildId);
        if (!player) {
            return false;
        }
        await player.destroy(reason);
        return true;
    }

    }