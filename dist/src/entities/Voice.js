"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Voice = void 0;
const types_1 = require("../typings/types");
const Util_1 = require("../Util");
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
    lastMoveAt = 0;
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
    cancelReconnection() {
        if (this.reconnectionTimer) {
            clearTimeout(this.reconnectionTimer);
            this.reconnectionTimer = null;
        }
    }
    setState(state) {
        if (this.state === state)
            return;
        this.state = state;
        if (state === types_1.VoiceConnectionState.DISCONNECTED) {
            this.sessionId = null;
            this.token = null;
            this.endpoint = null;
            this.lastVoiceUpdate = null;
            this.voiceUpdateInFlight = false;
        }
        this.emit("stateChange", state);
    }
    connect(options) {
        if (!this.player.voiceChannelId) {
            this.manager.emit("debug", `Moonlink.js > Voice#connect >> Missing voiceChannelId for guild ${this.player.guildId}, skipping connect.`);
            this.setState(types_1.VoiceConnectionState.DISCONNECTED);
            return Promise.resolve();
        }
        if (this.state === types_1.VoiceConnectionState.CONNECTED && this.sessionId && this.token && this.endpoint) {
            return Promise.resolve();
        }
        if (this.state === types_1.VoiceConnectionState.CONNECTED) {
            this.manager.emit("debug", `Moonlink.js > Voice#connect >> Connected state without voice data for guild ${this.player.guildId}, forcing reconnect.`);
            this.setState(types_1.VoiceConnectionState.DISCONNECTED);
        }
        if (!this.connectPromise) {
            this.connectPromise = new Promise((resolve, reject) => {
                if (this.state === types_1.VoiceConnectionState.CONNECTING) {
                    const onConnect = () => {
                        this.off('disconnect', onDisconnect);
                        resolve();
                    };
                    const onDisconnect = (err) => {
                        this.off('connect', onConnect);
                        reject(err || new Error("Connection was disconnected."));
                    };
                    this.once('connect', onConnect);
                    this.once('disconnect', onDisconnect);
                    return;
                }
                this.setState(types_1.VoiceConnectionState.CONNECTING);
                const payload = {
                    op: 4,
                    d: {
                        guild_id: this.player.guildId,
                        channel_id: this.player.voiceChannelId,
                        self_deaf: options.selfDeaf,
                        self_mute: options.selfMute,
                    },
                };
                this.manager.send(this.player.guildId, payload);
                const timeout = this.manager.options.voiceConnection?.timeout ?? 15000;
                this.connectionTimeout = setTimeout(() => {
                    this.connectPromise = null;
                    this.disconnect().catch(() => { });
                    reject(new Error(`Voice connection timed out after ${timeout}ms`));
                }, timeout);
                this.once("connect", () => {
                    if (this.connectionTimeout)
                        clearTimeout(this.connectionTimeout);
                    this.connectionTimeout = null;
                    this.connectPromise = null;
                    resolve();
                });
                this.once("disconnect", (err) => {
                    if (this.connectionTimeout)
                        clearTimeout(this.connectionTimeout);
                    this.connectionTimeout = null;
                    this.connectPromise = null;
                    reject(err || new Error("Connection was disconnected during connection attempt."));
                });
            });
        }
        return this.connectPromise;
    }
    disconnect() {
        if (this.state === types_1.VoiceConnectionState.DISCONNECTED) {
            return Promise.resolve();
        }
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }
        this.connectPromise = null;
        if (this.state === types_1.VoiceConnectionState.DESTROYED) {
            this.setState(types_1.VoiceConnectionState.DISCONNECTED);
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            const timeout = this.manager.options.voiceConnection?.timeout ?? 15000;
            const onDisconnect = () => {
                clearTimeout(disconnectTimeout);
                resolve();
            };
            const disconnectTimeout = setTimeout(() => {
                this.off('disconnect', onDisconnect);
                this.setState(types_1.VoiceConnectionState.DISCONNECTED);
                resolve();
            }, timeout);
            this.once('disconnect', onDisconnect);
            const payload = {
                op: 4,
                d: {
                    guild_id: this.player.guildId,
                    channel_id: null,
                    self_deaf: false,
                    self_mute: false,
                },
            };
            this.manager.send(this.player.guildId, payload);
        });
    }
    async handleStateUpdate(data) {
        if (!data.channel_id) {
            this.isMoving = false;
            this.cancelReconnection();
            const oldChannelId = this.player.voiceChannelId;
            this.player.voiceChannelId = null;
            this.player.connected = false;
            this.player.playing = false;
            this.player.paused = false;
            this.player.set("userInitiatedConnect", false);
            this.setState(types_1.VoiceConnectionState.DISCONNECTED);
            this.emit("disconnect");
            this.manager.emit("playerDisconnected", this.player);
            this.manager.emit("debug", `Moonlink.js > Voice#handleStateUpdate >> Bot disconnected from voice channel (previous: ${oldChannelId ?? "none"}) for guild ${this.player.guildId}.`);
            if (this.player.autoLeave) {
                await this.player.destroy("Disconnected from voice channel");
            }
            return;
        }
        if (this.state === types_1.VoiceConnectionState.DESTROYED)
            return;
        if (this.player.voiceChannelId && this.player.voiceChannelId !== data.channel_id) {
            this.isMoving = true;
            this.lastMoveAt = Date.now();
            const oldChannelId = this.player.voiceChannelId;
            this.player.voiceChannelId = data.channel_id;
            this.manager.emit('playerMoved', this.player, oldChannelId, data.channel_id);
            this.manager.emit("debug", `Moonlink.js > Voice#handleStateUpdate >> Bot moved from ${oldChannelId} to ${data.channel_id}. Preserving playback for guild ${this.player.guildId}.`);
            this.sessionId = null;
            this.token = null;
            this.endpoint = null;
            this.lastVoiceUpdate = null;
            this.voiceUpdateInFlight = false;
            this.setState(types_1.VoiceConnectionState.DISCONNECTED);
            if (data.session_id)
                this.sessionId = data.session_id;
            this.checkCompletion();
            this.player.stuckDetectionCount = 0;
            this.player.silentDetectionCount = 0;
            this.player.updateActivity();
            return;
        }
        this.player.voiceChannelId = data.channel_id;
        if (data.session_id)
            this.sessionId = data.session_id;
        this.checkCompletion();
    }
    handleServerUpdate(data) {
        if (this.state === types_1.VoiceConnectionState.DESTROYED)
            return;
        this.token = data.token;
        this.endpoint = data.endpoint;
        this.checkCompletion();
    }
    check(connected) {
        if (!this.player.playing && this.player.queue.isEmpty) {
            this.cancelReconnection();
            this.player.set("consecutiveConnectionFailures", 0);
            this.manager.emit("debug", `Player ${this.player.guildId} is idle, clearing any pending reconnection checks.`);
            return;
        }
        if (!connected && (!this.player.get("userInitiatedConnect") || !this.player.voiceChannelId)) {
            this.cancelReconnection();
            this.player.set("consecutiveConnectionFailures", 0);
            this.lastConnectionStatus = false;
            this.manager.emit("debug", `Player ${this.player.guildId} recovery skipped: connection not user-initiated or missing voiceChannelId.`);
            return;
        }
        if (connected) {
            if (!this.lastConnectionStatus) {
                this.manager.emit("debug", `Player ${this.player.guildId} reconnected. Clearing recovery timer.`);
                this.cancelReconnection();
                this.player.set("consecutiveConnectionFailures", 0);
                this.lastConnectionStatus = true;
            }
        }
        else {
            if (this.lastConnectionStatus) {
                this.manager.emit("debug", `Player ${this.player.guildId} connection lost. Starting 10s recovery timer.`);
                this.lastConnectionStatus = false;
                this.cancelReconnection();
                this.reconnectionTimer = setTimeout(() => {
                    this.reconnectionTimer = null;
                    if (!this.player.connected && this.player.voiceChannelId && this.player.get("userInitiatedConnect")) {
                        this.manager.emit("debug", `Player ${this.player.guildId} still disconnected after 10s. Attempting recovery.`);
                        this.recover();
                    }
                }, 10000);
            }
        }
    }
    async recover() {
        if (!this.player.get("userInitiatedConnect") || !this.player.voiceChannelId) {
            this.manager.emit("debug", `Player ${this.player.guildId} recovery skipped: connection not user-initiated or missing voiceChannelId.`);
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
                await this.player.restart();
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
        if (this.sessionId && this.token && this.endpoint) {
            const voicePayload = {
                sessionId: this.sessionId,
                token: this.token,
                endpoint: this.endpoint,
                channelId: this.player.voiceChannelId
            };
            const samePayload = this.lastVoiceUpdate
                && this.lastVoiceUpdate.sessionId === voicePayload.sessionId
                && this.lastVoiceUpdate.token === voicePayload.token
                && this.lastVoiceUpdate.endpoint === voicePayload.endpoint
                && this.lastVoiceUpdate.channelId === voicePayload.channelId;
            if (samePayload && (this.state === types_1.VoiceConnectionState.CONNECTED || this.voiceUpdateInFlight)) {
                return;
            }
            this.voiceUpdateInFlight = true;
            this.player.updatePlayer({ voice: voicePayload }, true).then(async () => {
                this.voiceUpdateInFlight = false;
                this.lastVoiceUpdate = { ...voicePayload };
                this.setState(types_1.VoiceConnectionState.CONNECTED);
                this.emit("connect");
                this.isMoving = false;
            }).catch(e => {
                this.voiceUpdateInFlight = false;
                this.lastVoiceUpdate = null;
                this.manager.emit("debug", `Failed to send voice update: ${e.message}`);
                this.isMoving = false;
                this.emit("disconnect", e);
            });
        }
    }
    destroy() {
        this.disconnect().catch(() => { });
        this.setState(types_1.VoiceConnectionState.DESTROYED);
    }
}
exports.Voice = Voice;
//# sourceMappingURL=Voice.js.map