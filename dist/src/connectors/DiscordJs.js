"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordJs = void 0;
const Connector_1 = require("./Connector");
const Util_1 = require("../Util");
class DiscordJs extends Connector_1.Connector {
    client;
    constructor() {
        super();
    }
    listen(client) {
        if (!client) {
            throw new Error("DiscordJs connector requires a client instance.");
        }
        this.client = client;
        this.manager.emit("debug", `Moonlink.js > DiscordJsConnector#listen >> Attaching listeners to client...`);
        this.client.once("clientReady", () => {
            this.manager.emit("debug", `Moonlink.js > DiscordJsConnector#ready >> Client is ready, initializing manager with user ID ${this.client.user.id}`);
            this.manager.init(this.client.user.id);
        });
        this.client.on("raw", (packet) => {
            this.manager.packetUpdate(packet);
        });
    }
    send(guildId, payload) {
        this.manager.emit("debug", `Moonlink.js > DiscordJsConnector#send -> Sending payload to guild ${guildId}. Payload: ${(0, Util_1.stringifyWithReplacer)(payload)}`);
        const guild = this.client.guilds.cache.get(guildId);
        if (guild) {
            guild.shard.send(payload);
            this.manager.emit("debug", `Moonlink.js > DiscordJsConnector#send >> Payload sent successfully to guild ${guildId}.`);
        }
        else {
            this.manager.emit("debug", `Moonlink.js > DiscordJsConnector#send >> WARN: Guild ${guildId} not found in cache, could not send payload.`);
        }
    }
}
exports.DiscordJs = DiscordJs;
//# sourceMappingURL=DiscordJs.js.map