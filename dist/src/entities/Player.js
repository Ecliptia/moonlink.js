"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const index_1 = require("../../index");
class Player {
    guildId;
    voiceChannelId;
    textChannelId;
    connected;
    playing;
    volume;
    paused;
    current;
    queue;
    node;
    constructor(config) {
        this.guildId = config.guildId;
        this.voiceChannelId = config.voiceChannelId;
        this.textChannelId = config.textChannelId;
        this.connected = false;
        this.playing = false;
        this.volume = config.volume || 80;
        this.paused = false;
        this.queue = new index_1.Queue();
    }
    connect(options) {
        index_1.Structure.getManager().sendPayload({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.voiceChannelId,
                self_mute: options.setMute || false,
                self_deaf: options.setDeaf || false
            }
        });
        this.connected = true;
        return true;
    }
    disconnect() {
        index_1.Structure.getManager().sendPayload({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: null,
                self_mute: false,
                self_deaf: false
            }
        });
        this.connected = false;
        return true;
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map