import { Connector } from "./Connector";
import { stringifyWithReplacer } from "../Util";

export class DiscordJs extends Connector {
    private client: any;
    private readonly readyHandler = () => {
        if (!this.client || this.manager.destroyed) return;
        void this.manager.init(this.client.user.id).catch(error => this.manager.emit('debug', `NyxLink > DiscordJs > Initialization failed: ${error.message}`));
    };
    private readonly rawHandler = (packet: any) => {
        if (!this.client || this.manager.destroyed) return;
        void this.manager.packetUpdate(packet).catch(error => this.manager.emit('debug', `NyxLink > DiscordJs > Packet failed: ${error.message}`));
    };

    constructor() {
        super();
    }

    public listen(client: any): void {
        if (!client) {
            throw new Error("DiscordJs connector requires a client instance.");
        }
        this.dispose();
        this.client = client;
        this.manager.emit('debug', 'Moonlink.js > DiscordJsConnector#listen >> Attaching listeners to client...');
        this.client.once('clientReady', this.readyHandler);
        this.client.on('raw', this.rawHandler);
    }

    public dispose(): void {
        this.client?.removeListener('clientReady', this.readyHandler);
        this.client?.removeListener('raw', this.rawHandler);
        this.client = undefined;
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
