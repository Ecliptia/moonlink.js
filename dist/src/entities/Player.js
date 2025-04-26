"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const index_1 = require("../../index");
class Player {
    manager;
    guildId;
    voiceChannelId;
    textChannelId;
    region;
    voiceState = {};
    autoPlay;
    autoLeave;
    connected;
    playing;
    destroyed = false;
    paused;
    volume = 80;
    loop = "off";
    current;
    previous;
    ping = 0;
    queue;
    node;
    data = {};
    filters;
    listen;
    lyrics;
    constructor(manager, config) {
        this.manager = manager;
        this.guildId = config.guildId;
        this.voiceChannelId = config.voiceChannelId;
        this.textChannelId = config.textChannelId;
        this.connected = false;
        this.playing = false;
        this.paused = false;
        this.previous = manager.options.previousInArray ? [] : null;
        this.volume = config.volume || 80;
        this.loop = config.loop || "off";
        this.autoPlay = config.autoPlay || false;
        this.autoLeave = config.autoLeave || false;
        this.queue = new (index_1.Structure.get("Queue"))(this);
        this.node = this.manager.nodes.get(config.node);
        this.filters = new (index_1.Structure.get("Filters"))(this);
        if (manager.options.NodeLinkFeatures || this.node.info.isNodeLink) {
            this.listen = new (index_1.Structure.get("Listen"))(this);
            this.lyrics = new (index_1.Structure.get("Lyrics"))(this);
        }
        this.updateData(undefined, config);
    }
    set(key, data) {
        this.data[key] = data;
    }
    get(key) {
        return this.data[key];
    }
    has(key) {
        return this.data[key] !== undefined;
    }
    delete(key) {
        if (!this.data[key])
            return false;
        delete this.data[key];
        return true;
    }
    setVoiceChannelId(voiceChannelId) {
        (0, index_1.validateProperty)(voiceChannelId, value => value !== undefined || typeof value !== "string", "Moonlink.js > Player#setVoiceChannelId - voiceChannelId not a string");
        let oldVoiceChannelId = String(this.voiceChannelId);
        this.voiceChannelId = voiceChannelId;
        this.manager.emit("playerVoiceChannelIdSet", this, oldVoiceChannelId, voiceChannelId);
        return true;
    }
    setTextChannelId(textChannelId) {
        (0, index_1.validateProperty)(textChannelId, value => value !== undefined || typeof value !== "string", "Moonlink.js > Player#setTextChannelId - textChannelId not a string");
        let oldTextChannelId = String(this.textChannelId);
        this.textChannelId = textChannelId;
        this.manager.emit("playerTextChannelIdSet", this, oldTextChannelId, textChannelId);
        return true;
    }
    setAutoPlay(autoPlay) {
        (0, index_1.validateProperty)(autoPlay, value => value !== undefined || typeof value !== "boolean", "Moonlink.js > Player#setAutoPlay - autoPlay not a boolean");
        this.autoPlay = autoPlay;
        this.manager.emit("playerAutoPlaySet", this, autoPlay);
        this.updateData("autoPlay", autoPlay);
        return true;
    }
    setAutoLeave(autoLeave) {
        (0, index_1.validateProperty)(autoLeave, value => value !== undefined || typeof value !== "boolean", "Moonlink.js > Player#setAutoLeave - autoLeave not a boolean");
        this.autoLeave = autoLeave;
        this.manager.emit("playerAutoLeaveSet", this, autoLeave);
        this.updateData("autoLeave", autoLeave);
        return true;
    }
    connect(options) {
        this.voiceState.attempt = false;
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
    async play(options = {}) {
        if (!options.encoded && !this.queue.size)
            return false;
        await (0, index_1.isVoiceStateAttempt)(this);
        if (options.encoded) {
            let decodedTrack = (0, index_1.decodeTrack)(options.encoded);
            this.current = new index_1.Track(decodedTrack, options.requestedBy ?? undefined);
        }
        else {
            this.current = this.queue.shift();
        }
        if (typeof options.requestedBy == "string" ||
            typeof this.current?.requestedBy == "string") {
            this.current.setRequester({
                id: options.requestedBy ?? this.current?.requestedBy,
            });
        }
        this.updateData("current", {
            encoded: this.current.encoded,
            position: 0,
            requestedBy: this.current.requestedBy,
        });
        this.node.rest.update({
            guildId: this.guildId,
            data: {
                track: {
                    encoded: this.current.encoded,
                    userData: options.requestedBy ?? this.current?.requestedBy ?? undefined,
                },
                position: options.position ?? (this.loop !== "off" ? 0 : undefined),
                endTime: options.endTime ?? undefined,
                volume: this.volume,
            },
        });
        this.playing = true;
        this.manager.emit("playerTriggeredPlay", this, this.current);
        return true;
    }
    replay() {
        this.play({
            encoded: this.current.encoded,
            requestedBy: this.current.requestedBy,
            position: 0,
        });
        return true;
    }
    async restart() {
        if (!this.current && this.queue.size)
            return false;
        await this.connect({ setMute: false, setDeaf: false });
        if (this.current)
            this.play({
                encoded: this.current.encoded,
                requestedBy: this.current.requestedBy,
                position: this.current.position,
            });
        else
            this.play();
        return true;
    }
    async transferNode(node) {
        (0, index_1.validateProperty)(node, value => value !== undefined || value instanceof index_1.Node || typeof value === "string", "Moonlink.js > Player#switch - node not a valid node");
        if (typeof node === "string")
            node = this.manager.nodes.get(node);
        if (!node)
            return false;
        if (this.current || this.queue.size) {
            this.restart();
        }
        else {
            this.connect({ setMute: false, setDeaf: false });
        }
        let oldNode = this.node.uuid;
        this.node = node;
        this.manager.emit("playerSwitchedNode", this, this.manager.nodes.get(oldNode), node);
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
        this.manager.database.set(`players.${this.guildId}.paused`, true);
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
        this.updateData("paused", false);
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
        options?.destroy ? this.destroy() : this.queue.clear();
        this.playing = false;
        this.manager.emit("playerTriggeredStop", this);
        return true;
    }
    async skip(position) {
        if (!this.queue.size && this.autoPlay) {
            await this.node.rest.update({
                guildId: this.guildId,
                data: {
                    track: {
                        encoded: null,
                    },
                },
            });
        }
        else if (!this.queue.size)
            return false;
        (0, index_1.validateProperty)(position, value => value !== undefined || isNaN(value) || value < 0 || value > this.queue.size - 1, "Moonlink.js > Player#skip - position not a number or out of range");
        let oldTrack = { ...this.current };
        if (position) {
            this.current = this.queue.get(position);
            this.queue.remove(position);
            this.updateData("current", {
                encoded: this.current.encoded,
                position: 0,
                requestedBy: this.current.requestedBy,
            });
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
        (0, index_1.validateProperty)(position, value => value !== undefined || isNaN(value) || value < 0 || value > this.current.duration, "Moonlink.js > Player#seek - position not a number or out of range");
        this.node.rest.update({
            guildId: this.guildId,
            data: {
                position: position,
            },
        });
        this.manager.emit("playerTriggeredSeek", this, position);
        this.updateData("current.position", position);
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
        (0, index_1.validateProperty)(volume, value => value !== undefined || isNaN(value) || value < 0 || value > 100, "Moonlink.js > Player#setVolume - volume not a number or out of range");
        let oldVolume = Number(this.volume);
        this.volume = volume;
        this.node.rest.update({
            guildId: this.guildId,
            data: {
                volume: this.volume,
            },
        });
        this.manager.emit("playerChangedVolume", this, oldVolume, volume);
        this.updateData("volume", volume);
        return true;
    }
    setLoop(loop) {
        (0, index_1.validateProperty)(loop, (value) => value !== undefined || value !== "off" || value !== "track" || value !== "queue", "Moonlink.js > Player#setLoop - loop not a valid value");
        let oldLoop = this.loop;
        this.loop = loop;
        this.manager.emit("playerChangedLoop", this, oldLoop, loop);
        this.updateData("loop", loop);
        return true;
    }
    destroy(reason) {
        if (this.connected)
            this.disconnect();
        if (this.destroyed)
            return true;
        else
            this.destroyed = true;
        this.queue.clear();
        this.manager.players.delete(this.guildId);
        this.manager.emit("playerDestroyed", this, reason);
        return true;
    }
    updateData(path, data) {
        path ? this.manager.database.set(`players.${this.guildId}.${path}`, data) : this.manager.database.set(`players.${this.guildId}`, data);
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map