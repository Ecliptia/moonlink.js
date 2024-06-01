"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkPlayer = void 0;
const node_events_1 = require("node:events");
const index_1 = require("../../index");
const ws_1 = __importDefault(require("ws"));
class MoonlinkPlayer {
    manager = index_1.Structure.manager;
    guildId;
    textChannel;
    voiceChannel;
    voiceRegion;
    autoPlay;
    autoLeave;
    connected;
    playing;
    paused;
    loop;
    volume;
    ping;
    queue;
    filters;
    current;
    previous;
    data;
    node;
    voiceReceiverWs;
    constructor(data) {
        this.guildId = data.guildId;
        this.textChannel = data.textChannel;
        this.voiceChannel = data.voiceChannel;
        this.voiceRegion = data.voiceRegion;
        this.autoPlay = data.autoPlay;
        this.autoLeave = data.autoLeave || false;
        this.connected = data.connected || false;
        this.playing = data.playing || false;
        this.paused = data.paused || false;
        this.loop = data.loop || 0;
        this.volume = data.volume || 80;
        this.ping = data.ping || 0;
        this.queue = new (index_1.Structure.get("MoonlinkQueue"))(this.manager, this.guildId);
        this.current = null;
        this.previous = [];
        this.data = {};
        this.node = this.manager.nodes.get(data.node);
        this.filters = new (index_1.Structure.get("MoonlinkFilters"))(this);
        this.voiceReceiverWs = null;
        if (!data.notBackup && this.manager.options.resume)
            this.manager.players.backup(this);
    }
    set(key, value) {
        this.data[key] = value;
    }
    get(key) {
        return this.data[key] || null;
    }
    setTextChannel(channelId) {
        if (!channelId) {
            throw new Error('@Moonlink(Player) - "channelId" option is empty');
        }
        if (typeof channelId !== "string") {
            throw new Error('@Moonlink(Player) - option "channelId" is different from a string');
        }
        this.manager.emit("playerSetTextChannel", this, this.textChannel, channelId);
        this.textChannel = channelId;
        if (this.manager.options.resume)
            this.manager.players.backup(this);
        return true;
    }
    setVoiceChannel(channelId) {
        if (!channelId) {
            throw new Error('@Moonlink(Player) - "channelId" option is empty');
        }
        if (typeof channelId !== "string") {
            throw new Error('@Moonlink(Player) - option "channelId" is different from a string');
        }
        this.manager.emit("playerSetVoiceChannel", this, this.voiceChannel, channelId);
        this.voiceChannel = channelId;
        if (this.manager.options.resume)
            this.manager.players.backup(this);
        return true;
    }
    setAutoLeave(mode) {
        if (typeof mode !== "boolean") {
            throw new Error('@Moonlink(Player) - "mode" option is empty or different from a boolean');
        }
        mode ? mode : (mode = !this.autoLeave);
        this.autoLeave = mode;
        this.manager.emit("playerAutoLeaveTriggered", this, mode);
        if (this.manager.options.resume)
            this.manager.players.backup(this);
        return mode;
    }
    setAutoPlay(mode) {
        if (typeof mode !== "boolean") {
            throw new Error('@Moonlink(Player) - "mode" option is empty or different from a boolean');
        }
        this.autoPlay = mode;
        this.manager.emit("playerAutoPlayTriggered", this, mode);
        if (this.manager.options.resume)
            this.manager.players.backup(this);
        return mode;
    }
    connect(options) {
        options = options || { setDeaf: false, setMute: false };
        const { setDeaf, setMute } = options;
        this.manager._SPayload(this.guildId, JSON.stringify({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.voiceChannel,
                self_mute: setMute,
                self_deaf: setDeaf
            }
        }));
        this.connected = true;
        this.manager.emit("playerConnected", this);
        return true;
    }
    disconnect() {
        this.manager._SPayload(this.guildId, JSON.stringify({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: null,
                self_mute: false,
                self_deaf: false
            }
        }));
        this.connected = false;
        this.voiceChannel = null;
        return true;
    }
    async restart() {
        this.connect({
            setDeaf: true,
            setMute: false
        });
        await this.manager.players.attemptConnection(this.guildId);
        if (!this.current && this.queue.size) {
            this.play();
            return;
        }
        else {
            await this.node.rest.update({
                guildId: this.guildId,
                data: {
                    track: {
                        encoded: this.current.encoded
                    },
                    position: this.current.position,
                    volume: this.volume
                }
            });
        }
        this.manager.emit("playerRestarted", this);
        if (this.manager.options.resume)
            this.manager.players.backup(this);
    }
    async play(track) {
        if (!track && !this.queue.size)
            return false;
        let data = track
            ? track
            : this.queue.shift();
        if (!data)
            return false;
        if (this.loop && Object.keys(this.current).length != 0) {
            this.current.time ? (this.current.time = 0) : false;
            this.ping = undefined;
            this.queue.push(this.current);
        }
        if (typeof data == "string") {
            try {
                let resolveTrack = await this.node.rest.decodeTrack(data);
                data = new (index_1.Structure.get("MoonlinkTrack"))(resolveTrack, null);
            }
            catch (err) {
                this.manager.emit("debug", "@Moonlink(Player) - Fails when trying to decode a track " +
                    data +
                    ", error: " +
                    err);
                return;
            }
        }
        this.current = data;
        await this.node.rest.update({
            guildId: this.guildId,
            data: {
                track: {
                    encoded: data.encoded
                },
                volume: this.volume
            }
        });
        if (this.manager.options.resume)
            this.manager.players.backup(this);
        return true;
    }
    async pause() {
        if (this.paused)
            return true;
        await this.updatePlaybackStatus(true);
        this.manager.emit("playerPaused", this);
        if (this.manager.options.resume)
            this.manager.players.backup(this);
        return true;
    }
    async resume() {
        if (this.playing)
            return true;
        await this.updatePlaybackStatus(false);
        this.manager.emit("playerResume", this);
        if (this.manager.options.resume)
            this.manager.players.backup(this);
        return true;
    }
    async updatePlaybackStatus(paused) {
        await this.node.rest.update({
            guildId: this.guildId,
            data: { paused }
        });
        this.paused = paused;
        this.playing = !paused;
    }
    async stop(destroy) {
        if (!this.queue.size) {
            await this.node.rest.update({
                guildId: this.guildId,
                data: {
                    track: { encoded: null }
                }
            });
            if (this.manager.options.resume)
                this.manager.players.backup(this);
        }
        this.manager.emit("playerStopped", this, this.current);
        this.manager.options?.destroyPlayersStopped && destroy
            ? this.destroy()
            : this.queue.clear();
        if (this.manager.options.resume)
            this.manager.players.backup(this);
        return true;
    }
    async skip(position) {
        if (position) {
            this.validateNumberParam(position, "position");
            let queue = this.queue.all;
            if (!queue[position - 1]) {
                throw new Error(`@Moonlink(Player) - the indicated position does not exist, make security in your code to avoid errors`);
            }
            let data = queue.splice(position - 1, 1)[0];
            this.manager.emit("playerSkipped", this, this.current, data);
            this.current = data;
            this.queue.setQueue(queue);
            await this.play(data);
            return true;
        }
        if (this.queue.size) {
            this.manager.emit("playerSkipped", this, this.current, this.queue.all[0]);
            this.play();
            return false;
        }
        else {
            this.stop();
            if (this.manager.options.resume)
                this.manager.players.backup(this);
            return true;
        }
    }
    async setVolume(percent) {
        if (typeof percent == "undefined" || isNaN(percent)) {
            throw new Error('@Moonlink(Player) - option "percent" is empty or different from a number');
        }
        if (!this.playing) {
            throw new Error("@Moonlink(Player) - cannot change volume while the player is not playing");
        }
        await this.node.rest.update({
            guildId: this.guildId,
            data: { volume: percent }
        });
        this.manager.emit("playerVolumeChanged", this, this.volume, percent);
        this.volume = percent;
        if (this.manager.options.resume)
            this.manager.players.backup(this);
        return percent;
    }
    setLoop(mode) {
        if (typeof mode == "string" &&
            ["off", "track", "queue"].includes(mode)) {
            mode == "track"
                ? (mode = 1)
                : mode == "queue"
                    ? (mode = 2)
                    : (mode = 0);
        }
        if (typeof mode !== "number" ||
            (mode !== null && (mode < 0 || mode > 2))) {
            throw new Error('@Moonlink(Player) - the option "mode" is different from a number and string or the option does not exist');
        }
        this.manager.emit("playerLoopSet", this, this.loop, mode);
        this.loop = mode;
        if (this.manager.options.resume)
            this.manager.players.backup(this);
        return mode;
    }
    async destroy() {
        if (this.connected)
            this.disconnect();
        await this.node.rest.destroy(this.guildId);
        this.queue.clear();
        this.manager.players.delete(this.guildId);
        this.manager.emit("debug", "@Moonlink(Player) - Destroyed player " + this.guildId);
        this.manager.emit("playerDestroyed", this.guildId);
        if (this.manager.options.resume)
            this.manager.players.backup(this);
        return true;
    }
    validateNumberParam(param, paramName) {
        if (typeof param !== "number") {
            throw new Error(`@Moonlink(Player) - option "${paramName}" is empty or different from a number`);
        }
    }
    async seek(position) {
        this.validateNumberParam(position, "position");
        if (position >= this.current.duration) {
            throw new Error(`@Moonlink(Player) - parameter "position" is greater than the duration of the current track`);
        }
        if (!this.current.isSeekable && this.current.isStream) {
            throw new Error(`@Moonlink(Player) - seek function cannot be applied on live video or cannot be applied in "isSeekable"`);
        }
        this.manager.emit("playerSeeking", this, this.current.position, position);
        await this.node.rest.update({
            guildId: this.guildId,
            data: { position }
        });
        if (this.manager.options.resume)
            this.manager.players.backup(this);
        return position;
    }
    shuffle() {
        if (!this.queue.size) {
            throw new Error("@Moonlink(Player)the one that is empty so that the shuffle can be performed");
        }
        let oldQueue = Array.from(this.queue.all);
        let shuffleStatus = this.queue.shuffle();
        this.manager.emit("playerShuffled", this, oldQueue, this.queue.all, shuffleStatus);
        if (this.manager.options.resume)
            this.manager.players.backup(this);
        return shuffleStatus;
    }
    async transferNode(node) {
        typeof node == "string" ? (node = this.manager.nodes.get(node)) : null;
        if (!node)
            return false;
        this.node = node;
        if (this.current || this.queue.size) {
            await this.restart();
            return true;
        }
        else {
            await this.manager.players.attemptConnection(this.guildId);
            return true;
        }
    }
    listenVoice() {
        if (!this.node.info.isNodeLink)
            return false;
        this.voiceReceiverWs = new ws_1.default(`ws${this.node.secure ? "s" : ""}://${this.node.address}/connection/data`, {
            headers: {
                Authorization: this.node.password,
                "Client-Name": `Moonlink/${this.manager.version}`,
                "guild-id": this.guildId,
                "user-id": this.manager.clientId
            }
        });
        const listener = new node_events_1.EventEmitter();
        this.voiceReceiverWs.on("message", (data) => {
            const payload = JSON.parse(data);
            switch (payload?.type) {
                case "startSpeakingEvent": {
                    listener.emit("start", {
                        ...payload.data
                    });
                    break;
                }
                case "endSpeakingEvent": {
                    payload.data.data = Buffer.from(payload.data.data, "base64");
                    listener.emit("end", {
                        ...payload.data
                    });
                    break;
                }
                default: {
                    listener.emit("unknown", {
                        ...payload
                    });
                }
            }
        });
        this.voiceReceiverWs.on("close", () => {
            listener.emit("close");
        });
        this.voiceReceiverWs.on("error", error => {
            listener.emit("error", error);
        });
        return listener;
    }
    stopListeningVoice() {
        if (!this.voiceReceiverWs)
            return;
        this.voiceReceiverWs.close();
        this.voiceReceiverWs = null;
    }
}
exports.MoonlinkPlayer = MoonlinkPlayer;
