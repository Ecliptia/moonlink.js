"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordJs = void 0;
const Connector_1 = require("./Connector");
class DiscordJs extends Connector_1.Connector {
    client;
    constructor() {
        super();
    }
    listen(client) {
        this.client = client;
        this.client.on("ready", () => {
            this.manager.init(this.client.user.id);
        });
        this.client.on("raw", (packet) => {
            this.manager.packetUpdate(packet);
        });
    }
    send(guildId, payload) {
        const guild = this.client.guilds.cache.get(guildId);
        if (guild) {
            guild.shard.send(payload);
        }
    }
}
exports.DiscordJs = DiscordJs;
//# sourceMappingURL=DiscordJs.js.map