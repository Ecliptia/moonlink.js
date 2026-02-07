import { Player } from "./Player";
import { VoiceConnectionState, VoiceStateUpdate, VoiceServerUpdate } from "../typings/types";
import { EventEmitter } from "../Util";

interface VoiceEvents {
    stateChange: (state: VoiceConnectionState) => void;
    connect: () => void;
    disconnect: (err?: Error) => void;
}

export class Voice extends EventEmitter<VoiceEvents> {
    public player: Player;
    public state: VoiceConnectionState = VoiceConnectionState.DISCONNECTED;

    public sessionId: string | null = null;
    public token: string | null = null;
    public endpoint: string | null = null;
    public isMoving: boolean = false;

    private connectionTimeout: NodeJS.Timeout | null = null;
    private connectPromise: Promise<void> | null = null;
    private reconnectionTimer: NodeJS.Timeout | null = null;
    private lastConnectionStatus: boolean = true;
    private lastVoiceUpdate: { sessionId: string; token: string; endpoint: string; channelId?: string | null } | null = null;
    private voiceUpdateInFlight: boolean = false;

    constructor(player: Player) {
        super();
        this.player = player;
        this.on('stateChange', (state) => {
            this.player.connected = state === VoiceConnectionState.CONNECTED;
        });
    }

    public get manager() {
        return this.player.manager;
    }

    private setState(state: VoiceConnectionState) {
        if (this.state === state) return;
        this.state = state;
        if (state === VoiceConnectionState.DISCONNECTED) {
            this.sessionId = null;
            this.token = null;
            this.endpoint = null;
            this.lastVoiceUpdate = null;
            this.voiceUpdateInFlight = false;
        }
        this.emit("stateChange", state);
    }

    public connect(options: { selfDeaf: boolean; selfMute: boolean }): Promise<void> {
        if (!this.player.voiceChannelId) {
            this.manager.emit("debug", `Moonlink.js > Voice#connect >> Missing voiceChannelId for guild ${this.player.guildId}, skipping connect.`);
            this.setState(VoiceConnectionState.DISCONNECTED);
            return Promise.resolve();
        }

        if (this.state === VoiceConnectionState.CONNECTED && this.sessionId && this.token && this.endpoint) {
            return Promise.resolve();
        }

        if (this.state === VoiceConnectionState.CONNECTED) {
            this.manager.emit("debug", `Moonlink.js > Voice#connect >> Connected state without voice data for guild ${this.player.guildId}, forcing reconnect.`);
            this.setState(VoiceConnectionState.DISCONNECTED);
        }

        if (!this.connectPromise) {
            this.connectPromise = new Promise((resolve, reject) => {
                if (this.state === VoiceConnectionState.CONNECTING) {
                    const onConnect = () => {
                        this.off('disconnect', onDisconnect);
                        resolve();
                    }
                    const onDisconnect = (err?: Error) => {
                        this.off('connect', onConnect);
                        reject(err || new Error("Connection was disconnected."));
                    }
                    this.once('connect', onConnect);
                    this.once('disconnect', onDisconnect);
                    return;
                }
                
                this.setState(VoiceConnectionState.CONNECTING);
                
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
                    this.connectPromise = null;
                    this.disconnect().catch(() => {});
                    reject(new Error(`Voice connection timed out after ${timeout}ms`));
                }, timeout);

                this.once("connect", () => {
                    if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
                    this.connectionTimeout = null;
                    this.connectPromise = null;
                    resolve();
                });

                this.once("disconnect", (err?: Error) => {
                    if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
                    this.connectionTimeout = null;
                    this.connectPromise = null;
                    reject(err || new Error("Connection was disconnected during connection attempt."));
                });
            });
        }
        
        return this.connectPromise;
    }

    public disconnect(): Promise<void> {
        if (this.state === VoiceConnectionState.DISCONNECTED) {
            return Promise.resolve();
        }

        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }
        this.connectPromise = null;

        if (this.state === VoiceConnectionState.CONNECTING || !this.player.voiceChannelId) {
            this.manager.emit("debug", `Moonlink.js > Voice#disconnect >> Skipping voice disconnect for guild ${this.player.guildId} (state: ${VoiceConnectionState[this.state]}, voiceChannelId: ${this.player.voiceChannelId ?? "null"}).`);
            this.setState(VoiceConnectionState.DISCONNECTED);
            this.emit("disconnect");
            return Promise.resolve();
        }

        if (this.state === VoiceConnectionState.DESTROYED) {
            this.setState(VoiceConnectionState.DISCONNECTED);
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
                this.setState(VoiceConnectionState.DISCONNECTED);
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

    public async handleStateUpdate(data: VoiceStateUpdate): Promise<void> {
        if (!data.channel_id) {
            this.emit("disconnect");
            this.setState(VoiceConnectionState.DISCONNECTED);
            return;
        }

        if (this.state === VoiceConnectionState.DESTROYED || this.isMoving) return;

        if (this.player.voiceChannelId && this.player.voiceChannelId !== data.channel_id) {
            this.isMoving = true;
            this.manager.emit('playerMoved', this.player, this.player.voiceChannelId, data.channel_id);
            this.player.voiceChannelId = data.channel_id;

            try {
                await this.player.node.rest.destroyPlayer(this.player.guildId);
                await this.player.restart();
            } catch (e) {
                this.manager.emit("debug", `Error during channel move restart: ${(e as Error).message}`);
            } finally {
                this.isMoving = false;
            }
            return;
        }

        this.player.voiceChannelId = data.channel_id;
        if (data.session_id) this.sessionId = data.session_id;

        this.checkCompletion();
    }

    public handleServerUpdate(data: VoiceServerUpdate): void {
        if (this.state === VoiceConnectionState.DESTROYED) return;

        this.token = data.token;
        this.endpoint = data.endpoint;
        this.checkCompletion();
    }
        
    public check(connected: boolean): void {
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
        } else {
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

    private async recover(): Promise<void> {
        if (!this.player.get("userInitiatedConnect")) {
            this.manager.emit("debug", `Player ${this.player.guildId} recovery skipped: connection not user-initiated.`);
            return;
        }

        try {
            this.manager.emit("debug", `Player ${this.player.guildId} recovery: Attempting soft reconnect.`);
            const store = {
                voiceChannelId: this.player.voiceChannelId,
                selfDeaf: this.player.get<boolean>("selfDeaf"),
                selfMute: this.player.get<boolean>("selfMute"),
            }

            await this.disconnect();
            this.player.setVoiceChannelId(store.voiceChannelId);
            await this.connect({
                selfDeaf: store.selfDeaf,
                selfMute: store.selfMute,
            })
        } catch (softError) {
            this.manager.emit("debug", `Player ${this.player.guildId} recovery: Soft reconnect failed. Attempting hard restart. Error: ${(softError as Error).message}`);
            try {
                this.isMoving = true;
                await this.player.node.rest.destroyPlayer(this.player.guildId);
                await this.player.restart();
            } catch (hardError) {
                this.manager.emit("debug", `Player ${this.player.guildId} recovery: Hard restart failed. Destroying player. Error: ${(hardError as Error).message}`);
                await this.player.destroy("RecoveryFailed");
            } finally {
                this.isMoving = false;
            }
        }
    }
    
    private checkCompletion(): void {        
        if (this.sessionId && this.token && this.endpoint) {
            const voicePayload: { sessionId: string; token: string; endpoint: string; channelId?: string | null } = {
                sessionId: this.sessionId,
                token: this.token,
                endpoint: this.endpoint
            };
            if (this.player.node.isNodeLink) {
                voicePayload.channelId = this.player.voiceChannelId;
            }

            const samePayload = this.lastVoiceUpdate
                && this.lastVoiceUpdate.sessionId === voicePayload.sessionId
                && this.lastVoiceUpdate.token === voicePayload.token
                && this.lastVoiceUpdate.endpoint === voicePayload.endpoint
                && this.lastVoiceUpdate.channelId === voicePayload.channelId;

            if (samePayload && (this.state === VoiceConnectionState.CONNECTED || this.voiceUpdateInFlight)) {
                return;
            }

            this.voiceUpdateInFlight = true;
            this.player.updatePlayer({ voice: voicePayload }, true).then(() => {
                this.voiceUpdateInFlight = false;
                this.lastVoiceUpdate = { ...voicePayload };
                this.isMoving = false;
                this.setState(VoiceConnectionState.CONNECTED);
                this.emit("connect");
            }).catch(e => {
                this.voiceUpdateInFlight = false;
                this.lastVoiceUpdate = null;
                this.manager.emit("debug", `Failed to send voice update: ${e.message}`);
                this.emit("disconnect", e);
            });
        }
    }

    public destroy(): void {
        this.disconnect().catch(() => {});
        this.setState(VoiceConnectionState.DESTROYED);
    }
}
