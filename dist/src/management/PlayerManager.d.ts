import { IPlayerConfig } from "../typings/Interfaces";
import { Manager, Player } from "../../index";
export declare class PlayerManager {
    readonly manager: Manager;
    cache: Map<string, Player>;
    constructor(manager: Manager);
    create(config: IPlayerConfig): Player | undefined;
    has(guildId: string): boolean;
    get(guildId: string): Player;
    delete(guildId: string): Promise<void>;
    autoJoin(options: {
        voiceChannelId: string;
        textChannelId: string;
        guildId: string;
    } & Partial<IPlayerConfig>): Promise<Player | undefined>;
    get all(): Player[];
}
export declare function isVoiceStateAttempt(player: Player): Promise<boolean>;
