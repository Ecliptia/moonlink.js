import { Connector } from "./Connector";
export declare class DiscordJs extends Connector {
    private client;
    private readonly readyHandler;
    private readonly rawHandler;
    constructor();
    listen(client: any): void;
    dispose(): void;
    send(guildId: string, payload: any): void;
}
