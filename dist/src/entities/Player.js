"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const Util_1 = require("../Util");
const Voice_1 = require("./Voice");
const Track_1 = require("./Track");
const VoiceReceiver_1 = require("./VoiceReceiver");
class Player {
    manager;
    node;
    guildId;
    queue;
    filters;
    voice;
    data = {};
    voiceChannelId;
    textChannelId;
    playing = false;
    paused = false;
    connected = false;
    destroyed = false;
    volume = 100;
    loop = "off";
    loopCount;
    autoPlay = false;
    autoLeave = false;
    ping = -1;
    isResuming = false;
    current = null;
    previous = [];
    historySize = 10;
    lastActivityTime = Date.now();
    fading;
    nextTrack;
    audioTrackId;
    loudnessNormalizer;
    endTime;
    healthCheckTimer;
    lastPosition = 0;
    lastPositionTime = Date.now();
    stuckDetectionCount = 0;
    silentDetectionCount = 0;
    resumeDebounceTimer;
    isResumeInProgress = false;
    lastResumeAttempt = 0;
    constructor(manager, node, config) {
        this.manager = manager;
        this.node = node;
        this.guildId = config.guildId;
        this.voiceChannelId = config.voiceChannelId;
        this.textChannelId = config.textChannelId || config.voiceChannelId;
        this.volume = config.volume ?? this.manager.options.defaultPlayer?.volume ?? 100;
        this.set("selfDeaf", config.selfDeaf ?? this.manager.options.defaultPlayer?.selfDeaf ?? true);
        this.set("selfMute", config.selfMute ?? this.manager.options.defaultPlayer?.selfMute ?? false);
        this.autoPlay = config.autoPlay ?? this.manager.options.defaultPlayer?.autoPlay ?? false;
        this.autoLeave = config.autoLeave ?? this.manager.options.defaultPlayer?.autoLeave ?? false;
        this.loop = config.loop ?? this.manager.options.defaultPlayer?.loop ?? "off";
        this.loopCount = config.loopCount;
        this.historySize = this.manager.options.defaultPlayer?.historySize ?? 10;
        this.queue = new (Util_1.Structure.get("Queue"))(this);
        this.filters = new (Util_1.Structure.get("Filters"))(this);
        this.voice = new Voice_1.Voice(this);
        this.manager.emit("debug", `Moonlink.js > Player#constructor >> Player created for guild ${this.guildId} on node ${this.node.identifier} | autoPlay: ${this.autoPlay}, autoLeave: ${this.autoLeave}, loop: ${this.loop}`);
        this.updateData(undefined, config);
        this.startHealthCheck();
    }
    startHealthCheck() {
        this.stopHealthCheck();
        const interval = this.manager.options.playerHealth?.checkInterval ?? 30000;
        this.healthCheckTimer = setInterval(() => {
            this.performHealthCheck();
        }, interval);
    }
    stopHealthCheck() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = undefined;
        }
    }
    async performHealthCheck() {
        if (this.destroyed || !this.connected)
            return;
        const now = Date.now();
        const idleTimeout = this.manager.options.playerDestruction?.idleTimeout ?? 300000;
        const silenceTimeout = this.manager.options.playerHealth?.silenceTimeout ?? 120000;
        const maxStuckCount = this.manager.options.playerHealth?.maxStuckCount ?? 3;
        const maxSilentCount = this.manager.options.playerHealth?.maxSilentCount ?? 2;
        if (this.playing && !this.paused && this.current) {
            const currentPosition = this.current.position ?? 0;
            const positionDelta = Math.abs(currentPosition - this.lastPosition);
            const timeDelta = now - this.lastPositionTime;
            if (positionDelta < 1000 && timeDelta > 30000 && !this.current.isStream) {
                this.stuckDetectionCount++;
                this.manager.emit("debug", `Moonlink.js > Player#healthCheck >> Player ${this.guildId} appears stuck. Position: ${currentPosition}, Stuck count: ${this.stuckDetectionCount}/${maxStuckCount}`);
                if (this.stuckDetectionCount >= maxStuckCount) {
                    this.manager.emit("debug", `Moonlink.js > Player#healthCheck >> Player ${this.guildId} stuck for too long, attempting recovery.`);
                    await this.recoverFromStuck();
                    this.stuckDetectionCount = 0;
                    return;
                }
            }
            else {
                this.stuckDetectionCount = 0;
            }
            const activityDelta = now - this.lastActivityTime;
            if (activityDelta > silenceTimeout) {
                this.silentDetectionCount++;
                this.manager.emit("debug", `Moonlink.js > Player#healthCheck >> Player ${this.guildId} silent for ${Math.round(activityDelta / 1000)}s. Silent count: ${this.silentDetectionCount}/${maxSilentCount}`);
                if (this.silentDetectionCount >= maxSilentCount) {
                    this.manager.emit("debug", `Moonlink.js > Player#healthCheck >> Player ${this.guildId} silent for too long, attempting soft restart.`);
                    await this.softRestart("Silent player detected");
                    this.silentDetectionCount = 0;
                    return;
                }
            }
            else {
                this.silentDetectionCount = 0;
            }
            this.lastPosition = currentPosition;
            this.lastPositionTime = now;
        }
        else {
            this.stuckDetectionCount = 0;
            this.silentDetectionCount = 0;
        }
    }
    async recoverFromStuck() {
        if (this.destroyed)
            return;
        this.manager.emit("playerRecoveryStarted", this);
        try {
            if (this.current && this.current.isSeekable) {
                const seekPos = Math.max(0, (this.current.position ?? 0) + 2000);
                this.manager.emit("debug", `Moonlink.js > Player#recoverFromStuck >> Seeking forward 2s for player ${this.guildId}.`);
                await this.seek(seekPos);
            }
            else {
                await this.softRestart("Stuck player recovery");
            }
            this.manager.emit("playerRecoverySuccess", this);
        }
        catch (error) {
            this.manager.emit("debug", `Moonlink.js > Player#recoverFromStuck >> Recovery failed: ${error.message}`);
            this.manager.emit("playerRecoveryFailed", this);
        }
    }
    async softRestart(reason) {
        if (this.destroyed)
            return false;
        this.manager.emit("debug", `Moonlink.js > Player#softRestart >> Soft restart triggered for player ${this.guildId}. Reason: ${reason}`);
        const currentTrack = this.current;
        const currentPosition = currentTrack?.position ?? 0;
        const wasPlaying = this.playing;
        const wasPaused = this.paused;
        if (!currentTrack) {
            this.manager.emit("debug", `Moonlink.js > Player#softRestart >> No current track, skipping soft restart for player ${this.guildId}.`);
            return false;
        }
        try {
            await this.stop();
            await new Promise(resolve => setTimeout(resolve, 500));
            if (this.voice.sessionId && this.voice.token && this.voice.endpoint) {
                const voicePayload = {
                    sessionId: this.voice.sessionId,
                    token: this.voice.token,
                    endpoint: this.voice.endpoint
                };
                if (this.node.isNodeLink) {
                    voicePayload.channelId = this.voiceChannelId;
                }
                await this.sendPlayerUpdate({ voice: voicePayload }, true);
            }
            this.queue.unshift(currentTrack);
            await this.play({
                track: currentTrack,
                position: currentPosition,
                noReplace: false
            });
            if (wasPaused) {
                await this.pause();
            }
            this.stuckDetectionCount = 0;
            this.silentDetectionCount = 0;
            this.lastPosition = currentPosition;
            this.lastPositionTime = Date.now();
            this.updateActivity();
            this.manager.emit("debug", `Moonlink.js > Player#softRestart >> Soft restart completed for player ${this.guildId}.`);
            return true;
        }
        catch (error) {
            this.manager.emit("debug", `Moonlink.js > Player#softRestart >> Soft restart failed: ${error.message}`);
            return false;
        }
    }
    updateActivity() {
        this.lastActivityTime = Date.now();
    }
    set(key, value) {
        this.data[key] = value;
        return this;
    }
    get(key) {
        return this.data[key];
    }
    async updateData(path, data) {
        const dbPath = `players.${this.guildId}${path ? `.${path}` : ''}`;
        await this.manager.database.set(dbPath, data);
    }
    assertNodeLinkFeature(feature) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)(feature);
        }
    }
    resolveEncodedTrack(track) {
        if (track instanceof Track_1.Track)
            return track.encoded;
        if (typeof track === "string" && track.length > 0)
            return track;
        throw new Error("Invalid track input. Provide a Track instance or encoded string.");
    }
    async sendPlayerUpdate(payload, noReplace) {
        const hasNodeLinkExtras = Boolean(payload?.fading ||
            payload?.nextTrack ||
            payload?.track?.audioTrackId ||
            payload?.loudnessNormalizer !== undefined ||
            payload?.endTime !== undefined);
        if (!this.node.isNodeLink && hasNodeLinkExtras) {
            throw (0, Util_1.nodeLinkOnlyError)("updatePlayer extras");
        }
        const finalPayload = { ...payload };
        if (payload.voice) {
            const voicePayload = { ...payload.voice };
            if (this.node.isNodeLink && (!voicePayload.sessionId || !voicePayload.token || !voicePayload.endpoint)) {
                throw new Error("voice payload requires sessionId, token, and endpoint.");
            }
            if (this.node.isNodeLink && !voicePayload.channelId) {
                voicePayload.channelId = this.voiceChannelId;
            }
            finalPayload.voice = voicePayload;
        }
        return this.node.rest.updatePlayer(this.guildId, finalPayload, noReplace);
    }
    async updatePlayer(payload, noReplace) {
        return this.sendPlayerUpdate(payload, noReplace);
    }
    async connect({ selfDeaf, selfMute } = {}) {
        const connectStack = new Error().stack?.split("\n").slice(2, 8).join("\n");
        this.manager.emit("debug", `Moonlink.js > Player#connect -> Connect requested for guild ${this.guildId}. Stack: ${connectStack || "unavailable"}`);
        this.set("userInitiatedConnect", true);
        if (selfDeaf !== undefined)
            this.set("selfDeaf", selfDeaf);
        if (selfMute !== undefined)
            this.set("selfMute", selfMute);
        await this.voice.connect({ selfDeaf: this.get("selfDeaf") ?? true, selfMute: this.get("selfMute") ?? false });
        return this;
    }
    async disconnect() {
        const disconnectStack = new Error().stack?.split("\n").slice(2, 8).join("\n");
        this.manager.emit("debug", `Moonlink.js > Player#disconnect -> Disconnect requested for guild ${this.guildId}. Stack: ${disconnectStack || "unavailable"}`);
        this.set("userInitiatedConnect", false);
        await this.voice.disconnect();
        return this;
    }
    async play(options = {}) {
        let finalOptions;
        if (options instanceof Track_1.Track) {
            finalOptions = { track: options };
        }
        else if ('encoded' in options && 'info' in options) {
            finalOptions = { track: options };
        }
        else {
            finalOptions = options;
        }
        this.manager.emit("debug", `Moonlink.js > Player#play -> play() called for guild ${this.guildId} with options: ${JSON.stringify(options)}`);
        if (!this.voice.sessionId || !this.voice.endpoint) {
            this.manager.emit("debug", `Moonlink.js > Player#play >> Voice not ready for guild ${this.guildId}, attempting to connect...`);
            try {
                await this.connect();
            }
            catch (e) {
                this.manager.emit("debug", `Moonlink.js > Player#play >> Failed to connect voice: ${e}`);
                return false;
            }
        }
        let track = finalOptions.track;
        if (finalOptions.encoded) {
            try {
                const decoded = (0, Util_1.decodeTrack)(finalOptions.encoded);
                track = new Track_1.Track(decoded, finalOptions.requester);
            }
            catch (e) {
                this.manager.emit("debug", `Moonlink.js > Player#play >> Error decoding track for guild ${this.guildId}. Error: ${e}`);
                return false;
            }
        }
        if (track && !(track instanceof Track_1.Track)) {
            try {
                track = new Track_1.Track(track, finalOptions.requester);
            }
            catch (e) {
                this.manager.emit("debug", `Moonlink.js > Player#play >> Invalid track object for guild ${this.guildId}. Error: ${e}`);
                return false;
            }
        }
        if (track) {
            this.queue.unshift(track);
            this.manager.emit("debug", `Moonlink.js > Player#play >> Added track "${track.title}" to front of queue for guild ${this.guildId}`);
        }
        if (this.queue.size === 0) {
            this.manager.emit("debug", `Moonlink.js > Player#play >> Queue is empty, cannot start playback for guild ${this.guildId}`);
            return false;
        }
        const previousTrack = this.current;
        const nextTrack = this.queue.shift();
        if (!nextTrack || !nextTrack.encoded) {
            this.manager.emit("debug", `Moonlink.js > Player#play >> Invalid track data for guild ${this.guildId}. Next track is ${JSON.stringify(nextTrack)}`);
            if (nextTrack)
                this.queue.unshift(nextTrack);
            return false;
        }
        const oldTrackTitle = this.current?.title ?? "null";
        this.current = nextTrack instanceof Track_1.Track ? nextTrack : new Track_1.Track(nextTrack);
        this.current.position = finalOptions.position || 0;
        this.updateData("current", { encoded: this.current.encoded, requester: this.current.requester });
        this.manager.emit("debug", `Moonlink.js > Player#play >> Player state changed: current track: ${oldTrackTitle} -> ${this.current.title}`);
        const oldPlaying = this.playing;
        const oldPaused = this.paused;
        this.playing = true;
        this.paused = false;
        this.updateData("playing", this.playing);
        this.updateData("paused", this.paused);
        const audioTrackId = finalOptions.audioTrackId ?? this.audioTrackId;
        const payload = {
            track: {
                encoded: this.current.encoded,
                userData: this.current.userData
            },
            position: finalOptions.position || this.current.position,
        };
        if (audioTrackId) {
            payload.track.audioTrackId = audioTrackId;
        }
        if (this.fading)
            payload.fading = this.fading;
        if (this.nextTrack)
            payload.nextTrack = this.nextTrack;
        if (this.loudnessNormalizer !== undefined) {
            payload.loudnessNormalizer = this.loudnessNormalizer;
        }
        this.manager.emit("playerTriggeredPlay", this, this.current);
        this.manager.emit("debug", `Moonlink.js > Player#play -> Sending play request to node ${this.node.identifier} for guild ${this.guildId}. Payload: ${JSON.stringify(payload)}`);
        try {
            await this.sendPlayerUpdate(payload, finalOptions.noReplace ?? this.manager.options.noReplace);
            this.manager.emit("debug", `Moonlink.js > Player#play >> Successfully sent play request for track "${this.current.title}" for guild ${this.guildId}`);
        }
        catch (e) {
            this.manager.emit("debug", `Moonlink.js > Player#play >> CRITICAL: Failed to send play request for guild ${this.guildId}. Reverting state. Error: ${e.message}`);
            this.playing = oldPlaying;
            this.paused = oldPaused;
            this.current = previousTrack;
            this.queue.unshift(nextTrack);
            return false;
        }
        if (previousTrack && !this.get("isBackPlay")) {
            this.previous.push(previousTrack);
            const historyLimit = this.manager.options.queue?.historyLimit ?? this.historySize;
            if (this.previous.length > historyLimit) {
                this.previous.shift();
            }
            this.updateData("previous", this.previous.map(t => ({ encoded: t.encoded, requester: t.requester })));
            this.manager.emit("debug", `Moonlink.js > Player#play << Added track "${previousTrack.title}" to history for guild ${this.guildId}. History size: ${this.previous.length}`);
        }
        this.set("isBackPlay", false);
        this.playing = true;
        this.paused = false;
        this.manager.emit("debug", `Moonlink.js > Player#play >> Player state changed: playing: ${oldPlaying} -> ${this.playing}, paused: ${oldPaused} -> ${this.paused}`);
        return true;
    }
    async addMix(track, options) {
        this.assertNodeLinkFeature("mix:add");
        const encoded = this.resolveEncodedTrack(track);
        return this.node.rest.addMixLayer(this.guildId, {
            track: { encoded, userData: options?.userData },
            volume: options?.volume
        });
    }
    async getMixes() {
        this.assertNodeLinkFeature("mix:list");
        return this.node.rest.getMixLayers(this.guildId);
    }
    async updateMixVolume(mixId, volume) {
        this.assertNodeLinkFeature("mix:update");
        await this.node.rest.updateMixLayerVolume(this.guildId, mixId, volume);
        return this;
    }
    async removeMix(mixId) {
        this.assertNodeLinkFeature("mix:remove");
        await this.node.rest.removeMixLayer(this.guildId, mixId);
        return this;
    }
    async subscribeLyrics(options) {
        this.assertNodeLinkFeature("lyrics:subscribe");
        await this.node.rest.subscribeLyrics(this.guildId, options?.skipTrackSource);
        return this;
    }
    async unsubscribeLyrics() {
        this.assertNodeLinkFeature("lyrics:unsubscribe");
        await this.node.rest.unsubscribeLyrics(this.guildId);
        return this;
    }
    async loadChapters(encodedTrack) {
        this.assertNodeLinkFeature("chapters");
        const target = encodedTrack ?? this.current?.encoded;
        if (!target) {
            throw new Error("loadChapters requires an encoded track or an active player track.");
        }
        return this.node.rest.loadChapters(target);
    }
    async loadMeaning(encodedTrack, lang) {
        this.assertNodeLinkFeature("meaning");
        const target = encodedTrack ?? this.current?.encoded;
        if (!target) {
            throw new Error("loadMeaning requires an encoded track or an active player track.");
        }
        return this.node.rest.loadMeaning(target, lang);
    }
    async getLoadDirectStream(options) {
        this.assertNodeLinkFeature("loadstream");
        const target = this.current?.encoded;
        if (!target) {
            throw new Error("getLoadDirectStream requires an active player track.");
        }
        return this.node.loadDirectStream(target, options?.volume, options?.position, options?.filters);
    }
    async getDirectStream(itag) {
        this.assertNodeLinkFeature("trackstream");
        const target = this.current?.encoded;
        if (!target) {
            throw new Error("getDirectStream requires an active player track.");
        }
        return this.node.getDirectStream(target, itag);
    }
    async setFading(fading) {
        this.assertNodeLinkFeature("fading");
        this.fading = fading;
        await this.sendPlayerUpdate({ fading });
        return this;
    }
    async clearFading() {
        this.assertNodeLinkFeature("fading");
        this.fading = undefined;
        await this.sendPlayerUpdate({ fading: { enabled: false } });
        return this;
    }
    async setNextTrack(track, userData) {
        this.assertNodeLinkFeature("nextTrack");
        const encoded = this.resolveEncodedTrack(track);
        this.nextTrack = { encoded, userData };
        await this.sendPlayerUpdate({ nextTrack: this.nextTrack });
        return this;
    }
    async clearNextTrack() {
        this.assertNodeLinkFeature("nextTrack");
        this.nextTrack = undefined;
        await this.sendPlayerUpdate({ nextTrack: null });
        return this;
    }
    setAudioTrackId(audioTrackId) {
        this.assertNodeLinkFeature("audioTrackId");
        this.audioTrackId = audioTrackId;
        return this;
    }
    async setLoudnessNormalizer(enabled) {
        this.assertNodeLinkFeature("loudnessNormalizer");
        this.loudnessNormalizer = enabled;
        await this.sendPlayerUpdate({ loudnessNormalizer: enabled });
        return this;
    }
    createVoiceReceiver(options) {
        this.assertNodeLinkFeature("voiceReceive");
        return new VoiceReceiver_1.VoiceReceiver(this.node, this.guildId, options);
    }
    async pause() {
        if (this.paused) {
            this.manager.emit("debug", `Moonlink.js > Player#pause >> Player is already paused for guild ${this.guildId}`);
            return this;
        }
        this.manager.emit("debug", `Moonlink.js > Player#pause -> Sending pause request to node ${this.node.identifier} for guild ${this.guildId}`);
        this.manager.emit("playerTriggeredPause", this);
        await this.sendPlayerUpdate({ paused: true });
        const oldPaused = this.paused;
        this.paused = true;
        this.updateData("paused", this.paused);
        this.manager.emit("debug", `Moonlink.js > Player#pause >> Player state changed: paused: ${oldPaused} -> ${this.paused}`);
        this.manager.emit("debug", `Moonlink.js > Player#pause >> Player paused for guild ${this.guildId}`);
        return this;
    }
    async resume(options) {
        const now = Date.now();
        const minResumeInterval = this.manager.options.playerHealth?.resumeDebounce ?? 1000;
        if (this.isResumeInProgress) {
            this.manager.emit("debug", `Moonlink.js > Player#resume >> Resume already in progress for guild ${this.guildId}, skipping.`);
            return this;
        }
        if (now - this.lastResumeAttempt < minResumeInterval) {
            this.manager.emit("debug", `Moonlink.js > Player#resume >> Resume debounced for guild ${this.guildId} (last attempt ${now - this.lastResumeAttempt}ms ago).`);
            return this;
        }
        this.updateActivity();
        if (!this.paused) {
            this.manager.emit("debug", `Moonlink.js > Player#resume >> Player is not paused for guild ${this.guildId}`);
            return this;
        }
        this.isResumeInProgress = true;
        this.lastResumeAttempt = now;
        this.manager.emit("debug", `Moonlink.js > Player#resume -> Sending resume request to node ${this.node.identifier} for guild ${this.guildId}`);
        this.manager.emit("playerTriggeredResume", this);
        try {
            const promise = this.sendPlayerUpdate({ paused: false });
            if (options?.timeout) {
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Resume timed out")), options.timeout));
                await Promise.race([promise, timeoutPromise]);
            }
            else {
                await promise;
            }
            const oldPaused = this.paused;
            this.paused = false;
            this.updateData("paused", this.paused);
            this.manager.emit("debug", `Moonlink.js > Player#resume >> Player state changed: paused: ${oldPaused} -> ${this.paused}`);
            this.manager.emit("debug", `Moonlink.js > Player#resume >> Player resumed for guild ${this.guildId}`);
        }
        finally {
            this.isResumeInProgress = false;
        }
        return this;
    }
    async forward(ms) {
        if (!this.current)
            return this;
        const newPosition = Math.min(this.current.duration, this.current.position + ms);
        return this.seek(newPosition);
    }
    async rewind(ms) {
        if (!this.current)
            return this;
        const newPosition = Math.max(0, this.current.position - ms);
        return this.seek(newPosition);
    }
    async setVoiceState(state) {
        if (state.channelId) {
            this.setVoiceChannelId(state.channelId);
        }
        const selfMute = state.selfMute ?? this.get("selfMute");
        const selfDeaf = state.selfDeaf ?? this.get("selfDeaf");
        this.set("selfMute", selfMute);
        this.set("selfDeaf", selfDeaf);
        await this.connect({ selfMute, selfDeaf });
        return this;
    }
    async toggleMute() {
        return this.setVoiceState({ selfMute: !this.get("selfMute") });
    }
    async toggleDeaf() {
        return this.setVoiceState({ selfDeaf: !this.get("selfDeaf") });
    }
    async search(query, source) {
        return this.manager.search({
            query,
            source,
            node: this.node.identifier
        });
    }
    async stop() {
        this.manager.emit("debug", `Moonlink.js > Player#stop -> Sending stop request to node ${this.node.identifier} for guild ${this.guildId}`);
        this.manager.emit("playerTriggeredStop", this);
        await this.sendPlayerUpdate({ track: { encoded: null } });
        const oldPlaying = this.playing;
        this.playing = false;
        this.updateData("playing", this.playing);
        this.manager.emit("debug", `Moonlink.js > Player#stop >> Player state changed: playing: ${oldPlaying} -> ${this.playing}`);
        const oldTrackTitle = this.current?.title ?? "null";
        this.current = null;
        this.updateData("current", this.current);
        this.manager.emit("debug", `Moonlink.js > Player#stop >> Player state changed: current: ${oldTrackTitle} -> null`);
        this.manager.emit("debug", `Moonlink.js > Player#stop >> Player stopped for guild ${this.guildId}`);
        return this;
    }
    async skip(position) {
        const oldTrack = this.current;
        if (position !== undefined) {
            this.manager.emit("debug", `Moonlink.js > Player#skip -> Skipping to position ${position} in queue for guild ${this.guildId}`);
            const track = this.queue.remove(position);
            if (!track) {
                this.manager.emit("debug", `Moonlink.js > Player#skip >> Invalid queue position for guild ${this.guildId}`);
                return false;
            }
            this.manager.emit("playerTriggeredSkip", this, oldTrack, track, position);
            return await this.play({ track: track instanceof Track_1.Track ? track : new Track_1.Track(track) });
        }
        if (!this.queue.size) {
            if (this.autoPlay) {
                if (!this.current) {
                    this.manager.emit("debug", `Moonlink.js > Player#skip >> Queue is empty and no current track, cannot trigger autoPlay for guild ${this.guildId}`);
                    return false;
                }
                this.manager.emit("debug", `Moonlink.js > Player#skip >> Queue empty, triggering autoPlay for guild ${this.guildId}`);
                return await this.node.handleAutoPlay(this, this.current);
            }
            this.manager.emit("debug", `Moonlink.js > Player#skip >> Queue is empty, stopping player for guild ${this.guildId}`);
            await this.stop();
            return true;
        }
        const nextTrack = this.queue.first;
        this.manager.emit("playerTriggeredSkip", this, oldTrack, nextTrack, 0);
        this.manager.emit("debug", `Moonlink.js > Player#skip -> Skipping to next track in queue for guild ${this.guildId}`);
        return await this.play();
    }
    async seek(position) {
        (0, Util_1.validate)(position, (v) => typeof v === "number" && !isNaN(v) && v >= 0, "Player#seek > Position must be a valid number.");
        this.manager.emit("debug", `Moonlink.js > Player#seek -> Seeking to position ${position}ms for guild ${this.guildId}`);
        this.manager.emit("playerTriggeredSeek", this, position);
        await this.sendPlayerUpdate({ position });
        if (this.current) {
            this.current.position = position;
        }
        this.manager.emit("debug", `Moonlink.js > Player#seek >> Sent seek request to node ${this.node.identifier}`);
        return this;
    }
    setVolume(volume) {
        (0, Util_1.validate)(volume, (v) => typeof v === "number" && !isNaN(v) && v >= 0 && v <= 1000, "Player#setVolume > Volume must be between 0 and 1000.");
        const oldVolume = this.volume;
        this.volume = volume;
        this.manager.emit("playerChangedVolume", this, oldVolume, volume);
        this.manager.emit("debug", `Moonlink.js > Player#setVolume -> Changing volume from ${oldVolume} to ${volume} for guild ${this.guildId}`);
        this.sendPlayerUpdate({ volume });
        this.updateData("volume", this.volume);
        this.manager.emit("debug", `Moonlink.js > Player#setVolume >> Volume updated for guild ${this.guildId}`);
        return this;
    }
    setLoop(loop, count) {
        const oldLoop = this.loop;
        const oldLoopCount = this.loopCount;
        this.loop = loop;
        this.loopCount = count;
        this.manager.emit("playerChangedLoop", this, oldLoop, this.loop, oldLoopCount, this.loopCount);
        this.updateData("loop", this.loop);
        this.updateData("loopCount", this.loopCount);
        this.manager.emit("debug", `Moonlink.js > Player#setLoop >> Loop mode changed from "${oldLoop}" to "${loop}"${count ? ` (count: ${count})` : ""} for guild ${this.guildId}`);
        return this;
    }
    setAutoPlay(autoPlay) {
        this.autoPlay = autoPlay;
        this.manager.emit("playerAutoPlaySet", this, autoPlay);
        this.updateData("autoPlay", this.autoPlay);
        this.manager.emit("debug", `Moonlink.js > Player#setAutoPlay >> AutoPlay set to ${autoPlay} for guild ${this.guildId}`);
        return this;
    }
    setAutoLeave(autoLeave) {
        this.autoLeave = autoLeave;
        this.manager.emit("playerAutoLeaveSet", this, autoLeave);
        this.updateData("autoLeave", this.autoLeave);
        this.manager.emit("debug", `Moonlink.js > Player#setAutoLeave >> AutoLeave set to ${autoLeave} for guild ${this.guildId}`);
        return this;
    }
    shuffle() {
        if (this.queue.size < 2) {
            this.manager.emit("debug", `Moonlink.js > Player#shuffle >> Queue has less than 2 tracks, cannot shuffle for guild ${this.guildId}`);
            return this;
        }
        const oldQueue = [...this.queue.tracks];
        this.manager.emit("debug", `Moonlink.js > Player#shuffle -> Shuffling queue with ${this.queue.size} tracks for guild ${this.guildId}`);
        this.queue.shuffle();
        this.manager.emit("playerTriggeredShuffle", this, oldQueue, this.queue.tracks);
        this.manager.emit("debug", `Moonlink.js > Player#shuffle >> Queue shuffled for guild ${this.guildId}`);
        return this;
    }
    async destroy(reason) {
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;
        this.stopHealthCheck();
        if (this.resumeDebounceTimer) {
            clearTimeout(this.resumeDebounceTimer);
            this.resumeDebounceTimer = undefined;
        }
        if (!reason) {
            const stack = new Error().stack?.split("\n").slice(2, 8).join("\n");
            this.manager.emit("debug", `Moonlink.js > Player#destroy >> Destroy called without reason for guild ${this.guildId}. Stack: ${stack || "unavailable"}`);
        }
        const destroyReason = reason ?? "No reason provided";
        this.manager.emit("debug", `Moonlink.js > Player#destroy -> Destroying player for guild ${this.guildId}. Reason: ${destroyReason}`);
        this.playing = false;
        this.paused = false;
        try {
            await this.disconnect();
        }
        catch (e) {
            this.manager.emit("debug", `Moonlink.js > Player#destroy >> Voice disconnection failed for guild ${this.guildId}: ${e.message}`);
        }
        try {
            await this.node.rest.destroyPlayer(this.guildId);
        }
        catch (e) {
            this.manager.emit("debug", `Moonlink.js > Player#destroy >> Failed to destroy player on node: ${e.message}`);
        }
        this.queue.clear();
        this.manager.emit("playerDestroy", this, reason);
        this.manager.players.players.delete(this.guildId);
        this.manager.emit("debug", `Moonlink.js > Player#destroy >> Player destroyed for guild ${this.guildId}.`);
    }
    async restart() {
        this.manager.emit("debug", `Moonlink.js > Player#restart -> Restarting player for guild ${this.guildId}`);
        this.manager.emit("playerResuming", this);
        if (!this.voiceChannelId) {
            this.manager.emit("debug", `Moonlink.js > Player#restart >> Cannot restart player without a voiceChannelId for guild ${this.guildId}`);
            return false;
        }
        try {
            await this.connect();
        }
        catch (error) {
            this.manager.emit("debug", `Moonlink.js > Player#restart >> Voice connection failed for guild ${this.guildId}. Error: ${error.message}`);
            await this.destroy("Failed to establish voice connection on restart.");
            return false;
        }
        const voicePayload = this.voice.sessionId && this.voice.token && this.voice.endpoint
            ? {
                sessionId: this.voice.sessionId,
                token: this.voice.token,
                endpoint: this.voice.endpoint,
                ...(this.node.isNodeLink ? { channelId: this.voiceChannelId } : {})
            }
            : null;
        if (voicePayload) {
            await this.sendPlayerUpdate({ voice: voicePayload }, true);
        }
        else {
            this.manager.emit("debug", `Moonlink.js > Player#restart >> Voice data missing for guild ${this.guildId}, skipping voice refresh.`);
        }
        if (this.current) {
            const lastKnownPosition = this.get("lastKnownPosition");
            const lastState = this.get("lastState");
            const resumePosition = Math.max(typeof lastKnownPosition === "number" ? lastKnownPosition : 0, typeof lastState?.position === "number" ? lastState.position : 0, this.current.position ?? 0);
            this.manager.emit("debug", `Moonlink.js > Player#restart -> Restoring current track "${this.current.title}" for guild ${this.guildId} at ${resumePosition}ms.`);
            this.playing = true;
            this.paused = false;
            const payload = {
                track: { encoded: this.current.encoded, userData: this.current.userData },
                volume: this.volume,
            };
            if (resumePosition > 0 && this.current.isSeekable) {
                payload.position = resumePosition;
            }
            if (this.audioTrackId) {
                payload.track.audioTrackId = this.audioTrackId;
            }
            if (this.fading)
                payload.fading = this.fading;
            if (this.nextTrack)
                payload.nextTrack = this.nextTrack;
            if (this.loudnessNormalizer !== undefined) {
                payload.loudnessNormalizer = this.loudnessNormalizer;
            }
            await this.sendPlayerUpdate(payload);
            if (resumePosition > 0 && this.current.isSeekable && voicePayload) {
                await (0, Util_1.delay)(2000);
                await this.seek(resumePosition);
            }
            else {
                this.manager.emit("debug", `Moonlink.js > Player#restart >> Seek skipped (position: ${resumePosition}ms, seekable: ${this.current.isSeekable}, voiceReady: ${Boolean(voicePayload)}) for guild ${this.guildId}.`);
            }
        }
        else if (this.queue.size > 0) {
            this.manager.emit("debug", `Moonlink.js > Player#restart -> No current track, playing first from queue for guild ${this.guildId}`);
            await this.play();
        }
        else {
            this.manager.emit("debug", `Moonlink.js > Player#restart >> No track to restore and queue is empty for guild ${this.guildId}`);
            return true;
        }
        this.manager.emit("playerResumed", this);
        return true;
    }
    async transferNode(node) {
        const targetNode = typeof node === "string" ? this.manager.nodes.get(node) : node;
        if (!targetNode || !targetNode.connected || targetNode.identifier === this.node.identifier) {
            this.manager.emit("debug", `Moonlink.js > Player#transferNode >> Invalid target node for guild ${this.guildId}`);
            return false;
        }
        const oldNode = this.node;
        this.manager.emit("debug", `Moonlink.js > Player#transferNode -> Transferring player ${this.guildId} from ${oldNode.identifier} to ${targetNode.identifier}`);
        try {
            await oldNode.rest.destroyPlayer(this.guildId);
        }
        catch (e) {
            this.manager.emit("debug", `Moonlink.js > Player#transferNode >> Failed to destroy player on old node: ${e.message}`);
        }
        this.node = targetNode;
        await this.restart();
        this.manager.emit("playerSwitchedNode", this, oldNode, targetNode);
        this.manager.emit("debug", `Moonlink.js > Player#transferNode >> Successfully transferred player ${this.guildId} to ${targetNode.identifier}`);
        return true;
    }
    setVoiceChannelId(voiceChannelId) {
        (0, Util_1.validate)(voiceChannelId, (v) => typeof v === "string" && v.length > 0, "Player#setVoiceChannelId > Voice channel ID must be a non-empty string.");
        if (this.voiceChannelId === voiceChannelId) {
            this.manager.emit("debug", `Moonlink.js > Player#setVoiceChannelId >> Voice channel already set to ${voiceChannelId} for guild ${this.guildId}`);
            return this;
        }
        const oldChannel = this.voiceChannelId;
        this.voiceChannelId = voiceChannelId;
        this.updateData("voiceChannelId", this.voiceChannelId);
        this.manager.emit("debug", `Moonlink.js > Player#setVoiceChannel >> Voice channel changed from ${oldChannel} to ${voiceChannelId} for guild ${this.guildId}`);
        this.manager.emit("playerVoiceChannelIdSet", this, oldChannel, voiceChannelId);
        return this;
    }
    setTextChannelId(textChannelId) {
        (0, Util_1.validate)(textChannelId, (v) => typeof v === "string" && v.length > 0, "Player#setTextChannelId > Text channel ID must be a non-empty string.");
        if (this.textChannelId === textChannelId) {
            this.manager.emit("debug", `Moonlink.js > Player#setTextChannelId >> Text channel already set to ${textChannelId} for guild ${this.guildId}`);
            return this;
        }
        const oldChannel = this.textChannelId;
        this.textChannelId = textChannelId;
        this.updateData("textChannelId", this.textChannelId);
        this.manager.emit("debug", `Moonlink.js > Player#setTextChannel >> Text channel changed from ${oldChannel} to ${textChannelId} for guild ${this.guildId}`);
        this.manager.emit("playerTextChannelIdSet", this, oldChannel, textChannelId);
        return this;
    }
    async replay() {
        if (!this.current?.encoded) {
            this.manager.emit("debug", `Moonlink.js > Player#replay >> No current track to replay for guild ${this.guildId}`);
            return false;
        }
        this.manager.emit("debug", `Moonlink.js > Player#replay -> Replaying track "${this.current.title}" for guild ${this.guildId}`);
        return await this.play({
            track: this.current,
            position: 0,
        });
    }
    async back() {
        if (this.previous.length === 0) {
            this.manager.emit("debug", `Moonlink.js > Player#back >> No previous tracks available for guild ${this.guildId}`);
            return false;
        }
        const lastTrack = this.previous.pop();
        if (!lastTrack) {
            this.manager.emit("debug", `Moonlink.js > Player#back >> Popped an invalid track from history for guild ${this.guildId}`);
            return false;
        }
        this.manager.emit("debug", `Moonlink.js > Player#back -> Going back to previous track "${lastTrack.title}" for guild ${this.guildId}`);
        if (this.current) {
            this.queue.unshift(this.current);
            this.manager.emit("debug", `Moonlink.js > Player#back >> Pushed current track "${this.current.title}" to the front of the queue.`);
        }
        this.current = lastTrack;
        this.set("isBackPlay", true);
        const played = await this.play({
            track: this.current,
            position: 0
        });
        if (played) {
            this.manager.emit("playerTriggeredBack", this, lastTrack);
            this.manager.emit("debug", `Moonlink.js > Player#back >> Successfully went back for guild ${this.guildId}`);
        }
        else {
            this.manager.emit("debug", `Moonlink.js > Player#back >> Failed to play previous track for guild ${this.guildId}.`);
        }
        return played;
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map