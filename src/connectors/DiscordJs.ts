import { Connector } from "./Connector";
import { stringifyWithReplacer } from "../Util";

export class DiscordJs extends Connector {
    private client: any;

    constructor() {
        super();
    }

    public listen(client: any): void {
        if (!client) {
            throw new Error("DiscordJs connector requires a client instance.");
        }
        this.client = client;
        this.manager.emit("debug", `Moonlink.js > DiscordJsConnector#listen >> Attaching listeners to client...`);

        this.client.once("clientReady", () => {
            this.manager.emit("debug", `Moonlink.js > DiscordJsConnector#ready >> Client is ready, initializing manager with user ID ${this.client.user.id}`);
            this.manager.init(this.client.user.id);
        });

        this.client.on("raw", (packet: any) => {
            this.manager.packetUpdate(packet);
        });
    }

    public send(guildId: string, payload: any): void {
        this.manager.emit("debug", `Moonlink.js > DiscordJsConnector#send -> Sending payload to guild ${guildId}. Payload: ${stringifyWithReplacer(payload)}`);
        const guild = this.client.guilds.cache.get(guildId);
        if (guild) {
            guild.shard.send(payload);
            this.manager.emit("debug", `Moonlink.js > DiscordJsConnector#send >> Payload sent successfully to guild ${guildId}.`);
        } else {
            this.manager.emit("debug", `Moonlink.js > DiscordJsConnector#send >> WARN: Guild ${guildId} not found in cache, could not send payload.`);
        }
    }
}
