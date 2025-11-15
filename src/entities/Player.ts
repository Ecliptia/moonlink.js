import { Node } from "./Node";
import { Queue } from "./Queue";
import { Manager } from "../core/Manager";
import { Structure, validate } from "../Util";
import { PlayerLoop, VoiceState } from "../typings/types";
import { IPlayerConfig } from "../typings/Interfaces";
import { Filters } from "./Filters";
import { Track } from "./Track";

export class Player {
    public readonly manager: Manager;
    public node: Node;
    public readonly guildId: string;
    public readonly queue: Queue;
    public readonly filters: Filters;
    public data: Record<string, unknown> = {};

    public voiceChannelId: string;
    public textChannelId: string;
    
    public playing: boolean = false;
    public paused: boolean = false;
    public connected: boolean = false;
    public destroyed: boolean = false;
    public volume: number = 100;
    public loop: PlayerLoop = "off";
    public loopCount?: number;
    public autoPlay: boolean = false;
    public autoLeave: boolean = false;
    public ping: number = -1;
    
    public current: Track | null = null;
    public previous: Track[] = [];
    public historySize: number = 10;
    
    public voiceState: VoiceState = {} as VoiceState;
    public _lastVoiceState: VoiceState | null = null;
    public _voiceStateReady: boolean = false;
    public _awaitingVoiceConnection: boolean = false;
    
    private readonly selfDeaf: boolean;
    private readonly selfMute: boolean;
    public lastActivityTime: number = Date.now();

    constructor(manager: Manager, node: Node, config: IPlayerConfig) {
        this.manager = manager;
        this.node = node;
        this.guildId = config.guildId;
        this.voiceChannelId = config.voiceChannelId;
        this.textChannelId = config.textChannelId || config.voiceChannelId;
        this.volume = config.volume ?? this.manager.options.defaultPlayer?.volume ?? 100;
        this.selfDeaf = config.selfDeaf ?? this.manager.options.defaultPlayer?.selfDeaf ?? true;
        this.selfMute = config.selfMute ?? this.manager.options.defaultPlayer?.selfMute ?? false;
        this.autoPlay = config.autoPlay ?? this.manager.options.defaultPlayer?.autoPlay ?? false;
        this.autoLeave = config.autoLeave ?? this.manager.options.defaultPlayer?.autoLeave ?? false;
        this.loop = config.loop ?? this.manager.options.defaultPlayer?.loop ?? "off";
        this.loopCount = config.loopCount;
        this.historySize = this.manager.options.defaultPlayer?.historySize ?? 10;

        this.queue = new (Structure.get("Queue"))(this.manager);
        this.filters = new (Structure.get("Filters"))(this);
        
        this.manager.emit("debug", `Moonlink.js > Player#constructor >> Player created for guild ${this.guildId} on node ${this.node.identifier} | autoPlay: ${this.autoPlay}, autoLeave: ${this.autoLeave}, loop: ${this.loop}`);
        this.manager.players._updateNodePlayersIndex(this.node.uuid, this.guildId, 'add');
        this.manager.emit("debug", `Moonlink.js > Player#constructor >> Player ${this.guildId} added to node-players index for node ${this.node.uuid}.`);
    }

    public updateActivity(): void {
        this.lastActivityTime = Date.now();
    }

    public set(key: string, value: unknown): this {
        this.data[key] = value;
        this.updateData("data", this.data);
        return this;
    }

    public get<T>(key: string): T | undefined {
        return this.data[key] as T;
    }

    private setNestedProperty(obj: any, path: string, value: any): void {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    }

    public async updateData<T>(path?: string, data?: T): Promise<void> {
        let playerState = await this.manager.database.get<any>(`player-${this.guildId}`);
        if (!playerState) {
            playerState = {
                guildId: this.guildId,
                voiceChannelId: this.voiceChannelId,
                textChannelId: this.textChannelId,
                volume: this.volume,
                loop: this.loop,
                loopCount: this.loopCount,
                autoPlay: this.autoPlay,
                autoLeave: this.autoLeave,
                currentTrack: this.current ? this.current.toJSON() : null,
                queue: this.queue.map(track => track.toJSON()),
                previousTracks: this.previous.map(track => track.toJSON()),
                voiceState: this.voiceState,
                data: this.data,
                nodeUuid: this.node.uuid,
                playing: this.playing,
                paused: this.paused,
                connected: this.connected,
                ping: this.ping,
            };
            this.manager.emit("debug", `Moonlink.js > Player#updateData >> Initializing player state for guild ${this.guildId}.`);
        }

        if (path === undefined || path === null || path === "") {
            Object.assign(playerState, data);
            this.manager.emit("debug", `Moonlink.js > Player#updateData >> Updated full player state for guild ${this.guildId}.`);
        } else {
            this.setNestedProperty(playerState, path, data);
            if (path != 'data') this.manager.emit("debug", `Moonlink.js > Player#updateData >> Updated path '${path}' for guild ${this.guildId}. New value: ${JSON.stringify(data)}.`);
        }
        await this.manager.database.set(`player-${this.guildId}`, playerState);
    }

    public async connect(options: { setDeaf?: boolean; setMute?: boolean } = {}): Promise<this> {
        if (!this.voiceChannelId) {
            throw new Error("Moonlink.js > Player#connect > No voice channel has been set.");
        }

        this.manager.emit("debug", `Moonlink.js > Player#connect -> Connecting to voice channel ${this.voiceChannelId} in guild ${this.guildId}`);

        const payload = {
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.voiceChannelId,
                self_deaf: options.setDeaf ?? this.selfDeaf,
                self_mute: options.setMute ?? this.selfMute,
            },
        };
        
        this._awaitingVoiceConnection = true;
        this._voiceStateReady = false;
        this.manager.send(this.guildId, payload);
        this.manager.emit("debug", `Moonlink.js > Player#connect >> Sent VOICE_STATE_UPDATE to Discord gateway for guild ${this.guildId}`);

        this.connected = true;
        await this.updateData("connected", this.connected);
        return this;
    }

    public async disconnect(): Promise<this> {
        if (!this.voiceChannelId) {
            this.manager.emit("debug", `Moonlink.js > Player#disconnect >> Attempted to disconnect but player is not connected for guild ${this.guildId}`);
            return this;
        }

        this.manager.emit("debug", `Moonlink.js > Player#disconnect -> Disconnecting from voice channel in guild ${this.guildId}`);

        const payload = {
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: null,
                self_deaf: false,
                self_mute: false,
            },
        };
        
        this.manager.send(this.guildId, payload);
        this.manager.emit("debug", `Moonlink.js > Player#disconnect >> Sent VOICE_STATE_UPDATE (disconnect) to Discord gateway for guild ${this.guildId}`);

        this.connected = false;
        this._voiceStateReady = false;
        this._awaitingVoiceConnection = false;
        await this.updateData("connected", this.connected);
        return this;
    }

    public async play(options: { track?: Track; position?: number, noReplace?: boolean } = {}): Promise<boolean> {
        this.manager.emit("debug", `Moonlink.js > Player#play -> play() called for guild ${this.guildId} with options: ${JSON.stringify(options)}`);
        this.updateActivity();
        const track = options.track;
        
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
            if (nextTrack) this.queue.unshift(nextTrack);
            return false;
        }
        
        const oldTrackTitle = this.current?.title ?? "null";
        this.current = nextTrack instanceof Track ? nextTrack : new Track(nextTrack);
        this.current.position = options.position ?? 0;
        this.manager.emit("debug", `Moonlink.js > Player#play >> Player state changed: current track: ${oldTrackTitle} -> ${this.current.title}`);

        const oldPlaying = this.playing;
        const oldPaused = this.paused;
        this.playing = true;
        this.paused = false;

        try {
            await this.manager.players.ensureVoiceConnection(this);
        } catch (e) {
            this.manager.emit("debug", `Moonlink.js > Player#play >> CRITICAL: Voice connection verification failed for guild ${this.guildId}. Error: ${(e as Error).message}`);
            this.playing = oldPlaying;
            this.paused = oldPaused;
            this.current = previousTrack;
            this.queue.unshift(nextTrack);
            throw e;
        }

        const payload = {
            track: { 
                encoded: this.current.encoded,
                userData: this.current.userData 
            },
            position: this.current.position,
        };

        this.manager.emit("debug", `Moonlink.js > Player#play -> Sending play request to node ${this.node.identifier} for guild ${this.guildId}. Payload: ${JSON.stringify(payload)}`);
        
        try {
            await this.node.rest.updatePlayer(this.guildId, payload, options.noReplace ?? this.manager.options.noReplace);
            this.manager.emit("debug", `Moonlink.js > Player#play >> Successfully sent play request for track "${this.current.title}" for guild ${this.guildId}`);
        } catch (e) {
            this.manager.emit("debug", `Moonlink.js > Player#play >> CRITICAL: Failed to send play request for guild ${this.guildId}. Reverting state. Error: ${(e as Error).message}`);
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
            this.manager.emit("debug", `Moonlink.js > Player#play << Added track "${previousTrack.title}" to history for guild ${this.guildId}. History size: ${this.previous.length}`);
            this.updateData("previousTracks", this.previous.map(t => t.toJSON()));
        }
        this.set("isBackPlay", false);

        this.updateData("currentTrack", this.current.toJSON());
        this.updateData("queue", this.queue.map(t => t.toJSON()));
        this.updateData("playing", this.playing);
        this.updateData("paused", this.paused);
        this.manager.emit("debug", `Moonlink.js > Player#play >> Player state changed: playing: ${oldPlaying} -> ${this.playing}, paused: ${oldPaused} -> ${this.paused}`);
        
        return true;
    }

    public async pause(): Promise<this> {
        if (this.paused) {
            this.manager.emit("debug", `Moonlink.js > Player#pause >> Player is already paused for guild ${this.guildId}`);
            return this;
        }

        this.manager.emit("debug", `Moonlink.js > Player#pause -> Sending pause request to node ${this.node.identifier} for guild ${this.guildId}`);
        await this.node.rest.updatePlayer(this.guildId, { paused: true });

        const oldPaused = this.paused;
        this.paused = true;
        await this.updateData("paused", this.paused);
        this.manager.emit("debug", `Moonlink.js > Player#pause >> Player state changed: paused: ${oldPaused} -> ${this.paused}`);
        
        this.manager.emit("debug", `Moonlink.js > Player#pause >> Player paused for guild ${this.guildId}`);
        return this;
    }

    public async resume(): Promise<this> {
        this.updateActivity();
        if (!this.paused) {
            this.manager.emit("debug", `Moonlink.js > Player#resume >> Player is not paused for guild ${this.guildId}`);
            return this;
        }

        this.manager.emit("debug", `Moonlink.js > Player#resume -> Sending resume request to node ${this.node.identifier} for guild ${this.guildId}`);
        await this.node.rest.updatePlayer(this.guildId, { paused: false });

        const oldPaused = this.paused;
        this.paused = false;
        await this.updateData("paused", this.paused);
        this.manager.emit("debug", `Moonlink.js > Player#resume >> Player state changed: paused: ${oldPaused} -> ${this.paused}`);
        
        this.manager.emit("debug", `Moonlink.js > Player#resume >> Player resumed for guild ${this.guildId}`);
        return this;
    }

    public async stop(): Promise<this> {
        this.manager.emit("debug", `Moonlink.js > Player#stop -> Sending stop request to node ${this.node.identifier} for guild ${this.guildId}`);
        
        await this.node.rest.updatePlayer(this.guildId, { track: { encoded: null } });
        
        const oldPlaying = this.playing;
        this.playing = false;
        this.manager.emit("debug", `Moonlink.js > Player#stop >> Player state changed: playing: ${oldPlaying} -> ${this.playing}`);

        const oldTrackTitle = this.current?.title ?? "null";
        this.current = null;
        await this.updateData("currentTrack", null);
        await this.updateData("playing", this.playing);
        this.manager.emit("debug", `Moonlink.js > Player#stop >> Player state changed: current: ${oldTrackTitle} -> null`);
        
        this.manager.emit("debug", `Moonlink.js > Player#stop >> Player stopped for guild ${this.guildId}`);
        return this;
    }

    public async skip(position?: number): Promise<boolean> {
        if (position !== undefined) {
            this.manager.emit("debug", `Moonlink.js > Player#skip -> Skipping to position ${position} in queue for guild ${this.guildId}`);
            const track = this.queue.remove(position);
            if (!track) {
                this.manager.emit("debug", `Moonlink.js > Player#skip >> Invalid queue position for guild ${this.guildId}`);
                return false;
            }
            const played = await this.play({ track: track instanceof Track ? track : new Track(track) });
            await this.updateData("queue", this.queue.map(t => t.toJSON()));
            return played;
        }

        if (!this.queue.size) {
            if (this.autoPlay) {
                this.manager.emit("debug", `Moonlink.js > Player#skip >> Queue empty, stopping player (autoPlay enabled) for guild ${this.guildId}`);
                await this.stop();
                return true;
            }
            this.manager.emit("debug", `Moonlink.js > Player#skip >> Queue is empty, cannot skip for guild ${this.guildId}`);
            return false;
        }

        this.manager.emit("debug", `Moonlink.js > Player#skip -> Skipping to next track in queue for guild ${this.guildId}`);
        const played = await this.play();
        await this.updateData("queue", this.queue.map(t => t.toJSON()));
        return played;
    }

    public async seek(position: number): Promise<this> {
        validate(
            position,
            (v) => typeof v === "number" && !isNaN(v) && v >= 0,
            "Player#seek > Position must be a valid number."
        );

        this.manager.emit("debug", `Moonlink.js > Player#seek -> Seeking to position ${position}ms for guild ${this.guildId}`);
        await this.node.rest.updatePlayer(this.guildId, { position });
        if (this.current) {
            this.current.position = position;
            await this.updateData("currentTrack.position", this.current.position);
        }
        this.manager.emit("debug", `Moonlink.js > Player#seek >> Sent seek request to node ${this.node.identifier}`);
        
        return this;
    }

    public setVolume(volume: number): this {
        validate(
            volume,
            (v) => typeof v === "number" && !isNaN(v) && v >= 0 && v <= 1000,
            "Player#setVolume > Volume must be between 0 and 1000."
        );

        const oldVolume = this.volume;
        this.volume = volume;
        this.updateData("volume", this.volume);
        
        this.manager.emit("debug", `Moonlink.js > Player#setVolume -> Changing volume from ${oldVolume} to ${volume} for guild ${this.guildId}`);
        this.node.rest.updatePlayer(this.guildId, { volume });
        this.manager.emit("debug", `Moonlink.js > Player#setVolume >> Volume updated for guild ${this.guildId}`);
        
        return this;
    }

    public setLoop(loop: PlayerLoop, count?: number): this {
        const oldLoop = this.loop;
        this.loop = loop;
        this.loopCount = count;
        this.updateData("loop", this.loop);
        this.updateData("loopCount", this.loopCount);
        
        this.manager.emit("debug", `Moonlink.js > Player#setLoop >> Loop mode changed from "${oldLoop}" to "${loop}"${count ? ` (count: ${count})` : ""} for guild ${this.guildId}`);
        return this;
    }

    public setAutoPlay(autoPlay: boolean): this {
        this.autoPlay = autoPlay;
        this.updateData("autoPlay", this.autoPlay);
        this.manager.emit("debug", `Moonlink.js > Player#setAutoPlay >> AutoPlay set to ${autoPlay} for guild ${this.guildId}`);
        return this;
    }

    public setAutoLeave(autoLeave: boolean): this {
        this.autoLeave = autoLeave;
        this.updateData("autoLeave", this.autoLeave);
        this.manager.emit("debug", `Moonlink.js > Player#setAutoLeave >> AutoLeave set to ${autoLeave} for guild ${this.guildId}`);
        return this;
    }

    public shuffle(): this {
        if (this.queue.size < 2) {
            this.manager.emit("debug", `Moonlink.js > Player#shuffle >> Queue has less than 2 tracks, cannot shuffle for guild ${this.guildId}`);
            return this;
        }

        this.manager.emit("debug", `Moonlink.js > Player#shuffle -> Shuffling queue with ${this.queue.size} tracks for guild ${this.guildId}`);
        this.queue.shuffle();
        this.manager.emit("debug", `Moonlink.js > Player#shuffle >> Queue shuffled for guild ${this.guildId}`);
        return this;
    }

    public async destroy(): Promise<void> {
        if (this.destroyed) {
            this.manager.emit("debug", `Moonlink.js > Player#destroy >> Player already destroyed for guild ${this.guildId}`);
            return;
        }

        this.manager.emit("debug", `Moonlink.js > Player#destroy -> Destroying player for guild ${this.guildId}`);
        
        await this.disconnect();
        await this.stop();
        this.queue.clear();
        this.manager.players.destroy(this.guildId);
        
        await this.manager.players._updateNodePlayersIndex(this.node.uuid, this.guildId, 'remove');
        await this.manager.database.delete(`player-${this.guildId}`);

        this.destroyed = true;
        this.manager.emit("debug", `Moonlink.js > Player#destroy >> Player destroyed for guild ${this.guildId}. State removed from DB and node-players index.`);
    }

    public async restart(): Promise<boolean> {
        this.manager.emit("debug", `Moonlink.js > Player#restart -> Restarting player for guild ${this.guildId}`);

        if (!this.current && !this.queue.size) {
            this.manager.emit("debug", `Moonlink.js > Player#restart >> No track or queue to restart for guild ${this.guildId}`);
            return false;
        }

        this._voiceStateReady = false;
        this._awaitingVoiceConnection = false;
        await this.connect();

        if (this.current) {
            this.manager.emit("debug", `Moonlink.js > Player#restart -> Restoring current track for guild ${this.guildId}`);
            const played = await this.play({
                track: this.current,
                position: this.current.position,
            });
            await this.updateData("currentTrack", this.current.toJSON());
            await this.updateData("playing", this.playing);
            await this.updateData("paused", this.paused);
            return played;
        } else {
            this.manager.emit("debug", `Moonlink.js > Player#restart -> Playing first track from queue for guild ${this.guildId}`);
            const played = await this.play();
            await this.updateData("currentTrack", this.current ? this.current.toJSON() : null);
            await this.updateData("queue", this.queue.map(t => t.toJSON()));
            await this.updateData("playing", this.playing);
            await this.updateData("paused", this.paused);
            return played;
        }
    }

    public async transferNode(node: Node | string): Promise<boolean> {
        const targetNode = typeof node === "string" ? this.manager.nodes.get(node) : node;
        
        if (!targetNode || !targetNode.connected || targetNode.identifier === this.node.identifier) {
            this.manager.emit("debug", `Moonlink.js > Player#transferNode >> Invalid target node for guild ${this.guildId}`);
            return false;
        }

        const oldNode = this.node;
        this.manager.emit("debug", `Moonlink.js > Player#transferNode -> Transferring player ${this.guildId} from ${oldNode.identifier} to ${targetNode.identifier}`);

        try {
            await oldNode.rest.destroyPlayer(this.guildId);
        } catch (e) {
            this.manager.emit("debug", `Moonlink.js > Player#transferNode >> Failed to destroy player on old node: ${e.message}`);
        }

        await this.manager.players._updateNodePlayersIndex(oldNode.uuid, this.guildId, 'remove');
        this.manager.emit("debug", `Moonlink.js > Player#transferNode >> Player ${this.guildId} removed from node-players index for old node ${oldNode.uuid}.`);

        this.node = targetNode;

        await this.manager.players._updateNodePlayersIndex(this.node.uuid, this.guildId, 'add');
        this.manager.emit("debug", `Moonlink.js > Player#transferNode >> Player ${this.guildId} added to node-players index for new node ${this.node.uuid}.`);

        await this.restart();

        this.manager.emit("playerSwitchedNode", this, oldNode, targetNode);
        this.manager.emit("debug", `Moonlink.js > Player#transferNode >> Successfully transferred player ${this.guildId} to ${targetNode.identifier}`);
        return true;
    }

    public setVoiceChannel(voiceChannelId: string): this {
        validate(
            voiceChannelId,
            (v) => typeof v === "string" && v.length > 0,
            "Player#setVoiceChannel > Voice channel ID must be a non-empty string."
        );

        if (this.voiceChannelId === voiceChannelId) {
            this.manager.emit("debug", `Moonlink.js > Player#setVoiceChannel >> Voice channel already set to ${voiceChannelId} for guild ${this.guildId}`);
            return this;
        }

        const oldChannel = this.voiceChannelId;
        this.voiceChannelId = voiceChannelId;
        this.updateData("voiceChannelId", this.voiceChannelId);
        
        this.manager.emit("debug", `Moonlink.js > Player#setVoiceChannel >> Voice channel changed from ${oldChannel} to ${voiceChannelId} for guild ${this.guildId}`);
        this.manager.emit("playerVoiceChannelSet", this, oldChannel, voiceChannelId);
        return this;
    }

    public setTextChannel(textChannelId: string): this {
        validate(
            textChannelId,
            (v) => typeof v === "string" && v.length > 0,
            "Player#setTextChannel > Text channel ID must be a non-empty string."
        );

        if (this.textChannelId === textChannelId) {
            this.manager.emit("debug", `Moonlink.js > Player#setTextChannel >> Text channel already set to ${textChannelId} for guild ${this.guildId}`);
            return this;
        }

        const oldChannel = this.textChannelId;
        this.textChannelId = textChannelId;
        this.updateData("textChannelId", this.textChannelId);
        
        this.manager.emit("debug", `Moonlink.js > Player#setTextChannel >> Text channel changed from ${oldChannel} to ${textChannelId} for guild ${this.guildId}`);
        this.manager.emit("playerTextChannelSet", this, oldChannel, textChannelId);
        return this;
    }

    public async replay(): Promise<boolean> {
        if (!this.current?.encoded) {
            this.manager.emit("debug", `Moonlink.js > Player#replay >> No current track to replay for guild ${this.guildId}`);
            return false;
        }

        this.manager.emit("debug", `Moonlink.js > Player#replay -> Replaying track "${this.current.title}" for guild ${this.guildId}`);
        
        const played = await this.play({
            track: this.current,
            position: 0,
        });
        await this.updateData("currentTrack", this.current.toJSON());
        await this.updateData("playing", this.playing);
        await this.updateData("paused", this.paused);
        return played;
    }

    public async back(): Promise<boolean> {
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
        } else {
            this.manager.emit("debug", `Moonlink.js > Player#back >> Failed to play previous track for guild ${this.guildId}.`);
        }
        
        return played;
    }
}