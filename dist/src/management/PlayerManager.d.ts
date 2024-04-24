import { IPlayerConfig } from "../typings/Interfaces";
import { Player } from "../../index";
export declare class PlayerManager {
    cache: Map<string, Player>;
    constructor();
    create(config: IPlayerConfig): Player;
    has(guildId: string): boolean;
    get(guildId: string): Player;
    remove(guildId: string): void;
}
