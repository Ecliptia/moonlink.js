"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkPlayer = void 0;
const index_1 = require("../../index");
class MoonlinkPlayer {
    manager;
    infos;
    map;
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
    shuffled;
    ping;
    queue;
    current;
    previous;
    data;
    node;
    rest;
    constructor(infos, manager, map) {
        this.guildId = infos.guildId;
        this.textChannel = infos.textChannel;
        this.voiceChannel = infos.voiceChannel;
        this.voiceRegion = infos.voiceRegion;
        this.autoPlay = infos.autoPlay;
        this.autoLeave = infos.autoLeave || false;
        this.connected = infos.connected || null;
        this.playing = infos.playing || null;
        this.paused = infos.paused || null;
        this.loop = infos.loop || null;
        this.volume = infos.volume || 90;
        this.shuffled = infos.shuffled || false;
        this.ping = infos.ping || 0;
        this.queue = new (index_1.Structure.get("MoonlinkQueue"))(manager, this);
        this.current = map.get("current") || {};
        this.current = this.current[this.guildId];
        this.previous = map.get("previous") || {};
        this.previous = this.previous[this.guildId];
        this.map = map;
        this.data = this.map.get("players") || {};
        this.data = this.data[this.guildId];
        this.node = manager.nodes.get(this.get("node"));
        this.rest = this.node.rest;
        this.manager = manager;
        const existingData = this.queue.db.get(`players.${this.guildId}`) ||
            {};
        if (this.voiceChannel &&
            this.voiceChannel !==
                (existingData.voiceChannel && existingData.voiceChannel)) {
            existingData.voiceChannel = this.voiceChannel;
        }
        if (this.textChannel &&
            this.textChannel !==
                (existingData.textChannel && existingData.textChannel)) {
            existingData.textChannel = this.textChannel;
        }
        if (existingData !==
            (this.queue.db.get(`players.${this.guildId}`) || {})) {
            this.queue.db.set(`players.${this.guildId}`, existingData);
        }
    }
    updatePlayers() {
        let players = this.map.get("players") || {};
        players[this.guildId] = this.data;
        this.map.set("players", players);
    }
    set(key, value) {
        this.data[key] = value;
        this.updatePlayers();
    }
    get(key) {
        this.updatePlayers();
        return this.data[key] || null;
    }
    setTextChannel(channelId) {
        if (!channelId) {
            throw new Error('@Moonlink(Player) - "channelId" option is empty');
        }
        if (typeof channelId !== "string") {
            throw new Error('@Moonlink(Player) - option "channelId" is different from a string');
        }
        this.set("textChannel", channelId);
        this.textChannel = channelId;
        return true;
    }
    setVoiceChannel(channelId) {
        if (!channelId) {
            throw new Error('@Moonlink(Player) - "channelId" option is empty');
        }
        if (typeof channelId !== "string") {
            throw new Error('@Moonlink(Player) - option "channelId" is different from a string');
        }
        this.set("voiceChannel", channelId);
        this.voiceChannel = channelId;
        return true;
    }
    setAutoLeave(mode) {
        if (typeof mode !== "boolean") {
            throw new Error('@Moonlink(Player) - "mode" option is empty or different from a boolean');
        }
        mode ? mode : (mode = !this.autoLeave);
        this.set("autoLeave", mode);
        this.autoLeave = mode;
        return mode;
    }
    setAutoPlay(mode) {
        if (typeof mode !== "boolean") {
            throw new Error('@Moonlink(Player) - "mode" option is empty or different from a boolean');
        }
        this.set("autoPlay", mode);
        this.autoPlay = mode;
        return mode;
    }
    connect(options) {
        options = options || { setDeaf: false, setMute: false };
        const { setDeaf, setMute } = options;
        this.set("connected", true);
        this.manager._SPayload(this.guildId, JSON.stringify({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.voiceChannel,
                self_mute: setMute,
                self_deaf: setDeaf
            }
        }));
        return true;
    }
    disconnect() {
        this.set("connected", false);
        this.set("voiceChannel", null);
        this.manager._SPayload(this.guildId, JSON.stringify({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: null,
                self_mute: false,
                self_deaf: false
            }
        }));
        return true;
    }
    async restart() {
        if (!this.current || !this.queue.size)
            return;
        await this.connect({
            setDeaf: true,
            setMute: false
        });
        await this.manager.players.attemptConnection(this.guildId);
        if (!this.current && this.queue.size) {
            this.play();
            return;
        }
        await this.rest.update({
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
    async play(track) {
        if (!track && !this.queue.size)
            return false;
        let data = track
            ? track
            : this.queue.shift();
        if (!data)
            return false;
        let current = this.map.get("current") || {};
        if (this.loop && Object.keys(current[this.guildId]).length != 0) {
            current[this.guildId].time
                ? (current[this.guildId].time = 0)
                : false;
            this.set("ping", undefined);
            this.queue.push(current[this.guildId]);
        }
        if (typeof data == "string") {
            try {
                let resolveTrack = await this.rest.decodeTrack(data);
                data = new (index_1.Structure.get("MoonlinkTrack"))(resolveTrack, null);
            }
            catch (err) {
                this.manager.emit("debug", "@Moonlink(Player) - falha ao tentar decodificar uma track " +
                    data +
                    ", error: " +
                    err);
                return;
            }
        }
        current[this.guildId] = data;
        this.map.set("current", current);
        await this.rest.update({
            guildId: this.guildId,
            data: {
                track: {
                    encoded: data.encoded
                },
                volume: this.volume
            }
        });
        return true;
    }
    async pause() {
        if (this.paused)
            return true;
        await this.updatePlaybackStatus(true);
        return true;
    }
    async resume() {
        if (this.playing)
            return true;
        await this.updatePlaybackStatus(false);
        return true;
    }
    async updatePlaybackStatus(paused) {
        await this.rest.update({
            guildId: this.guildId,
            data: { paused }
        });
        this.set("paused", paused);
        this.set("playing", !paused);
    }
    async stop(destroy) {
        if (!this.queue.size) {
            await this.rest.update({
                guildId: this.guildId,
                data: {
                    track: { encoded: null }
                }
            });
        }
        this.manager.options?.destroyPlayersStopped && destroy
            ? this.destroy()
            : this.queue.clear();
        return true;
    }
    async skip(position) {
        if (position) {
            this.validateNumberParam(position, "position");
            let queue = this.queue.all();
            if (!queue[position - 1]) {
                throw new Error(`@Moonlink(Player) - the indicated position does not exist, make security in your code to avoid errors`);
            }
            let data = queue.splice(position - 1, 1)[0];
            let currents = this.map.get("current") || {};
            currents[this.guildId] = data;
            this.map.set("current", currents);
            this.queue.setQueue(queue);
            await this.play(data);
            return true;
        }
        if (this.queue.size && this.data.shuffled) {
            let currentQueue = this.queue.all;
            const randomIndex = Math.floor(Math.random() * currentQueue.length);
            const shuffledTrack = currentQueue.splice(randomIndex, 1)[0];
            currentQueue.unshift(shuffledTrack);
            this.queue.setQueue(currentQueue);
            this.play();
            return;
        }
        if (this.queue.size) {
            this.play();
            return false;
        }
        else {
            this.stop();
            return true;
        }
    }
    async setVolume(percent) {
        if (typeof percent == "undefined" || typeof percent !== "number") {
            throw new Error('@Moonlink(Player) - option "percent" is empty or different from a number');
        }
        if (!this.playing) {
            throw new Error("@Moonlink(Player) - cannot change volume while the player is not playing");
        }
        await this.rest.update({
            guildId: this.guildId,
            data: { volume: percent }
        });
        this.set("volume", percent);
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
        this.set("loop", mode);
        return mode;
    }
    async destroy() {
        if (this.connected)
            this.disconnect();
        await this.rest.destroy(this.guildId);
        this.queue.clear();
        let players = this.map.get("players");
        delete players[this.guildId];
        this.map.set("players", players);
        this.manager.emit("debug", "@Moonlink(Player): destroyed player " + this.guildId);
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
        await this.rest.update({
            guildId: this.guildId,
            data: { position }
        });
        return position;
    }
    shuffle(mode) {
        if (!this.queue.size) {
            throw new Error(`@Moonlink(Player) - The "shuffle" method doesn't work if there are no tracks in the queue`);
            return false;
        }
        mode ? mode : (mode = !this.shuffled);
        this.set("shuffled", mode);
        this.shuffled = mode;
        return mode;
    }
}
exports.MoonlinkPlayer = MoonlinkPlayer;
