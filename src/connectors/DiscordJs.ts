import { Connector } from "./Connector";

export class DiscordJs extends Connector {
    private client: any;

    constructor() {
        super();
    }

    public listen(client: any): void {
        this.client = client;
        this.client.on("ready", () => {
            this.manager.init(this.client.user.id);
        });

        this.client.on("raw", (packet: any) => {
            this.manager.packetUpdate(packet);
        });
    }

    public send(guildId: string, payload: any): void {
        const guild = this.client.guilds.cache.get(guildId);
        if (guild) {
            guild.shard.send(payload);
        }
    }
}
