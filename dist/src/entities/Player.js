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
    loop = "off";
    current;
    ping = 0;
    queue;
    node;
    data = {};
    listen;
    lyrics;
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
        if (manager.options.NodeLinkFeatures || this.node.info.isNodeLink) {
            this.listen = new index_1.Listen(this);
            this.lyrics = new index_1.Lyrics(this);
        }
    }
    set(key, data) {
        this.data[key] = data;
    }
    get(key) {
        return this.data[key];
    }
    setVoiceChannelId(voiceChannelId) {
        (0, index_1.validateProperty)(voiceChannelId, (value) => value !== undefined || typeof value !== "string", "Moonlink.js > Player#setVoiceChannelId - voiceChannelId not a string");
        let oldVoiceChannelId = String(this.voiceChannelId);
        this.voiceChannelId = voiceChannelId;
        this.manager.emit("playerVoiceChannelIdSet", this, oldVoiceChannelId, voiceChannelId);
        return true;
    }
    setTextChannelId(textChannelId) {
        (0, index_1.validateProperty)(textChannelId, (value) => value !== undefined || typeof value !== "string", "Moonlink.js > Player#setTextChannelId - textChannelId not a string");
        let oldTextChannelId = String(this.textChannelId);
        this.textChannelId = textChannelId;
        this.manager.emit("playerTextChannelIdSet", this, oldTextChannelId, textChannelId);
        return true;
    }
    setAutoPlay(autoPlay) {
        (0, index_1.validateProperty)(autoPlay, (value) => value !== undefined || typeof value !== "boolean", "Moonlink.js > Player#setAutoPlay - autoPlay not a boolean");
        this.autoPlay = autoPlay;
        this.manager.emit("playerAutoPlaySet", this, autoPlay);
        return true;
    }
    setAutoLeave(autoLeave) {
        (0, index_1.validateProperty)(autoLeave, (value) => value !== undefined || typeof value !== "boolean", "Moonlink.js > Player#setAutoLeave - autoLeave not a boolean");
        this.autoLeave = autoLeave;
        this.manager.emit("playerAutoLeaveSet", this, autoLeave);
        return true;
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
        this.manager.emit("playerConnected", this);
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
        this.manager.emit("playerDisconnected", this);
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
        this.playing = true;
        this.manager.emit("playerTriggeredPlay", this, this.current);
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
        this.manager.emit("playerTriggeredPause", this);
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
        this.manager.emit("playerTriggeredResume", this);
        return true;
    }
    stop(options) {
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
        options?.destroy ? this.destroy()
            : this.queue.clear();
        this.playing = false;
        this.manager.emit("playerTriggeredStop", this);
        return true;
    }
    skip(position) {
        if (!this.queue.size && !this.autoPlay)
            return false;
        (0, index_1.validateProperty)(position, (value) => value !== undefined ||
            isNaN(value) ||
            value < 0 ||
            value > this.queue.size - 1, "Moonlink.js > Player#skip - position not a number or out of range");
        let oldTrack = { ...this.current };
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
        this.manager.emit("playerTriggeredSkip", this, oldTrack, this.current, position ?? 0);
        return true;
    }
    seek(position) {
        (0, index_1.validateProperty)(position, (value) => value !== undefined ||
            isNaN(value) ||
            value < 0 ||
            value > this.current.duration, "Moonlink.js > Player#seek - position not a number or out of range");
        this.node.rest.update({
            guildId: this.guildId,
            data: {
                position: position,
            },
        });
        this.manager.emit("playerTriggeredSeek", this, position);
        return true;
    }
    shuffle() {
        if (this.queue.size < 2)
            return false;
        let oldQueue = { ...this.queue.tracks };
        this.queue.shuffle();
        this.manager.emit("playerTriggeredShuffle", this, oldQueue, this.queue.tracks);
        return true;
    }
    setVolume(volume) {
        (0, index_1.validateProperty)(volume, (value) => value !== undefined || isNaN(value) || value < 0 || value > 100, "Moonlink.js > Player#setVolume - volume not a number or out of range");
        let oldVolume = Number(this.volume);
        this.volume = volume;
        this.node.rest.update({
            guildId: this.guildId,
            data: {
                volume: this.volume,
            },
        });
        this.manager.emit("playerChangedVolume", this, oldVolume, volume);
        return true;
    }
    setLoop(loop) {
        (0, index_1.validateProperty)(loop, (value) => value !== undefined ||
            value !== "off" ||
            value !== "track" ||
            value !== "queue", "Moonlink.js > Player#setLoop - loop not a valid value");
        let oldLoop = this.loop;
        this.loop = loop;
        this.manager.emit("playerChangedLoop", this, oldLoop, loop);
        return true;
    }
    destroy() {
        if (this.connected)
            this.disconnect();
        this.queue.clear();
        this.manager.players.delete(this.guildId);
        this.manager.emit("playerDestroyed", this);
        return true;
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map