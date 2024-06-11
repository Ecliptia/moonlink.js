import { IPlayerConfig } from "../typings/Interfaces";
import { Manager, Player } from "../../index";
export declare class PlayerManager {
    readonly manager: Manager;
    cache: Map<string, Player>;
    constructor(manager: Manager);
    create(config: IPlayerConfig): Player;
    has(guildId: string): boolean;
    get(guildId: string): Player;
    delete(guildId: string): Promise<void>;
}
