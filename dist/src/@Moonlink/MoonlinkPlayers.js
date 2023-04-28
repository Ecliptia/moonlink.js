"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkPlayer = void 0;
const MoonlinkQueue_1 = require("../@Rest/MoonlinkQueue");
class MoonlinkPlayer {
    sendWs;
    manager;
    infos;
    map;
    payload;
    guildId;
    textChannel;
    voiceChannel;
    autoPlay;
    connected;
    playing;
    paused;
    loop;
    volume;
    queue;
    current;
    rest;
    constructor(infos, manager, map, rest) {
        this.payload = manager._sPayload;
        this.sendWs = manager.leastUsedNodes.sendWs;
        this.guildId = infos.guildId;
        this.textChannel = infos.textChannel;
        this.voiceChannel = infos.voiceChannel;
        this.autoPlay = infos.autoPlay || null;
        this.connected = infos.connected || null;
        this.playing = infos.playing || null;
        this.paused = infos.paused || null;
        this.loop = infos.loop || null;
        this.volume = infos.volume || 90;
        this.queue = new MoonlinkQueue_1.MoonlinkQueue(this.manager, this);
        this.current = map.get("currents") || {};
        this.current = this.current[this.guildId] || null;
        if (rest)
            this.rest = rest;
        this.map = map;
    }
    setTextChannel(channelId) {
        if (!channelId)
            throw new Error('[ @Moonlink/Player ]: "channelId" option is empty');
        if (typeof channelId !== "string")
            throw new Error('[ @Moonlink/Player ]: option "channelId" is different from string');
        let players = this.map.get("players") || {};
        players[this.guildId] = {
            ...players[this.guildId],
            textChannel: channelId,
        };
        this.map.set("players", players);
        this.textChannel = channelId;
        return true;
    }
    setVoiceChannel(channelId) {
        if (!channelId)
            throw new Error('[ @Moonlink/Player ]: "channelId" option is empty');
        if (typeof channelId !== "string")
            throw new Error('[ @Moonlink/Player ]: option "channelId" is different from string');
        let players = this.map.get("players") || {};
        players[this.guildId] = {
            ...players[this.guildId],
            voiceChannel: channelId,
        };
        this.map.set("players", players);
        this.voiceChannel = channelId;
        return true;
    }
    setAutoPlay(mode) {
        if (!mode && typeof mode !== "boolean")
            throw new Error('[ @Moonlink/Player ]: "mode" option is empty or is different from boolean');
        let players = this.map.get("players") || {};
        players[this.guildId] = {
            ...players[this.guildId],
            autoPlay: mode,
        };
        this.map.set("players", players);
        this.autoPlay = mode;
        return mode;
    }
    connect(options) {
        if (!options)
            options = { setDeaf: false, setMute: false };
        let setDeaf = options.setDeaf || null;
        let setMute = options.setMute || null;
        this.payload(this.guildId, JSON.stringify({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.voiceChannel,
                self_mute: setMute,
                self_deaf: setDeaf,
            },
        }));
        let players = this.map.get("players") || {};
        players[this.guildId] = {
            ...players[this.guildId],
            connected: true,
        };
        this.connected = true;
        this.map.set("players", players);
        return true;
    }
    disconnect() {
        this.payload(this.guildId, JSON.stringify({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: null,
                self_mute: false,
                self_deaf: false,
            },
        }));
        let players = this.map.get("players") || {};
        players[this.guildId] = {
            ...players[this.guildId],
            connected: false,
            voiceChannel: null,
        };
        this.connected = false;
        this.voiceChannel = null;
        this.map.set("players", players);
        return true;
    }
    async play() {
        if (!this.queue.size)
            return;
        let queue = this.queue.db.get(`queue.${this.guildId}`);
        let data = queue.shift();
        if (!data)
            return;
        let current = this.map.get("current") || {};
        current[this.guildId] = {
            ...data,
            thumbnail: data.thumbnail,
            requester: data.requester,
        };
        this.current = current[this.guildId];
        this.map.set("current", current);
        this.queue.db.set(`queue.${this.guildId}`, queue);
        if (this.rest.node.version.replace(/\./g, "") <= "370")
            this.sendWs({
                op: "play",
                guildId: this.guildId,
                channelId: this.textChannel,
                track: data.track
                    ? data.track
                    : data.encoded
                        ? data.encoded
                        : data.trackEncoded
                            ? data.trackEncoded
                            : null,
                volume: 90,
                pause: false,
            });
        else
            await this.rest.update({
                guildId: this.guildId,
                data: {
                    encodedTrack: data.track
                        ? data.track
                        : data.encoded
                            ? data.encoded
                            : data.trackEncoded
                                ? data.trackEncoded
                                : null,
                    volume: 90,
                },
            });
    }
    async pause() {
        if (this.paused)
            return true;
        if (this.rest.node.version.replace(/\./g, "") <= "370")
            this.sendWs({
                op: "pause",
                guildId: this.guildId,
                pause: true,
            });
        else
            await this.rest.update({
                guildId: this.guildId,
                data: { paused: true },
            });
        let players = this.map.get("players") || {};
        players[this.guildId] = {
            ...players[this.guildId],
            paused: true,
            playing: false,
        };
        this.paused = true;
        this.playing = false;
        this.map.set("players", players);
        return true;
    }
    async resume() {
        if (this.playing)
            return true;
        if (this.rest.node.version.replace(/\./g, "") <= "370")
            this.sendWs({
                op: "pause",
                guildId: this.guildId,
                pause: false,
            });
        else
            await this.rest.update({
                guildId: this.guildId,
                data: { paused: false },
            });
        let players = this.map.get("players") || {};
        players[this.guildId] = {
            ...players[this.guildId],
            paused: false,
            playing: true,
        };
        this.paused = false;
        this.playing = true;
        this.map.set("players", players);
        return true;
    }
    async stop() {
        if (!this.queue.size) {
            if (this.rest.node.version.replace(/\./g, "") <= "370")
                this.sendWs({
                    op: "stop",
                    guildId: this.guildId,
                });
            else
                await this.rest.update({
                    guildId: this.guildId,
                    data: { encodedTrack: null },
                });
            return true;
        }
        else {
            delete this.map.get(`players`)[this.guildId];
            if (this.rest.node.version.replace(/\./g, "") <= "370")
                this.sendWs({
                    op: "stop",
                    guildId: this.guildId,
                });
            else
                await this.rest.update({
                    guildId: this.guildId,
                    data: { encodedTrack: null },
                });
            return true;
        }
        return false;
    }
    async skip() {
        if (!this.queue.size) {
            this.destroy();
            return false;
        }
        else {
            this.play();
            return true;
        }
    }
    async setVolume(percent) {
        if (typeof percent == "undefined" && typeof percent !== "number")
            throw new Error('[ @Moonlink/Player ]: option "percent" is empty or different from number');
        if (!this.playing)
            throw new Error("[ @Moonlink/Player ]: cannot change volume while player is not playing");
        if (this.rest.node.version.replace(/\./g, "") <= "370")
            this.sendWs({
                op: "volume",
                guildId: this.guildId,
                volume: percent,
            });
        else
            await this.rest.update({
                guildId: this.guildId,
                data: { volume: percent },
            });
        let players = this.map.get("players") || {};
        players[this.guildId] = {
            ...players[this.guildId],
            volume: percent,
        };
        this.volume = percent;
        this.map.set("players", players);
        return percent;
    }
    setLoop(mode) {
        let players = this.map.get("players") || {};
        if (!mode) {
            players[this.guildId] = {
                ...players[this.guildId],
                loop: mode,
            };
            this.map.set("players", players);
            this.loop = mode;
            return null;
        }
        if (typeof mode !== "number" && mode > 2 && mode < 0)
            throw new Error('[ @Moonlink/Player ]: the option "mode" is different from number or the option does not exist');
        players[this.guildId] = {
            ...players[this.guildId],
            loop: mode,
        };
        this.loop = mode;
        this.map.set("players", players);
        return mode;
    }
    async destroy() {
        if (this.connected)
            this.disconnect();
        if (this.rest.node.version.replace(/\./g, "") <= "370")
            this.sendWs({
                op: "destroy",
                guildId: this.guildId,
            });
        else
            await this.rest.destroy(this.guildId);
        this.queue.db.delete(`queue.${this.guildId}`);
        let players = this.map.get("players");
        delete players[this.guildId];
        this.map.set("players", players);
        return true;
    }
    async seek(position) {
        if (!position && typeof position !== "number")
            throw new Error('[ @Moonlink/Player ]: option "position" is empty or different from number ');
        if (position >= this.current.position)
            throw new Error('[ @Moonlink/Player ]: parameter "position" is greater than the duration of the current track');
        if (!this.current.isSeekable && this.current.isStream)
            throw new Error('[ @Moonlink/Player ]: seek function cannot be applied on live video | or cannot be applied in "isSeekable"');
        if (this.rest.node.version.replace(/\./g, "") <= "370")
            this.sendWs({
                op: "seek",
                position: position,
                guildId: this.guildId,
            });
        else
            await this.rest.update({
                guildId: this.guildId,
                data: {
                    position,
                },
            });
        return position;
    }
    async skipTo(position) {
        if (!position && typeof position !== "number")
            throw new Error('[ @Moonlink/Player ]: option "position" is empty or different from number ');
        if (!this.queue.size)
            throw new Error("[ @Moonlink/Player ]: the queue is empty to use this function");
        let queue = this.queue.db.get(`queue.${this.guildId}`);
        if (!queue[position - 1])
            throw new Error("[ @Moonlink/Player ]: the indicated position does not exist, make security in your code to avoid errors");
        let data = queue.splice(position - 1, 1)[0];
        let currents = this.map.get("current") || {};
        currents[this.guildId] = data;
        this.map.set("current", currents);
        this.queue.db.set(`queue.${this.guildId}`, queue);
        if (this.rest.node.version.replace(/\./g, "") <= "370")
            this.sendWs({
                op: "play",
                guildId: this.guildId,
                channelId: this.textChannel,
                track: data.track
                    ? data.track
                    : data.encoded
                        ? data.encoded
                        : data.trackEncoded
                            ? data.trackEncoded
                            : null,
                volume: 90,
                pause: false,
            });
        else
            await this.rest.update({
                guildId: this.guildId,
                data: {
                    encodedTrack: data.track
                        ? data.track
                        : data.encoded
                            ? data.encoded
                            : data.trackEncoded
                                ? data.trackEncoded
                                : null,
                    volume: 90,
                },
            });
        return true;
    }
}
exports.MoonlinkPlayer = MoonlinkPlayer;
//# sourceMappingURL=MoonlinkPlayers.js.map