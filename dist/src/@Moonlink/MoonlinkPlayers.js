"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkPlayer = void 0;
const index_1 = require("../../index");
/**
 * Represents a Moonlink media player.
 */
class MoonlinkPlayer {
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
    filters;
    current;
    data;
    node;
    rest;
    /**
     * Creates an instance of MoonlinkPlayer.
     * @param infos - Player information.
     * @param manager - MoonlinkManager instance.
     * @param map - Map for storing player data.
     */
    constructor(infos, manager, map) {
        // Initialize properties and set default values based on input parameters.
        this.payload = manager._sPayload;
        this.guildId = infos.guildId;
        this.textChannel = infos.textChannel;
        this.voiceChannel = infos.voiceChannel;
        this.autoPlay = infos.autoPlay;
        this.connected = infos.connected || null;
        this.playing = infos.playing || null;
        this.paused = infos.paused || null;
        this.loop = infos.loop || null;
        this.volume = infos.volume || 90;
        if (manager.options && manager.options.custom.queue) {
            this.queue = new manager.options.custom.queue(manager, this);
        }
        else {
            this.queue = new index_1.MoonlinkQueue(manager, this);
        }
        this.current = map.get("current") || {};
        this.current = this.current[this.guildId];
        this.map = map;
        this.data = this.map.get('players') || {};
        this.data = this.data[this.guildId];
        this.node = manager.nodes.get(this.get('node'));
        this.filters = new index_1.MoonlinkFilters(this);
        this.rest = this.node.rest;
        this.manager = manager;
    }
    /**
     * Private method to update player information in the map.
     */
    updatePlayers() {
        let players = this.map.get('players') || {};
        players[this.guildId] = this.data;
        this.map.set('players', players);
    }
    /**
     * Set a key-value pair in the player's data and update the map.
     * @param key - The key to set.
     * @param value - The value to set.
     */
    set(key, value) {
        this.data[key] = value;
        this.updatePlayers();
    }
    /**
     * Get a value from the player's data.
     * @param key - The key to retrieve.
     * @returns The value associated with the key.
     */
    get(key) {
        this.updatePlayers();
        return this.data[key] || null;
    }
    /**
     * Set the text channel for the player.
     * @param channelId - The ID of the text channel.
     * @returns True if the channel was set successfully.
     * @throws Error if channelId is empty or not a string.
     */
    setTextChannel(channelId) {
        if (!channelId) {
            throw new Error('[ @Moonlink/Player ]: "channelId" option is empty');
        }
        if (typeof channelId !== "string") {
            throw new Error('[ @Moonlink/Player ]: option "channelId" is different from a string');
        }
        this.set('textChannel', channelId);
        this.textChannel = channelId;
        return true;
    }
    /**
     * Set the voice channel for the player.
     * @param channelId - The ID of the voice channel.
     * @returns True if the channel was set successfully.
     * @throws Error if channelId is empty or not a string.
     */
    setVoiceChannel(channelId) {
        if (!channelId) {
            throw new Error('[ @Moonlink/Player ]: "channelId" option is empty');
        }
        if (typeof channelId !== "string") {
            throw new Error('[ @Moonlink/Player ]: option "channelId" is different from a string');
        }
        this.set('voiceChannel', channelId);
        this.voiceChannel = channelId;
        return true;
    }
    /**
     * Set the auto-play mode for the player.
     * @param mode - Auto-play mode (true/false).
     * @returns True if the mode was set successfully.
     * @throws Error if mode is not a boolean.
     */
    setAutoPlay(mode) {
        if (typeof mode !== "boolean") {
            throw new Error('[ @Moonlink/Player ]: "mode" option is empty or different from a boolean');
        }
        this.set('autoPlay', mode);
        this.autoPlay = mode;
        return mode;
    }
    /**
     * Connect the player to a voice channel with optional connection options.
     * @param options - Connection options (setMute, setDeaf).
     * @returns True if the connection was successful.
     */
    connect(options) {
        options = options || { setDeaf: false, setMute: false };
        const { setDeaf, setMute } = options;
        this.set("connected", true);
        this.payload(this.guildId, JSON.stringify({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.voiceChannel,
                self_mute: setMute,
                self_deaf: setDeaf,
            },
        }));
        return true;
    }
    /**
     * Disconnect the player from the voice channel.
     * @returns True if the disconnection was successful.
     */
    disconnect() {
        this.set("connected", false);
        this.set('voiceChannel', null);
        this.payload(this.guildId, JSON.stringify({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: null,
                self_mute: false,
                self_deaf: false,
            },
        }));
        return true;
    }
    /**
     * Restart the player by reconnecting and updating its state.
     */
    async restart() {
        if (!this.current && !this.queue.size)
            return;
        if (!this.current)
            this.play();
        await this.manager.attemptConnection(this.guildId);
        await this.rest.update({
            guildId: this.guildId,
            data: {
                encodedTrack: this.current.encoded,
                position: this.current.position,
                volume: this.volume,
            },
        });
    }
    /**
     * Play the next track in the queue.
     */
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
        await this.queue.db.set(`queue.${this.guildId}`, queue);
        await this.rest.update({
            guildId: this.guildId,
            data: {
                encodedTrack: data.encoded,
                volume: this.volume,
            },
        });
    }
    /**
     * Pause the playback.
     * @returns True if paused successfully.
     */
    async pause() {
        if (!this.paused)
            return true;
        await this.updatePlaybackStatus(true);
        return true;
    }
    /**
     * Resume the playback.
     * @returns True if resumed successfully.
     */
    async resume() {
        if (this.playing)
            return true;
        await this.updatePlaybackStatus(false);
        return true;
    }
    /**
     * Private method to update the playback status (paused or resumed).
     * @param paused - Indicates whether to pause or resume the playback.
     */
    async updatePlaybackStatus(paused) {
        await this.rest.update({
            guildId: this.guildId,
            data: { paused },
        });
        this.set("paused", paused);
        this.set("playing", !paused);
    }
    /**
     * Stop the playback and optionally clear player data.
     * @returns True if stopped successfully.
     */
    async stop() {
        if (!this.queue.size) {
            await this.rest.update({
                guildId: this.guildId,
                data: { encodedTrack: null },
            });
        }
        this.destroy();
        return true;
    }
    /**
     * Skip to the next track in the queue.
     * @returns True if the next track was successfully played.
     */
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
    /**
     * Set the volume level for the player.
     * @param percent - Volume percentage (0 to Infinity).
     * @returns The new volume level.
     * @throws Error if the volume is not a valid number or player is not playing.
     */
    async setVolume(percent) {
        if (typeof percent == "undefined" || typeof percent !== "number") {
            throw new Error('[ @Moonlink/Player ]: option "percent" is empty or different from a number');
        }
        if (!this.playing) {
            throw new Error("[ @Moonlink/Player ]: cannot change volume while the player is not playing");
        }
        await this.rest.update({
            guildId: this.guildId,
            data: { volume: percent },
        });
        this.set('volume', percent);
        return percent;
    }
    /**
     * Set the loop mode for the player.
     * @param mode - Loop mode (0 for no loop, 1 for single track, 2 for entire queue).
     * @returns The new loop mode.
     * @throws Error if the mode is not a valid number or out of range.
     */
    setLoop(mode) {
        if (typeof mode !== 'number' || (mode !== null && (mode < 0 || mode > 2))) {
            throw new Error('[ @Moonlink/Player ]: the option "mode" is different from a number or the option does not exist');
        }
        this.set("loop", mode);
        return mode;
    }
    /**
     * Destroy the player, disconnecting it and removing player data.
     * @returns True if the player was successfully destroyed.
     */
    async destroy() {
        if (this.connected)
            this.disconnect();
        await this.rest.destroy(this.guildId);
        this.queue.clear();
        let players = this.map.get("players");
        delete players[this.guildId];
        this.map.set("players", players);
        return true;
    }
    /**
     * Private method to validate a number parameter.
     * @param param - The number parameter to validate.
     * @param paramName - The name of the parameter.
     * @throws Error if the parameter is not a valid number.
     */
    validateNumberParam(param, paramName) {
        if (typeof param !== "number") {
            throw new Error(`[ @Moonlink/Player ]: option "${paramName}" is empty or different from a number`);
        }
    }
    /**
     * Seek to a specific position in the current track.
     * @param position - The position to seek to.
     * @returns The new position after seeking.
     * @throws Error if the position is greater than the track duration or seek is not allowed.
     */
    async seek(position) {
        this.validateNumberParam(position, "position");
        if (position >= this.current.duration) {
            throw new Error(`[ @Moonlink/Player ]: parameter "position" is greater than the duration of the current track`);
        }
        if (!this.current.isSeekable && this.current.isStream) {
            throw new Error(`[ @Moonlink/Player ]: seek function cannot be applied on live video or cannot be applied in "isSeekable"`);
        }
        await this.rest.update({
            guildId: this.guildId,
            data: { position },
        });
        return position;
    }
    /**
     * Skip to a specific position in the queue.
     * @param position - The position to skip to.
     * @returns True if the position exists and the skip was successful.
     * @throws Error if the queue is empty, or the indicated position does not exist.
     */
    async skipTo(position) {
        this.validateNumberParam(position, "position");
        if (!this.queue.size) {
            throw new Error(`[ @Moonlink/Player ]: the queue is empty to use this function`);
        }
        let queue = this.queue.db.get(`queue.${this.guildId}`);
        if (!queue[position - 1]) {
            throw new Error(`[ @Moonlink/Player ]: the indicated position does not exist, make security in your code to avoid errors`);
        }
        let data = queue.splice(position - 1, 1)[0];
        let currents = this.map.get("current") || {};
        currents[this.guildId] = data;
        this.map.set("current", currents);
        this.queue.db.set(`queue.${this.guildId}`, queue);
        await this.rest.update({
            guildId: this.guildId,
            data: {
                encodedTrack: data.track ? data.track : data.encoded ? data.encoded : data.trackEncoded ? data.trackEncoded : null,
                volume: 90,
            },
        });
        return true;
    }
    /**
     * Shuffle the tracks in the queue.
     * @returns True if the shuffle was successful.
     * @throws Error if the queue is empty.
     */
    async shuffle() {
        if (!this.queue.size) {
            throw new Error(`[ @Moonlink/Player ]: the queue is empty to use this function`);
        }
        let queue = this.queue.all;
        this.shuffleArray(queue);
        this.queue.db.set(`queue.${this.guildId}`, queue);
        return true;
    }
    /**
     * Private method to shuffle an array randomly.
     * @param array - The array to shuffle.
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
exports.MoonlinkPlayer = MoonlinkPlayer;
//# sourceMappingURL=MoonlinkPlayers.js.map