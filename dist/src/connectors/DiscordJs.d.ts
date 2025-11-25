import { Connector } from "./Connector";
export declare class DiscordJs extends Connector {
    private client;
    constructor();
    listen(client: any): void;
    send(guildId: string, payload: any): void;
}
