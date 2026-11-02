"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Voice = void 0;
const types_1 = require("../typings/types");
const Util_1 = require("../Util");
const PlaybackGuard_1 = require("../players/PlaybackGuard");
class Voice extends Util_1.EventEmitter {
    player;
    state = types_1.VoiceConnectionState.DISCONNECTED;
    sessionId = null;
    token = null;
    endpoint = null;
    isMoving = false;
    connectionTimeout = null;
    connectPromise = null;
    reconnectionTimer = null;
    lastConnectionStatus = true;
    lastVoiceUpdate = null;
    voiceUpdateInFlight = false;
    moveNonce = 0;
    pendingPlaybackRestoreNonce = null;
    moveRestartInFlight = false;
    lastMoveAt = 0;
    generation = 0;
    acceptingPackets = true;
    inFlight;
    awaitingServer = false;
    serverBeforeState;
    movePlaybackTicket;
    disconnectPromise;
    disconnectTimeout = null;
    finishDisconnect;
    constructor(player) {
        super();
        this.player = player;
        this.on('stateChange', (state) => {
            this.player.connected = state === types_1.VoiceConnectionState.CONNECTED;
        });
    }
    get manager() {
        return this.player.manager;
    }
    wasRecentlyMoved(windowMs = 8000) {
        return Date.now() - this.lastMoveAt <= windowMs;
    }
    setState(state) {
        if (this.state === state)
            return;
        this.state = state;
        this.emit("stateChange", state);
    }
    isDestroyed() {
        return this.player.destroyed || this.state === types_1.VoiceConnectionState.DESTROYED;
    }
    invalidateCredentials() {
        this.generation++;
        this.sessionId = this.token = this.endpoint = null;
        this.lastVoiceUpdate = null;
        this.serverBeforeState = undefined;
        this.awaitingServer = false;
        this.pendingPlaybackRestoreNonce = null;
        this.isMoving = false;
        if (this.reconnectionTimer)
            clearTimeout(this.reconnectionTimer);
        this.reconnectionTimer = null;
    }
    connect(options) {
        if (this.isDestroyed())
            return Promise.reject(new Error('Voice is destroyed'));
        if (this.disconnectPromise)
            return this.disconnectPromise.then(() => this.connect(options));
        if (!this.player.voiceChannelId)
            return Promise.reject(new Error('Missing voiceChannelId'));
        if (this.state === types_1.VoiceConnectionState.CONNECTED && this.sessionId && this.token && this.endpoint)
            return Promise.resolve();
        if (this.connectPromise)
            return this.connectPromise;
        this.invalidateCredentials();
        this.acceptingPackets = true;
        let resolveAttempt;
        let rejectAttempt;
        const pending = new Promise((resolve, reject) => { resolveAttempt = resolve; rejectAttempt = reject; });
        this.connectPromise = pending;
        const cleanup = () => {
            if (this.connectionTimeout)
                clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
            this.off('connect', connected);
            this.off('disconnect', disconnected);
            if (this.connectPromise === pending)
                this.connectPromise = null;
        };
        const connected = () => { cleanup(); resolveAttempt(); };
        const disconnected = (error) => { cleanup(); rejectAttempt(error ?? new Error('Voice disconnected during connection attempt')); };
        this.once('connect', connected);
        this.once('disconnect', disconnected);
        const timeout = this.manager.options.voiceConnection?.timeout ?? 15000;
        this.connectionTimeout = setTimeout(() => {
            void this.disconnectWithReason(new Error(`Voice connection timed out after ${timeout}ms`));
        }, timeout);
        this.setState(types_1.VoiceConnectionState.CONNECTING);
        if (this.connectPromise !== pending || this.isDestroyed())
            return pending;
        try {
            this.manager.send(this.player.guildId, { op: 4, d: { guild_id: this.player.guildId, channel_id: this.player.voiceChannelId, self_deaf: options.selfDeaf, self_mute: options.selfMute } });
        }
        catch (error) {
            this.invalidateCredentials();
            this.setState(types_1.VoiceConnectionState.DISCONNECTED);
            this.emit('disconnect', error);
        }
        return pending;
    }
    disconnect() {
        return this.disconnectWithReason();
    }
    disconnectWithReason(error) {
        if (this.isDestroyed())
            return Promise.resolve();
        if (this.disconnectPromise)
            return this.disconnectPromise;
        const active = this.state !== types_1.VoiceConnectionState.DISCONNECTED || this.connectPromise || this.sessionId;
        let finish;
        const pending = new Promise(resolve => { finish = resolve; });
        this.disconnectPromise = pending;
        this.finishDisconnect = () => {
            if (this.disconnectTimeout)
                clearTimeout(this.disconnectTimeout);
            this.disconnectTimeout = null;
            this.disconnectPromise = undefined;
            this.finishDisconnect = undefined;
            finish();
        };
        this.acceptingPackets = false;
        this.invalidateCredentials();
        this.setState(types_1.VoiceConnectionState.DISCONNECTED);
        this.emit('disconnect', error);
        if (!active || this.state === types_1.VoiceConnectionState.DESTROYED) {
            this.finishDisconnect?.();
            return pending;
        }
        if (!this.disconnectPromise)
            return pending;
        this.disconnectTimeout = setTimeout(() => this.finishDisconnect?.(), this.manager.options.voiceConnection?.timeout ?? 15000);
        try {
            this.manager.send(this.player.guildId, { op: 4, d: { guild_id: this.player.guildId, channel_id: null, self_deaf: false, self_mute: false } });
        }
        catch {
            this.finishDisconnect?.();
        }
        return pending;
    }
    async handleStateUpdate(data) {
        if (this.isDestroyed())
            return;
        if (data.channel_id === null) {
            this.acceptingPackets = false;
            this.invalidateCredentials();
            this.setState(types_1.VoiceConnectionState.DISCONNECTED);
            this.emit('disconnect');
            this.finishDisconnect?.();
            this.player.set('userInitiatedConnect', false);
            return;
        }
        if (!this.acceptingPackets || this.disconnectPromise)
            return;
        const moved = this.player.voiceChannelId !== data.channel_id;
        const changed = moved || this.sessionId !== data.session_id;
        if (changed) {
            const server = this.serverBeforeState;
            const oldChannel = this.player.voiceChannelId;
            this.invalidateCredentials();
            this.awaitingServer = !server;
            this.player.voiceChannelId = data.channel_id;
            this.sessionId = data.session_id;
            if (server) {
                this.token = server.token;
                this.endpoint = server.endpoint;
            }
            const generation = this.generation;
            this.setState(types_1.VoiceConnectionState.CONNECTING);
            if (generation !== this.generation || this.isDestroyed())
                return;
            if (moved) {
                this.isMoving = true;
                this.lastMoveAt = Date.now();
                this.moveNonce++;
                this.movePlaybackTicket = (0, PlaybackGuard_1.playbackGuard)(this.player).ticket;
                this.pendingPlaybackRestoreNonce = this.player.current && this.player.playing && !this.player.paused ? this.moveNonce : null;
                this.manager.emit('playerMoved', this.player, oldChannel, data.channel_id);
                this.player.stuckDetectionCount = this.player.silentDetectionCount = 0;
                this.player.updateActivity();
            }
        }
        else
            this.serverBeforeState = undefined;
        this.checkCompletion();
    }
    handleServerUpdate(data) {
        if (!this.acceptingPackets || this.isDestroyed() || this.disconnectPromise)
            return;
        if (this.token === data.token && this.endpoint === data.endpoint) {
            this.checkCompletion();
            return;
        }
        this.generation++;
        this.lastVoiceUpdate = null;
        if (!this.awaitingServer)
            this.serverBeforeState = data;
        this.awaitingServer = false;
        this.token = data.token;
        this.endpoint = data.endpoint;
        this.setState(types_1.VoiceConnectionState.CONNECTING);
        this.checkCompletion();
    }
    check(connected) {
        if (this.isDestroyed())
            return;
        if (!this.player.playing && this.player.queue.isEmpty) {
            if (this.reconnectionTimer) {
                clearTimeout(this.reconnectionTimer);
                this.reconnectionTimer = null;
            }
            this.player.set("consecutiveConnectionFailures", 0);
            this.manager.emit("debug", `Player ${this.player.guildId} is idle, clearing any pending reconnection checks.`);
            return;
        }
        if (!connected && !this.player.get("userInitiatedConnect")) {
            if (this.reconnectionTimer) {
                clearTimeout(this.reconnectionTimer);
                this.reconnectionTimer = null;
            }
            this.player.set("consecutiveConnectionFailures", 0);
            this.lastConnectionStatus = false;
            this.manager.emit("debug", `Player ${this.player.guildId} recovery skipped: connection not user-initiated.`);
            return;
        }
        if (connected) {
            if (!this.lastConnectionStatus) {
                this.manager.emit("debug", `Player ${this.player.guildId} reconnected. Clearing recovery timer.`);
                if (this.reconnectionTimer) {
                    clearTimeout(this.reconnectionTimer);
                    this.reconnectionTimer = null;
                }
                this.player.set("consecutiveConnectionFailures", 0);
                this.lastConnectionStatus = true;
            }
        }
        else {
            if (this.lastConnectionStatus) {
                this.manager.emit("debug", `Player ${this.player.guildId} connection lost. Starting 10s recovery timer.`);
                this.lastConnectionStatus = false;
                if (this.reconnectionTimer) {
                    clearTimeout(this.reconnectionTimer);
                }
                this.reconnectionTimer = setTimeout(() => {
                    this.reconnectionTimer = null;
                    if (!this.player.connected) {
                        this.manager.emit("debug", `Player ${this.player.guildId} still disconnected after 10s. Attempting recovery.`);
                        this.recover();
                    }
                }, 10000);
            }
        }
    }
    async recover() {
        if (!this.player.get("userInitiatedConnect")) {
            this.manager.emit("debug", `Player ${this.player.guildId} recovery skipped: connection not user-initiated.`);
            return;
        }
        try {
            this.manager.emit("debug", `Player ${this.player.guildId} recovery: Attempting soft reconnect.`);
            const store = {
                voiceChannelId: this.player.voiceChannelId,
                selfDeaf: this.player.get("selfDeaf"),
                selfMute: this.player.get("selfMute"),
            };
            await this.disconnect();
            this.player.setVoiceChannelId(store.voiceChannelId);
            await this.connect({
                selfDeaf: store.selfDeaf,
                selfMute: store.selfMute,
            });
        }
        catch (softError) {
            this.manager.emit("debug", `Player ${this.player.guildId} recovery: Soft reconnect failed. Attempting hard restart. Error: ${softError.message}`);
            try {
                this.isMoving = true;
                await this.player.node.rest.destroyPlayer(this.player.guildId);
                await this.player.restart({ startQueued: false });
            }
            catch (hardError) {
                this.manager.emit("debug", `Player ${this.player.guildId} recovery: Hard restart failed. Destroying player. Error: ${hardError.message}`);
                await this.player.destroy("RecoveryFailed");
            }
            finally {
                this.isMoving = false;
            }
        }
    }
    checkCompletion() {
        if (this.inFlight || this.isDestroyed() || this.disconnectPromise || this.awaitingServer || !this.sessionId || !this.token || !this.endpoint)
            return;
        const payload = { sessionId: this.sessionId, token: this.token, endpoint: this.endpoint, channelId: this.player.voiceChannelId };
        const same = this.lastVoiceUpdate && Object.keys(payload).every(key => payload[key] === this.lastVoiceUpdate[key]);
        if (same && this.state === types_1.VoiceConnectionState.CONNECTED)
            return;
        const generation = this.generation;
        const node = this.player.node;
        const operation = {};
        this.inFlight = operation;
        this.voiceUpdateInFlight = true;
        const active = () => generation === this.generation && this.player.node === node && !this.player.destroyed && this.state !== types_1.VoiceConnectionState.DESTROYED;
        void (async () => {
            try {
                const response = await this.player.updateVoice(payload);
                if (!active())
                    return;
                if (response == null)
                    throw new Error('Backend did not acknowledge voice credentials');
                this.lastVoiceUpdate = payload;
                if (this.serverBeforeState?.token === payload.token)
                    this.serverBeforeState = undefined;
                this.setState(types_1.VoiceConnectionState.CONNECTED);
                if (!active())
                    return;
                this.emit('connect');
                const nonce = this.pendingPlaybackRestoreNonce;
                if (active() && this.isMoving && nonce !== null && nonce === this.moveNonce && !this.moveRestartInFlight && (0, PlaybackGuard_1.playbackGuard)(this.player).isCurrent(this.movePlaybackTicket)) {
                    this.moveRestartInFlight = true;
                    try {
                        await this.player.restart({ startQueued: false });
                    }
                    finally {
                        this.moveRestartInFlight = false;
                    }
                }
                if (active() && nonce === this.moveNonce) {
                    this.pendingPlaybackRestoreNonce = null;
                    this.isMoving = false;
                }
            }
            catch (error) {
                if (!active())
                    return;
                this.invalidateCredentials();
                this.setState(types_1.VoiceConnectionState.DISCONNECTED);
                this.manager.emit('debug', `NyxLink > Voice > Update failed: ${error.message}`);
                this.emit('disconnect', error);
            }
            finally {
                if (this.inFlight === operation) {
                    this.inFlight = undefined;
                    this.voiceUpdateInFlight = false;
                    this.checkCompletion();
                }
            }
        })();
    }
    destroy() {
        if (this.isDestroyed())
            return;
        const active = this.state !== types_1.VoiceConnectionState.DISCONNECTED;
        this.acceptingPackets = false;
        this.invalidateCredentials();
        this.setState(types_1.VoiceConnectionState.DESTROYED);
        this.emit('disconnect', new Error('Voice destroyed'));
        this.finishDisconnect?.();
        if (active) {
            try {
                this.manager.send(this.player.guildId, { op: 4, d: { guild_id: this.player.guildId, channel_id: null, self_deaf: false, self_mute: false } });
            }
            catch { }
        }
    }
}
exports.Voice = Voice;
//# sourceMappingURL=Voice.js.map