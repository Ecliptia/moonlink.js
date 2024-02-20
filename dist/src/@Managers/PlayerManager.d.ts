import { MoonlinkPlayer, MoonlinkManager, createOptions } from "../../index";
export declare class PlayerManager {
    _manager: MoonlinkManager;
    cache: Record<string, MoonlinkPlayer>;
    private voices;
    constructor();
    init(): void;
    handleVoiceServerUpdate(update: any, guildId: string): void;
    handlePlayerDisconnect(guildId: string): void;
    handlePlayerMove(newChannelId: string, oldChannelId: string, guildId: string): void;
    updateVoiceStates(guildId: string, update: any): void;
    attemptConnection(guildId: string): Promise<boolean>;
    has(guildId: string): boolean;
    get(guildId: string): MoonlinkPlayer | null;
    create(data: createOptions): MoonlinkPlayer;
    get all(): Record<string, any> | null;
    backup(guildId: any): boolean;
    delete(guildId: any): void;
}
