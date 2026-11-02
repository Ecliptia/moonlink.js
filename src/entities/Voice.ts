import { Player } from "./Player";
import { VoiceConnectionState, VoiceStateUpdate, VoiceServerUpdate } from "../typings/types";
import { EventEmitter } from "../Util";
import { playbackGuard } from "../players/PlaybackGuard";

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
    private moveNonce: number = 0;
    private pendingPlaybackRestoreNonce: number | null = null;
    private moveRestartInFlight: boolean = false;
    private lastMoveAt: number = 0;
    private generation = 0;
    private acceptingPackets = true;
    private inFlight?: object;
    private awaitingServer = false;
    private serverBeforeState?: VoiceServerUpdate;
    private movePlaybackTicket?: number;
    private disconnectPromise?: Promise<void>;
    private disconnectTimeout: NodeJS.Timeout | null = null;
    private finishDisconnect?: () => void;

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

    public wasRecentlyMoved(windowMs: number = 8000): boolean {
        return Date.now() - this.lastMoveAt <= windowMs;
    }

    private setState(state: VoiceConnectionState) {
        if (this.state === state) return;
        this.state = state;
        this.emit("stateChange", state);
    }

    private isDestroyed(): boolean {
        return this.player.destroyed || this.state === VoiceConnectionState.DESTROYED;
    }

    private invalidateCredentials(): void {
        this.generation++;
        this.sessionId = this.token = this.endpoint = null;
        this.lastVoiceUpdate = null;
        this.serverBeforeState = undefined;
        this.awaitingServer = false;
        this.pendingPlaybackRestoreNonce = null;
        this.isMoving = false;
        if (this.reconnectionTimer) clearTimeout(this.reconnectionTimer);
        this.reconnectionTimer = null;
    }

    public connect(options: { selfDeaf: boolean; selfMute: boolean }): Promise<void> {
        if (this.isDestroyed()) return Promise.reject(new Error('Voice is destroyed'));
        if (this.disconnectPromise) return this.disconnectPromise.then(() => this.connect(options));
        if (!this.player.voiceChannelId) return Promise.reject(new Error('Missing voiceChannelId'));
        if (this.state === VoiceConnectionState.CONNECTED && this.sessionId && this.token && this.endpoint) return Promise.resolve();
        if (this.connectPromise) return this.connectPromise;
        this.invalidateCredentials();
        this.acceptingPackets = true;
        let resolveAttempt: () => void;
        let rejectAttempt: (error: Error) => void;
        const pending = new Promise<void>((resolve, reject) => { resolveAttempt = resolve; rejectAttempt = reject; });
        this.connectPromise = pending;
        const cleanup = () => {
            if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
            this.off('connect', connected);
            this.off('disconnect', disconnected);
            if (this.connectPromise === pending) this.connectPromise = null;
        };
        const connected = () => { cleanup(); resolveAttempt(); };
        const disconnected = (error?: Error) => { cleanup(); rejectAttempt(error ?? new Error('Voice disconnected during connection attempt')); };
        this.once('connect', connected);
        this.once('disconnect', disconnected);
        const timeout = this.manager.options.voiceConnection?.timeout ?? 15000;
        this.connectionTimeout = setTimeout(() => {
            void this.disconnectWithReason(new Error(`Voice connection timed out after ${timeout}ms`));
        }, timeout);
        this.setState(VoiceConnectionState.CONNECTING);
        if (this.connectPromise !== pending || this.isDestroyed()) return pending;
        try {
            this.manager.send(this.player.guildId, { op: 4, d: { guild_id: this.player.guildId, channel_id: this.player.voiceChannelId, self_deaf: options.selfDeaf, self_mute: options.selfMute } });
        } catch (error) {
            this.invalidateCredentials();
            this.setState(VoiceConnectionState.DISCONNECTED);
            this.emit('disconnect', error as Error);
        }
        return pending;
    }

    public disconnect(): Promise<void> {
        return this.disconnectWithReason();
    }

    private disconnectWithReason(error?: Error): Promise<void> {
        if (this.isDestroyed()) return Promise.resolve();
        if (this.disconnectPromise) return this.disconnectPromise;
        const active = this.state !== VoiceConnectionState.DISCONNECTED || this.connectPromise || this.sessionId;
        let finish: () => void;
        const pending = new Promise<void>(resolve => { finish = resolve; });
        this.disconnectPromise = pending;
        this.finishDisconnect = () => {
            if (this.disconnectTimeout) clearTimeout(this.disconnectTimeout);
            this.disconnectTimeout = null;
            this.disconnectPromise = undefined;
            this.finishDisconnect = undefined;
            finish();
        };
        this.acceptingPackets = false;
        this.invalidateCredentials();
        this.setState(VoiceConnectionState.DISCONNECTED);
        this.emit('disconnect', error);
        if (!active || this.state === VoiceConnectionState.DESTROYED) { this.finishDisconnect?.(); return pending; }
        if (!this.disconnectPromise) return pending;
        this.disconnectTimeout = setTimeout(() => this.finishDisconnect?.(), this.manager.options.voiceConnection?.timeout ?? 15000);
        try { this.manager.send(this.player.guildId, { op: 4, d: { guild_id: this.player.guildId, channel_id: null, self_deaf: false, self_mute: false } }); }
        catch { this.finishDisconnect?.(); }
        return pending;
    }

    public async handleStateUpdate(data: VoiceStateUpdate): Promise<void> {
        if (this.isDestroyed()) return;
        if (data.channel_id === null) {
            this.acceptingPackets = false;
            this.invalidateCredentials();
            this.setState(VoiceConnectionState.DISCONNECTED);
            this.emit('disconnect');
            this.finishDisconnect?.();
            this.player.set('userInitiatedConnect', false);
            return;
        }
        if (!this.acceptingPackets || this.disconnectPromise) return;
        const moved = this.player.voiceChannelId !== data.channel_id;
        const changed = moved || this.sessionId !== data.session_id;
        if (changed) {
            // Discord sends state/server in either order; a move must never reuse the old token.
            // https://docs.discord.com/developers/topics/voice-connections#retrieving-voice-server-information
            const server = this.serverBeforeState;
            const oldChannel = this.player.voiceChannelId;
            this.invalidateCredentials();
            this.awaitingServer = !server;
            this.player.voiceChannelId = data.channel_id;
            this.sessionId = data.session_id;
            if (server) { this.token = server.token; this.endpoint = server.endpoint; }
            const generation = this.generation;
            this.setState(VoiceConnectionState.CONNECTING);
            if (generation !== this.generation || this.isDestroyed()) return;
            if (moved) {
                this.isMoving = true;
                this.lastMoveAt = Date.now();
                this.moveNonce++;
                this.movePlaybackTicket = playbackGuard(this.player).ticket;
                this.pendingPlaybackRestoreNonce = this.player.current && this.player.playing && !this.player.paused ? this.moveNonce : null;
                this.manager.emit('playerMoved', this.player, oldChannel, data.channel_id);
                this.player.stuckDetectionCount = this.player.silentDetectionCount = 0;
                this.player.updateActivity();
            }
        } else this.serverBeforeState = undefined;
        this.checkCompletion();
    }

    public handleServerUpdate(data: VoiceServerUpdate): void {
        if (!this.acceptingPackets || this.isDestroyed() || this.disconnectPromise) return;
        if (this.token === data.token && this.endpoint === data.endpoint) { this.checkCompletion(); return; }
        this.generation++;
        this.lastVoiceUpdate = null;
        if (!this.awaitingServer) this.serverBeforeState = data;
        this.awaitingServer = false;
        this.token = data.token;
        this.endpoint = data.endpoint;
        this.setState(VoiceConnectionState.CONNECTING);
        this.checkCompletion();
    }

    public check(connected: boolean): void {
        if (this.isDestroyed()) return;
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
                await this.player.restart({ startQueued: false });
            } catch (hardError) {
                this.manager.emit("debug", `Player ${this.player.guildId} recovery: Hard restart failed. Destroying player. Error: ${(hardError as Error).message}`);
                await this.player.destroy("RecoveryFailed");
            } finally {
                this.isMoving = false;
            }
        }
    }
    
    private checkCompletion(): void {
        if (this.inFlight || this.isDestroyed() || this.disconnectPromise || this.awaitingServer || !this.sessionId || !this.token || !this.endpoint) return;
        const payload = { sessionId: this.sessionId, token: this.token, endpoint: this.endpoint, channelId: this.player.voiceChannelId };
        const same = this.lastVoiceUpdate && Object.keys(payload).every(key => payload[key] === this.lastVoiceUpdate[key]);
        if (same && this.state === VoiceConnectionState.CONNECTED) return;
        const generation = this.generation;
        const node = this.player.node;
        const operation = {};
        this.inFlight = operation;
        this.voiceUpdateInFlight = true;
        const active = () => generation === this.generation && this.player.node === node && !this.player.destroyed && this.state !== VoiceConnectionState.DESTROYED;
        void (async () => {
            try {
                const response = await this.player.updateVoice(payload);
                if (!active()) return;
                if (response == null) throw new Error('Backend did not acknowledge voice credentials');
                this.lastVoiceUpdate = payload;
                // A server packet already acknowledged for this session cannot serve a later move.
                if (this.serverBeforeState?.token === payload.token) this.serverBeforeState = undefined;
                this.setState(VoiceConnectionState.CONNECTED);
                if (!active()) return;
                this.emit('connect');
                const nonce = this.pendingPlaybackRestoreNonce;
                if (active() && this.isMoving && nonce !== null && nonce === this.moveNonce && !this.moveRestartInFlight && playbackGuard(this.player).isCurrent(this.movePlaybackTicket)) {
                    this.moveRestartInFlight = true;
                    try { await this.player.restart({ startQueued: false }); }
                    finally { this.moveRestartInFlight = false; }
                }
                if (active() && nonce === this.moveNonce) {
                    this.pendingPlaybackRestoreNonce = null;
                    this.isMoving = false;
                }
            } catch (error) {
                if (!active()) return;
                this.invalidateCredentials();
                this.setState(VoiceConnectionState.DISCONNECTED);
                this.manager.emit('debug', `NyxLink > Voice > Update failed: ${error.message}`);
                this.emit('disconnect', error as Error);
            } finally {
                if (this.inFlight === operation) {
                    this.inFlight = undefined;
                    this.voiceUpdateInFlight = false;
                    this.checkCompletion();
                }
            }
        })();
    }

    public destroy(): void {
        if (this.isDestroyed()) return;
        const active = this.state !== VoiceConnectionState.DISCONNECTED;
        this.acceptingPackets = false;
        this.invalidateCredentials();
        this.setState(VoiceConnectionState.DESTROYED);
        this.emit('disconnect', new Error('Voice destroyed'));
        this.finishDisconnect?.();
        if (active) {
            try { this.manager.send(this.player.guildId, { op: 4, d: { guild_id: this.player.guildId, channel_id: null, self_deaf: false, self_mute: false } }); } catch {}
        }
    }
}
