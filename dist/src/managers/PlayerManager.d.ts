import { Manager } from "../core/Manager";
import { Player } from "../entities/Player";
import { IPlayerConfig } from "../typings/Interfaces";
export declare class PlayerManager {
    readonly manager: Manager;
    readonly players: Map<string, Player>;
    constructor(manager: Manager);
    get all(): Player[];
    create(options: IPlayerConfig): Player;
    get(guildId: string): Player | undefined;
    has(guildId: string): boolean;
    get size(): number;
    get playingPlayers(): Player[];
    get idlePlayers(): Player[];
    filter(predicate: (player: Player) => boolean): Player[];
    find(predicate: (player: Player) => boolean): Player | undefined;
    map<T>(callback: (player: Player) => T): T[];
    forEach(callback: (player: Player) => void): void;
    clear(): Promise<void>;
    destroyAll(): Promise<void>;
    destroy(guildId: string, reason?: string): Promise<boolean>;
}
