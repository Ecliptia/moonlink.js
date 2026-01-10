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
    setState(state) {
        if (this.state === state)
            return;
        this.state = state;
        if (state === types_1.VoiceConnectionState.DISCONNECTED) {
            this.sessionId = null;
            this.token = null;
            this.endpoint = null;
        }
        this.emit("stateChange", state);
    }
    connect(options) {
        if (this.state === types_1.VoiceConnectionState.CONNECTED) {
            return Promise.resolve();
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
                        self_deaf: this.player.get("selfDeaf"),
                        self_mute: this.player.get("selfMute"),
                    },
                };
                this.manager.send(this.player.guildId, payload);
                const timeout = this.manager.options.voiceConnection?.timeout ?? 15000;
                this.connectionTimeout = setTimeout(() => {
                    this.disconnect();
                    this.connectPromise = null;
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
        if (this.state === types_1.VoiceConnectionState.DISCONNECTED || this.state === types_1.VoiceConnectionState.DESTROYED) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            const timeout = this.manager.options.voiceConnection?.timeout ?? 15000;
            const disconnectTimeout = setTimeout(() => {
                this.off('disconnect', onDisconnect);
                this.setState(types_1.VoiceConnectionState.DISCONNECTED);
                reject(new Error(`Voice disconnection confirmation timed out after ${timeout}ms`));
            }, timeout);
            const onDisconnect = (err) => {
                clearTimeout(disconnectTimeout);
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            };
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
        if (this.state === types_1.VoiceConnectionState.DESTROYED || this.isMoving)
            return;
        if (!data.channel_id) {
            this.emit("disconnect");
            this.setState(types_1.VoiceConnectionState.DISCONNECTED);
            return;
        }
        if (this.player.voiceChannelId && this.player.voiceChannelId !== data.channel_id) {
            this.isMoving = true;
            this.manager.emit('playerMoved', this.player, this.player.voiceChannelId, data.channel_id);
            this.player.voiceChannelId = data.channel_id;
            try {
                await this.player.node.rest.destroyPlayer(this.player.guildId);
                await this.player.restart();
            }
            catch (e) {
                this.manager.emit("debug", `Error during channel move restart: ${e.message}`);
            }
            finally {
                this.isMoving = false;
            }
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
            if (this.reconnectionTimer) {
                clearTimeout(this.reconnectionTimer);
                this.reconnectionTimer = null;
            }
            this.player.set("consecutiveConnectionFailures", 0);
            this.manager.emit("debug", `Player ${this.player.guildId} is idle, clearing any pending reconnection checks.`);
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
                this.manager.emit("debug", `Player ${this.player.guildId} connection lost. Starting 20s recovery timer.`);
                this.lastConnectionStatus = false;
                if (this.reconnectionTimer) {
                    clearTimeout(this.reconnectionTimer);
                }
                this.reconnectionTimer = setTimeout(() => {
                    this.reconnectionTimer = null;
                    if (!this.player.connected) {
                        this.manager.emit("debug", `Player ${this.player.guildId} still disconnected after 20s. Attempting recovery.`);
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
            this.player.node.rest.updatePlayer(this.player.guildId, {
                voice: {
                    sessionId: this.sessionId,
                    token: this.token,
                    endpoint: this.endpoint
                }
            }).then(() => {
                this.isMoving = false;
                this.setState(types_1.VoiceConnectionState.CONNECTED);
                this.emit("connect");
            }).catch(e => {
                this.manager.emit("debug", `Failed to send voice update: ${e.message}`);
                this.emit("disconnect", e);
            });
        }
    }
    destroy() {
        this.setState(types_1.VoiceConnectionState.DESTROYED);
        this.disconnect();
    }
}
exports.Voice = Voice;
//# sourceMappingURL=Voice.js.map