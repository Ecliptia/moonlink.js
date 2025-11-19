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

        this.queue = new (Structure.get("Queue"))(this);
        this.filters = new (Structure.get("Filters"))(this);
        
        this.manager.emit("debug", `Moonlink.js > Player#constructor >> Player created for guild ${this.guildId} on node ${this.node.identifier} | autoPlay: ${this.autoPlay}, autoLeave: ${this.autoLeave}, loop: ${this.loop}`);
    }

    public updateActivity(): void {
        this.lastActivityTime = Date.now();
    }

    public set(key: string, value: unknown): this {
        this.data[key] = value;
        return this;
    }

    public get<T>(key: string): T | undefined {
        return this.data[key] as T;
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
        this.current.position = options.position || 0;
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
            position: options.position || this.current.position,
        };

        this.manager.emit("playerTriggeredPlay", this, this.current);
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
        }
        this.set("isBackPlay", false);
        
        this.manager.emit("debug", `Moonlink.js > Player#play >> Player state changed: playing: ${oldPlaying} -> ${this.playing}, paused: ${oldPaused} -> ${this.paused}`);
        
        return true;
    }

    public async pause(): Promise<this> {
        if (this.paused) {
            this.manager.emit("debug", `Moonlink.js > Player#pause >> Player is already paused for guild ${this.guildId}`);
            return this;
        }

        this.manager.emit("debug", `Moonlink.js > Player#pause -> Sending pause request to node ${this.node.identifier} for guild ${this.guildId}`);
        this.manager.emit("playerTriggeredPause", this);
        await this.node.rest.updatePlayer(this.guildId, { paused: true });

        const oldPaused = this.paused;
        this.paused = true;
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
        this.manager.emit("playerTriggeredResume", this);
        await this.node.rest.updatePlayer(this.guildId, { paused: false });

        const oldPaused = this.paused;
        this.paused = false;
        this.manager.emit("debug", `Moonlink.js > Player#resume >> Player state changed: paused: ${oldPaused} -> ${this.paused}`);
        
        this.manager.emit("debug", `Moonlink.js > Player#resume >> Player resumed for guild ${this.guildId}`);
        return this;
    }

    public async stop(): Promise<this> {
        this.manager.emit("debug", `Moonlink.js > Player#stop -> Sending stop request to node ${this.node.identifier} for guild ${this.guildId}`);
        this.manager.emit("playerTriggeredStop", this);
        
        await this.node.rest.updatePlayer(this.guildId, { track: { encoded: null } });
        
        const oldPlaying = this.playing;
        this.playing = false;
        this.manager.emit("debug", `Moonlink.js > Player#stop >> Player state changed: playing: ${oldPlaying} -> ${this.playing}`);

        const oldTrackTitle = this.current?.title ?? "null";
        this.current = null;
        this.manager.emit("debug", `Moonlink.js > Player#stop >> Player state changed: current: ${oldTrackTitle} -> null`);
        
        this.manager.emit("debug", `Moonlink.js > Player#stop >> Player stopped for guild ${this.guildId}`);
        return this;
    }

    public async skip(position?: number): Promise<boolean> {
        const oldTrack = this.current;
        if (position !== undefined) {
            this.manager.emit("debug", `Moonlink.js > Player#skip -> Skipping to position ${position} in queue for guild ${this.guildId}`);
            const track = this.queue.remove(position);
            if (!track) {
                this.manager.emit("debug", `Moonlink.js > Player#skip >> Invalid queue position for guild ${this.guildId}`);
                return false;
            }
            this.manager.emit("playerTriggeredSkip", this, oldTrack, track, position);
            return await this.play({ track: track instanceof Track ? track : new Track(track) });
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
                    
        const nextTrack = this.queue.first;
        this.manager.emit("playerTriggeredSkip", this, oldTrack, nextTrack, 0);
        this.manager.emit("debug", `Moonlink.js > Player#skip -> Skipping to next track in queue for guild ${this.guildId}`);
        return await this.play();
    }

    public async seek(position: number): Promise<this> {
        validate(
            position,
            (v) => typeof v === "number" && !isNaN(v) && v >= 0,
            "Player#seek > Position must be a valid number."
        );

        this.manager.emit("debug", `Moonlink.js > Player#seek -> Seeking to position ${position}ms for guild ${this.guildId}`);
        this.manager.emit("playerTriggeredSeek", this, position);
        await this.node.rest.updatePlayer(this.guildId, { position });
        if (this.current) {
            this.current.position = position;
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
        this.manager.emit("playerChangedVolume", this, oldVolume, volume);
        
        this.manager.emit("debug", `Moonlink.js > Player#setVolume -> Changing volume from ${oldVolume} to ${volume} for guild ${this.guildId}`);
        this.node.rest.updatePlayer(this.guildId, { volume });
        this.manager.emit("debug", `Moonlink.js > Player#setVolume >> Volume updated for guild ${this.guildId}`);
        
        return this;
    }

    public setLoop(loop: PlayerLoop, count?: number): this {
        const oldLoop = this.loop;
        const oldLoopCount = this.loopCount;
        this.loop = loop;
        this.loopCount = count;
        this.manager.emit("playerChangedLoop", this, oldLoop, this.loop, oldLoopCount, this.loopCount);
        
        this.manager.emit("debug", `Moonlink.js > Player#setLoop >> Loop mode changed from "${oldLoop}" to "${loop}"${count ? ` (count: ${count})` : ""} for guild ${this.guildId}`);
        return this;
    }

    public setAutoPlay(autoPlay: boolean): this {
        this.autoPlay = autoPlay;
        this.manager.emit("playerAutoPlaySet", this, autoPlay);
        this.manager.emit("debug", `Moonlink.js > Player#setAutoPlay >> AutoPlay set to ${autoPlay} for guild ${this.guildId}`);
        return this;
    }

    public setAutoLeave(autoLeave: boolean): this {
        this.autoLeave = autoLeave;
        this.manager.emit("playerAutoLeaveSet", this, autoLeave);
        this.manager.emit("debug", `Moonlink.js > Player#setAutoLeave >> AutoLeave set to ${autoLeave} for guild ${this.guildId}`);
        return this;
    }

    public shuffle(): this {
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

    public async destroy(reason?: string): Promise<void> {
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;

        this.manager.emit("debug", `Moonlink.js > Player#destroy -> Destroying player for guild ${this.guildId}. Reason: ${reason || "No reason provided"}`);
        
        this.playing = false;
        this.paused = false;

        await this.disconnect();
        
        try {
            await this.node.rest.destroyPlayer(this.guildId);
        } catch (e) {
            this.manager.emit("debug", `Moonlink.js > Player#destroy >> Failed to destroy player on node: ${(e as Error).message}`);
        }
        
        this.queue.clear();
        
        this.manager.emit("playerDestroy", this, reason);
        this.manager.players.players.delete(this.guildId);

        this.manager.emit("debug", `Moonlink.js > Player#destroy >> Player destroyed for guild ${this.guildId}.`);
    }

    public async restart(): Promise<boolean> {
        this.manager.emit("debug", `Moonlink.js > Player#restart -> Restarting player for guild ${this.guildId}`);
        this.manager.emit("playerResuming", this);

        if (!this.voiceChannelId) {
            this.manager.emit("debug", `Moonlink.js > Player#restart >> Cannot restart player without a voiceChannelId for guild ${this.guildId}`);
            return false;
        }

        try {
            await this.connect();
            await this.manager.players.ensureVoiceConnection(this);
        } catch (error) {
            this.manager.emit("debug", `Moonlink.js > Player#restart >> Voice connection failed for guild ${this.guildId}. Error: ${(error as Error).message}`);
            await this.destroy("Failed to establish voice connection on restart.");
            return false;
        }

        if (this.current) {
            this.manager.emit("debug", `Moonlink.js > Player#restart -> Restoring current track "${this.current.title}" for guild ${this.guildId} at ${this.current.position}ms.`);
            this.playing = true;
            this.paused = false;
            
            await this.node.rest.updatePlayer(this.guildId, {
                track: { encoded: this.current.encoded },
                position: this.current.position,
            });
            
        } else if (this.queue.size > 0) {
            this.manager.emit("debug", `Moonlink.js > Player#restart -> No current track, playing first from queue for guild ${this.guildId}`);
            await this.play();
        } else {
            this.manager.emit("debug", `Moonlink.js > Player#restart >> No track to restore and queue is empty for guild ${this.guildId}`);
            return true;
        }

        this.manager.emit("playerResumed", this);
        return true;
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

        this.node = targetNode;

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
        
        this.manager.emit("debug", `Moonlink.js > Player#setVoiceChannel >> Voice channel changed from ${oldChannel} to ${voiceChannelId} for guild ${this.guildId}`);
        this.manager.emit("playerVoiceChannelIdSet", this, oldChannel, voiceChannelId);
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
        
        this.manager.emit("debug", `Moonlink.js > Player#setTextChannel >> Text channel changed from ${oldChannel} to ${textChannelId} for guild ${this.guildId}`);
        this.manager.emit("playerTextChannelIdSet", this, oldChannel, textChannelId);
        return this;
    }

    public async replay(): Promise<boolean> {
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