import { EventEmitter } from "node:events";

import {
    MoonlinkManager,
    MoonlinkQueue,
    MoonlinkNode,
    MoonlinkTrack,
    MoonlinkFilters,
    Structure
} from "../../index";

import { MoonlinkWebSocket } from "../@Services/MoonlinkWebSocket";

import { IPlayerData, connectOptions } from "../@Typings";

export class MoonlinkPlayer {
    public manager: MoonlinkManager = Structure.manager;
    public guildId: string;
    public textChannel: string;
    public voiceChannel: string;
    public voiceRegion: string;
    public autoPlay: boolean | null;
    public autoLeave: boolean | null;
    public connected: boolean | null;
    public playing: boolean | null;
    public paused: boolean | null;
    public loop: number | null;
    public volume: number;
    public ping: number;
    public queue: MoonlinkQueue;
    public filters: MoonlinkFilters;
    public current: Record<string, any>;
    public previous: MoonlinkTrack[] | MoonlinkTrack | Record<string, any>;
    public data: Record<string, any>;
    public node: MoonlinkNode | any;
    public voiceReceiverWs: MoonlinkWebSocket | any;

    /**
     * Creates an instance of MoonlinkPlayer.
     * @param data - Player information.
     */
    constructor(data: IPlayerData) {
        // Initialize properties and set default values based on input parameters.
        this.guildId = data.guildId;
        this.textChannel = data.textChannel;
        this.voiceChannel = data.voiceChannel;
        this.voiceRegion = data.voiceRegion;
        this.autoPlay = data.autoPlay;
        this.autoLeave = data.autoLeave || false;
        this.connected = data.connected || false;
        this.playing = data.playing || false;
        this.paused = data.paused || false;
        this.loop = data.loop || 0;
        this.volume = data.volume || 80;
        this.ping = data.ping || 0;
        this.queue = new (Structure.get("MoonlinkQueue"))(
            this.manager,
            this.guildId
        );
        this.current = null;
        this.previous = [];
        this.data = {};
        this.node = this.manager.nodes.get(data.node);
        this.filters = new (Structure.get("MoonlinkFilters"))(this);

        this.voiceReceiverWs = null;

        if (!data.notBackup && this.manager.options.resume)
            this.manager.players.backup(this);
    }

    /**
     * Set a key-value pair in the player's data and update the map.
     * @param key - The key to set.
     * @param value - The value to set.
     */
    public set(key: string, value: unknown): void {
        this.data[key] = value;
    }

    /**
     * Get a value from the player's data.
     * @param key - The key to retrieve.
     * @returns The value associated with the key.
     */
    public get<T>(key: string): T {
        return (this.data[key] as T) || null;
    }

    /**
     * Set the text channel for the player.
     * @param channelId - The ID of the text channel.
     * @returns True if the channel was set successfully.
     * @throws Error if channelId is empty or not a string.
     */
    public setTextChannel(channelId: string): boolean {
        if (!channelId) {
            throw new Error('@Moonlink(Player) - "channelId" option is empty');
        }
        if (typeof channelId !== "string") {
            throw new Error(
                '@Moonlink(Player) - option "channelId" is different from a string'
            );
        }
        this.manager.emit(
            "playerSetTextChannel",
            this,
            this.textChannel,
            channelId
        );
        this.textChannel = channelId;
        if (this.manager.options.resume) this.manager.players.backup(this);
        return true;
    }

    /**
     * Set the voice channel for the player.
     * @param channelId - The ID of the voice channel.
     * @returns True if the channel was set successfully.
     * @throws Error if channelId is empty or not a string.
     */
    public setVoiceChannel(channelId: string): boolean {
        if (!channelId) {
            throw new Error('@Moonlink(Player) - "channelId" option is empty');
        }
        if (typeof channelId !== "string") {
            throw new Error(
                '@Moonlink(Player) - option "channelId" is different from a string'
            );
        }
        this.manager.emit(
            "playerSetVoiceChannel",
            this,
            this.voiceChannel,
            channelId
        );
        this.voiceChannel = channelId;
        if (this.manager.options.resume) this.manager.players.backup(this);
        return true;
    }
    /* Logic created by PiscesXD */
    public setAutoLeave(mode?: boolean | null): boolean | null {
        if (typeof mode !== "boolean") {
            throw new Error(
                '@Moonlink(Player) - "mode" option is empty or different from a boolean'
            );
        }
        mode ? mode : (mode = !this.autoLeave);
        this.autoLeave = mode;

        this.manager.emit("playerAutoLeaveTriggered", this, mode);
        if (this.manager.options.resume) this.manager.players.backup(this);
        return mode;
    }
    /**
     * Set the auto-play mode for the player.
     * @param mode - Auto-play mode (true/false).
     * @returns True if the mode was set successfully.
     * @throws Error if mode is not a boolean.
     */
    public setAutoPlay(mode: boolean): boolean {
        if (typeof mode !== "boolean") {
            throw new Error(
                '@Moonlink(Player) - "mode" option is empty or different from a boolean'
            );
        }
        this.autoPlay = mode;

        this.manager.emit("playerAutoPlayTriggered", this, mode);
        if (this.manager.options.resume) this.manager.players.backup(this);
        return mode;
    }

    /**
     * Connect the player to a voice channel with optional connection options.
     * @param options - Connection options (setMute, setDeaf).
     * @returns True if the connection was successful.
     */
    public connect(options: connectOptions): boolean | null {
        options = options || { setDeaf: false, setMute: false };
        const { setDeaf, setMute } = options;
        this.manager._SPayload(
            this.guildId,
            JSON.stringify({
                op: 4,
                d: {
                    guild_id: this.guildId,
                    channel_id: this.voiceChannel,
                    self_mute: setMute,
                    self_deaf: setDeaf
                }
            })
        );

        this.connected = true;
        this.manager.emit("playerConnected", this);

        return true;
    }

    /**
     * Disconnect the player from the voice channel.
     * @returns True if the disconnection was successful.
     */
    public disconnect(): boolean {
        this.manager._SPayload(
            this.guildId,
            JSON.stringify({
                op: 4,
                d: {
                    guild_id: this.guildId,
                    channel_id: null,
                    self_mute: false,
                    self_deaf: false
                }
            })
        );

        this.connected = false;
        this.voiceChannel = null;
        return true;
    }

    /**
     * Restart the player by reconnecting and updating its state.
     */
    public async restart(): Promise<void> {
        this.connect({
            setDeaf: true,
            setMute: false
        });

        await this.manager.players.attemptConnection(this.guildId);

        if (!this.current && this.queue.size) {
            this.play();
            return;
        } else {
            await this.node.rest.update({
                guildId: this.guildId,
                data: {
                    track: {
                        encoded: this.current.encoded
                    },
                    position: this.current.position,
                    volume: this.volume
                }
            });
        }
        this.manager.emit("playerRestarted", this);
        if (this.manager.options.resume) this.manager.players.backup(this);
    }
    /**
     * Play the next track in the queue.
     */
    public async play(track?: MoonlinkTrack | string): Promise<boolean> {
        if (!track && !this.queue.size) return false;

        let data: MoonlinkTrack | string | null = track
            ? track
            : this.queue.shift();

        if (!data) return false;

        if (this.loop && Object.keys(this.current).length != 0) {
            this.current.time ? (this.current.time = 0) : false;
            this.ping = undefined;
            this.queue.push(this.current);
        }

        if (typeof data == "string") {
            try {
                let resolveTrack: any = await this.node.rest.decodeTrack(data);
                data = new (Structure.get("MoonlinkTrack"))(resolveTrack, null);
            } catch (err) {
                this.manager.emit(
                    "debug",
                    "@Moonlink(Player) - Fails when trying to decode a track " +
                        data +
                        ", error: " +
                        err
                );
                return;
            }
        }

        this.current = data;

        await this.node.rest.update({
            guildId: this.guildId,
            data: {
                track: {
                    encoded: data.encoded
                },
                volume: this.volume
            }
        });
        if (this.manager.options.resume) this.manager.players.backup(this);
        return true;
    }

    /**
     * Pause the playback.
     * @returns True if paused successfully.
     */
    public async pause(): Promise<boolean> {
        if (this.paused) return true;
        await this.updatePlaybackStatus(true);
        this.manager.emit("playerPaused", this);
        if (this.manager.options.resume) this.manager.players.backup(this);
        return true;
    }

    /**
     * Resume the playback.
     * @returns True if resumed successfully.
     */
    public async resume(): Promise<boolean> {
        if (this.playing) return true;
        await this.updatePlaybackStatus(false);
        this.manager.emit("playerResume", this);
        if (this.manager.options.resume) this.manager.players.backup(this);
        return true;
    }

    /**
     * Private method to update the playback status (paused or resumed).
     * @param paused - Indicates whether to pause or resume the playback.
     */
    private async updatePlaybackStatus(paused: boolean): Promise<void> {
        await this.node.rest.update({
            guildId: this.guildId,
            data: { paused }
        });
        this.paused = paused;
        this.playing = !paused;
    }

    /**
     * Stop the playback and optionally clear player data.
     * @returns True if stopped successfully.
     */
    public async stop(destroy?: boolean): Promise<boolean> {
        if (!this.queue.size) {
            await this.node.rest.update({
                guildId: this.guildId,
                data: {
                    track: { encoded: null }
                }
            });
            if (this.manager.options.resume) this.manager.players.backup(this);
        }

        this.manager.emit("playerStopped", this, this.current as MoonlinkTrack);
        this.manager.options?.destroyPlayersStopped && destroy
            ? this.destroy()
            : this.queue.clear();
        if (this.manager.options.resume) this.manager.players.backup(this);
        return true;
    }

    /**
     * Skip to the next track in the queue.
     * @returns True if the next track was successfully played.
     */
    public async skip(position?: number): Promise<boolean> {
        if (position) {
            this.validateNumberParam(position, "position");
            let queue = this.queue.all();
            if (!queue[position - 1]) {
                throw new Error(
                    `@Moonlink(Player) - the indicated position does not exist, make security in your code to avoid errors`
                );
            }

            let data: MoonlinkTrack | Record<string, any> = queue.splice(
                position - 1,
                1
            )[0];

            this.manager.emit(
                "playerSkipped",
                this,
                this.current as MoonlinkTrack,
                data as MoonlinkTrack
            );
            this.current = data;
            this.queue.setQueue(queue);
            await this.play(data as MoonlinkTrack);
            return true;
        }
        if (this.queue.size) {
            this.manager.emit(
                "playerSkipped",
                this,
                this.current as MoonlinkTrack,
                this.queue.all[0]
            );
            this.play();
            return false;
        } else {
            this.stop();
            if (this.manager.options.resume) this.manager.players.backup(this);
            return true;
        }
    }

    /**
     * Set the volume level for the player.
     * @param percent - Volume percentage (0 to Infinity).
     * @returns The new volume level.
     * @throws Error if the volume is not a valid number or player is not playing.
     */
    public async setVolume(percent: number): Promise<number> {
        if (typeof percent == "undefined" || isNaN(percent)) {
            throw new Error(
                '@Moonlink(Player) - option "percent" is empty or different from a number'
            );
        }
        if (!this.playing) {
            throw new Error(
                "@Moonlink(Player) - cannot change volume while the player is not playing"
            );
        }

        await this.node.rest.update({
            guildId: this.guildId,
            data: { volume: percent }
        });

        this.manager.emit("playerVolumeChanged", this, this.volume, percent);

        this.volume = percent;

        if (this.manager.options.resume) this.manager.players.backup(this);
        return percent;
    }

    /**
     * Set the loop mode for the player.
     * @param mode - Loop mode (0 for no loop, 1 for single track, 2 for entire queue).
     * @returns The new loop mode.
     * @throws Error if the mode is not a valid number or out of range.
     */
    public setLoop(mode: number | string | null): number | string | null {
        if (
            typeof mode == "string" &&
            ["off", "track", "queue"].includes(mode)
        ) {
            mode == "track"
                ? (mode = 1)
                : mode == "queue"
                ? (mode = 2)
                : (mode = 0);
        }
        if (
            typeof mode !== "number" ||
            (mode !== null && (mode < 0 || mode > 2))
        ) {
            throw new Error(
                '@Moonlink(Player) - the option "mode" is different from a number and string or the option does not exist'
            );
        }

        this.manager.emit("playerLoopSet", this, this.loop, mode);
        this.loop = mode;

        if (this.manager.options.resume) this.manager.players.backup(this);

        return mode;
    }

    /**
     * Destroy the player, disconnecting it and removing player data.
     * @returns True if the player was successfully destroyed.
     */
    public async destroy(): Promise<boolean> {
        if (this.connected) this.disconnect();
        await this.node.rest.destroy(this.guildId);
        this.queue.clear();
        this.manager.players.delete(this.guildId);
        this.manager.emit(
            "debug",
            "@Moonlink(Player) - Destroyed player " + this.guildId
        );
        this.manager.emit("playerDestroyed", this.guildId);

        if (this.manager.options.resume) this.manager.players.backup(this);
        return true;
    }

    /**
     * Private method to validate a number parameter.
     * @param param - The number parameter to validate.
     * @param paramName - The name of the parameter.
     * @throws Error if the parameter is not a valid number.
     */
    private validateNumberParam(param: number, paramName: string): void {
        if (typeof param !== "number") {
            throw new Error(
                `@Moonlink(Player) - option "${paramName}" is empty or different from a number`
            );
        }
    }

    /**
     * Seek to a specific position in the current track.
     * @param position - The position to seek to.
     * @returns The new position after seeking.
     * @throws Error if the position is greater than the track duration or seek is not allowed.
     */
    public async seek(position: number): Promise<number | null> {
        this.validateNumberParam(position, "position");

        if (position >= this.current.duration) {
            throw new Error(
                `@Moonlink(Player) - parameter "position" is greater than the duration of the current track`
            );
        }

        if (!this.current.isSeekable && this.current.isStream) {
            throw new Error(
                `@Moonlink(Player) - seek function cannot be applied on live video or cannot be applied in "isSeekable"`
            );
        }

        this.manager.emit(
            "playerSeeking",
            this,
            this.current.position,
            position
        );

        await this.node.rest.update({
            guildId: this.guildId,
            data: { position }
        });
        if (this.manager.options.resume) this.manager.players.backup(this);
        return position;
    }

    /**
     * Shuffle the tracks in the queue.
     * @returns True if the shuffle was successful.
     * @throws Error if the queue is empty.
     */
    public shuffle(): boolean {
        if (!this.queue.size) {
            throw new Error(
                "@Moonlink(Player)the one that is empty so that the shuffle can be performed"
            );
        }
        let oldQueue = Array.from(this.queue.all);
        let shuffleStatus = this.queue.shuffle();
        this.manager.emit(
            "playerShuffled",
            this,
            oldQueue,
            this.queue.all,
            shuffleStatus
        );
        if (this.manager.options.resume) this.manager.players.backup(this);
        return shuffleStatus;
    }

    public async transferNode(node: MoonlinkNode | string): Promise<boolean> {
        typeof node == "string" ? (node = this.manager.nodes.get(node)) : null;
        if (!node) return false;

        this.node = node;
        if (this.current || this.queue.size) {
            await this.restart();
            return true;
        } else {
            await this.manager.players.attemptConnection(this.guildId);
            return true;
        }
    }

    /**
     * Returns an event listener containing voice data received from the NodeLink server.
     * @note NodeLink only feature
     * @returns An event listener that emits "start", "stop", "close", "error", and "unknown" events.
     */
    public listenVoice(): EventEmitter | boolean {
        if (!this.node.info.isNodeLink) return false;

        this.voiceReceiverWs = new MoonlinkWebSocket(
            `ws${this.node.secure ? "s" : ""}://${
                this.node.address
            }/connection/data`,
            {
                headers: {
                    Authorization: this.node.password,
                    "Client-Name": `Moonlink/${this.manager.version}`,
                    "guild-id": this.guildId,
                    "user-id": this.manager.clientId
                }
            }
        );
        const listener = new EventEmitter();

        this.voiceReceiverWs.on("message", (data: string) => {
            const payload = JSON.parse(data);

            switch (payload?.type) {
                case "startSpeakingEvent": {
                    payload.data.data = Buffer.from(
                        payload.data.data,
                        "base64"
                    );

                    listener.emit("start", {
                        ...payload.data
                    });

                    break;
                }
                case "stopSpeakingEvent": {
                    listener.emit("stop", {
                        ...payload.data
                    });

                    break;
                }
                default: {
                    listener.emit("unknown", {
                        ...payload
                    });
                }
            }
        });

        this.voiceReceiverWs.on("close", () => {
            listener.emit("close");
        });

        this.voiceReceiverWs.on("error", error => {
            listener.emit("error", error);
        });

        return listener;
    }

    /**
     * Stop listening to voice data from the NodeLink server.
     * @note NodeLink only feature
     */
    public stopListeningVoice(): void {
        if (!this.voiceReceiverWs) return;

        this.voiceReceiverWs.close();
        this.voiceReceiverWs = null;
    }
}
