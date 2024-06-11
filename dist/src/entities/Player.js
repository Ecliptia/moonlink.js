"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const index_1 = require("../../index");
class Player {
    manager;
    guildId;
    voiceChannelId;
    textChannelId;
    voiceState = {};
    autoPlay;
    autoLeave;
    connected;
    playing;
    paused;
    volume = 80;
    loop;
    current;
    ping = 0;
    queue;
    node;
    data = {};
    constructor(manager, config) {
        this.manager = manager;
        this.guildId = config.guildId;
        this.voiceChannelId = config.voiceChannelId;
        this.textChannelId = config.textChannelId;
        this.connected = false;
        this.playing = false;
        this.volume = config.volume || 80;
        this.loop = config.loop || "off";
        this.autoPlay = config.autoPlay || false;
        this.autoLeave = config.autoLeave || false;
        this.paused = false;
        this.queue = new index_1.Queue();
        this.node = this.manager.nodes.get(config.node);
    }
    set(key, data) {
        this.data[key] = data;
    }
    get(key) {
        return this.data[key];
    }
    connect(options) {
        this.manager.sendPayload(this.guildId, JSON.stringify({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.voiceChannelId,
                self_mute: options?.setMute || false,
                self_deaf: options?.setDeaf || false,
            },
        }));
        this.connected = true;
        return true;
    }
    disconnect() {
        this.manager.sendPayload(this.guildId, JSON.stringify({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: null,
                self_mute: false,
                self_deaf: false,
            },
        }));
        this.connected = false;
        return true;
    }
    play() {
        if (!this.queue.size)
            return false;
        this.current = this.queue.shift();
        this.node.rest.update({
            guildId: this.guildId,
            data: {
                track: {
                    encoded: this.current.encoded,
                },
                volume: this.volume,
            },
        });
        return true;
    }
    pause() {
        if (this.paused)
            return true;
        this.node.rest.update({
            guildId: this.guildId,
            data: {
                paused: true,
            },
        });
        this.paused = true;
        return true;
    }
    resume() {
        if (!this.paused)
            return true;
        this.node.rest.update({
            guildId: this.guildId,
            data: {
                paused: false,
            },
        });
        this.paused = false;
        return true;
    }
    stop() {
        if (!this.playing)
            return false;
        this.node.rest.update({
            guildId: this.guildId,
            data: {
                track: {
                    encoded: null,
                },
            },
        });
        this.playing = false;
        return true;
    }
    skip(position) {
        if (!this.queue.size)
            return false;
        (0, index_1.validateProperty)(position, (value) => value !== undefined ||
            isNaN(value) ||
            value < 0 ||
            value > this.queue.size - 1, "Moonlink.js > Player#skip - position not a number or out of range");
        if (position) {
            this.current = this.queue.get(position);
            this.queue.remove(position);
            this.node.rest.update({
                guildId: this.guildId,
                data: {
                    track: {
                        encoded: this.current.encoded,
                    },
                },
            });
        }
        else
            this.play();
        return true;
    }
    setVolume(volume) {
        (0, index_1.validateProperty)(volume, (value) => value !== undefined || isNaN(value) || value < 0 || value > 100, "Moonlink.js > Player#setVolume - volume not a number or out of range");
        this.volume = volume;
        this.node.rest.update({
            guildId: this.guildId,
            data: {
                volume: this.volume,
            },
        });
        return true;
    }
    setLoop(loop) {
        (0, index_1.validateProperty)(loop, (value) => value !== undefined ||
            value !== "off" ||
            value !== "track" ||
            value !== "queue", "Moonlink.js > Player#setLoop - loop not a valid value");
        this.loop = loop;
        return true;
    }
    setAutoPlay(autoPlay) {
        (0, index_1.validateProperty)(autoPlay, (value) => value !== undefined || typeof value !== "boolean", "Moonlink.js > Player#setAutoPlay - autoPlay not a boolean");
        this.autoPlay = autoPlay;
        return true;
    }
    setAutoLeave(autoLeave) {
        (0, index_1.validateProperty)(autoLeave, (value) => value !== undefined || typeof value !== "boolean", "Moonlink.js > Player#setAutoLeave - autoLeave not a boolean");
        this.autoLeave = autoLeave;
        return true;
    }
    destroy() {
        this.manager.players.delete(this.guildId);
        return true;
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map