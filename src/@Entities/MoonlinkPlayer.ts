import {
    MoonlinkRestFul,
    MoonlinkManager,
    MoonlinkQueue,
    MoonlinkNode,
    MoonlinkTrack,
    Structure
} from "../../index";
import { PlayerInfos, connectOptions, PreviousInfosPlayer } from "../@Typings";
export class MoonlinkPlayer {
    public manager: MoonlinkManager;
    private infos: PlayerInfos;
    private map: Map<string, any>;
    public guildId: string;
    public textChannel: string;
    public voiceChannel: string;
    public autoPlay: boolean | null;
    public autoLeave: boolean | null;
    public connected: boolean | null;
    public playing: boolean | null;
    public paused: boolean | null;
    public loop: number | null;
    public volume: number;
    public shuffled: boolean | null;
    public ping: number;
    public queue: MoonlinkQueue;
    public current: Record<string, any>;
    public previous: Record<string, any>;
    public data: Record<string, any>;
    public node: MoonlinkNode | any;
    public rest: MoonlinkRestFul;

    /**
     * Creates an instance of MoonlinkPlayer.
     * @param infos - Player information.
     * @param manager - MoonlinkManager instance.
     * @param map - Map for storing player data.
     */
    constructor(
        infos: PlayerInfos,
        manager: MoonlinkManager,
        map: Map<string, any>
    ) {
        // Initialize properties and set default values based on input parameters.
        this.guildId = infos.guildId;
        this.textChannel = infos.textChannel;
        this.voiceChannel = infos.voiceChannel;
        this.autoPlay = infos.autoPlay;
        this.autoLeave = infos.autoLeave || false;
        this.connected = infos.connected || null;
        this.playing = infos.playing || null;
        this.paused = infos.paused || null;
        this.loop = infos.loop || null;
        this.volume = infos.volume || 90;
        this.shuffled = infos.shuffled || false;
        this.ping = infos.ping || 0;
        this.queue = new (Structure.get("MoonlinkQueue"))(manager, this);
        this.current = map.get("current") || {};
        this.current = this.current[this.guildId];
        this.previous = map.get("previous") || {};
        this.previous = this.previous[this.guildId];
        this.map = map;
        this.data = this.map.get("players") || {};
        this.data = this.data[this.guildId];
        this.node = manager.nodes.get(this.get("node"));
        this.rest = this.node.rest;
        this.manager = manager;

        const existingData =
            this.queue.db.get<PreviousInfosPlayer>(`players.${this.guildId}`) ||
            {};

        if (
            this.voiceChannel &&
            this.voiceChannel !==
                (existingData.voiceChannel && existingData.voiceChannel)
        ) {
            existingData.voiceChannel = this.voiceChannel;
        }

        if (
            this.textChannel &&
            this.textChannel !==
                (existingData.textChannel && existingData.textChannel)
        ) {
            existingData.textChannel = this.textChannel;
        }
        if (
            existingData !==
            (this.queue.db.get<PreviousInfosPlayer>(
                `players.${this.guildId}`
            ) || {})
        ) {
            this.queue.db.set<PreviousInfosPlayer>(
                `players.${this.guildId}`,
                existingData
            );
        }
    }

    /**
     * Private method to update player information in the map.
     */
    private updatePlayers(): void {
        let players = this.map.get("players") || {};
        players[this.guildId] = this.data;
        this.map.set("players", players);
    }

    /**
     * Set a key-value pair in the player's data and update the map.
     * @param key - The key to set.
     * @param value - The value to set.
     */
    public set(key: string, value: unknown): void {
        this.data[key] = value;
        this.updatePlayers();
    }

    /**
     * Get a value from the player's data.
     * @param key - The key to retrieve.
     * @returns The value associated with the key.
     */
    public get<T>(key: string): T {
        this.updatePlayers();
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
        this.set("textChannel", channelId);
        this.textChannel = channelId;
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
        this.set("voiceChannel", channelId);
        this.voiceChannel = channelId;
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
        this.set("autoLeave", mode);
        this.autoLeave = mode;
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
        this.set("autoPlay", mode);
        this.autoPlay = mode;
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
        this.set("connected", true);
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
        return true;
    }

    /**
     * Disconnect the player from the voice channel.
     * @returns True if the disconnection was successful.
     */
    public disconnect(): boolean {
        this.set("connected", false);
        this.set("voiceChannel", null);
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
        return true;
    }

    /**
     * Restart the player by reconnecting and updating its state.
     */
    public async restart(): Promise<void> {
        if (!this.current || !this.queue.size) return;

        await this.connect({
            setDeaf: true,
            setMute: false
        }); // applicaçao discord ainda escultam mesmo com deaf ativo, mas a lavalink é um servidor surdo

        await this.manager.players.attemptConnection(this.guildId);

        if (!this.current && this.queue.size) {
            this.play();
            return;
        }

        await this.rest.update({
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
    /**
     * Play the next track in the queue.
     */
    public async play(track?: MoonlinkTrack | string): Promise<boolean> {
        if (!track && !this.queue.size) return false;

        let data: MoonlinkTrack | string | null = track
            ? track
            : this.queue.shift();

        if (!data) return false;
        let current = this.map.get("current") || {};

        if (this.loop && Object.keys(current[this.guildId]).length != 0) {
            current[this.guildId].time
                ? (current[this.guildId].time = 0)
                : false;
            this.set("ping", undefined);
            this.queue.push(current[this.guildId]);
        }

        if (typeof data == "string") {
            try {
                let resolveTrack: any = await this.rest.decodeTrack(data);
                data = new (Structure.get("MoonlinkTrack"))(resolveTrack, null);
            } catch (err) {
                this.manager.emit(
                    "debug",
                    "@Moonlink(Player) - falha ao tentar decodificar uma track " +
                        data +
                        ", error: " +
                        err
                );
                return;
            }
        }

        current[this.guildId] = data;

        this.map.set("current", current);

        await this.rest.update({
            guildId: this.guildId,
            data: {
                track: {
                    encoded: data.encoded
                },
                volume: this.volume
            }
        });
        return true;
    }

    /**
     * Pause the playback.
     * @returns True if paused successfully.
     */
    public async pause(): Promise<boolean> {
        if (this.paused) return true;
        await this.updatePlaybackStatus(true);
        return true;
    }

    /**
     * Resume the playback.
     * @returns True if resumed successfully.
     */
    public async resume(): Promise<boolean> {
        if (this.playing) return true;
        await this.updatePlaybackStatus(false);
        return true;
    }

    /**
     * Private method to update the playback status (paused or resumed).
     * @param paused - Indicates whether to pause or resume the playback.
     */
    private async updatePlaybackStatus(paused: boolean): Promise<void> {
        await this.rest.update({
            guildId: this.guildId,
            data: { paused }
        });
        this.set("paused", paused);
        this.set("playing", !paused);
    }

    /**
     * Stop the playback and optionally clear player data.
     * @returns True if stopped successfully.
     */
    public async stop(destroy?: boolean): Promise<boolean> {
        if (!this.queue.size) {
            await this.rest.update({
                guildId: this.guildId,
                data: {
                    track: { encoded: null }
                }
            });
        }
        this.manager.options?.destroyPlayersStopped && destroy
            ? this.destroy()
            : this.queue.clear();
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
            let currents: Map<string, any> = this.map.get("current") || {};
            currents[this.guildId] = data;
            this.map.set("current", currents);
            this.queue.setQueue(queue);

            await this.play(data as MoonlinkTrack);
            return true;
        }
        /* 
            @Author: PiscesXD
            Track shuffling logic
          */
        if (this.queue.size && this.data.shuffled) {
            let currentQueue: MoonlinkTrack[] = this.queue.all;
            const randomIndex = Math.floor(Math.random() * currentQueue.length);
            const shuffledTrack = currentQueue.splice(randomIndex, 1)[0];
            currentQueue.unshift(shuffledTrack);
            this.queue.setQueue(currentQueue);
            this.play();
            return;
        }

        if (this.queue.size) {
            this.play();
            return false;
        } else {
            this.stop();
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
        if (typeof percent == "undefined" || typeof percent !== "number") {
            throw new Error(
                '@Moonlink(Player) - option "percent" is empty or different from a number'
            );
        }
        if (!this.playing) {
            throw new Error(
                "@Moonlink(Player) - cannot change volume while the player is not playing"
            );
        }

        await this.rest.update({
            guildId: this.guildId,
            data: { volume: percent }
        });
        this.set("volume", percent);
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

        this.set("loop", mode);
        return mode;
    }

    /**
     * Destroy the player, disconnecting it and removing player data.
     * @returns True if the player was successfully destroyed.
     */
    public async destroy(): Promise<boolean> {
        if (this.connected) this.disconnect();
        await this.rest.destroy(this.guildId);
        this.queue.clear();
        let players = this.map.get("players");
        delete players[this.guildId];
        this.map.set("players", players);
        this.manager.emit(
            "debug",
            "@Moonlink(Player): destroyed player " + this.guildId
        );

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

        await this.rest.update({
            guildId: this.guildId,
            data: { position }
        });

        return position;
    }

    /**
     * Shuffle the tracks in the queue.
     * @returns True if the shuffle was successful.
     * @throws Error if the queue is empty.
     */
    public shuffle(mode?: boolean | null): boolean | null {
        /* 
            @Author: PiscesXD
            Track shuffling logic
          */
        if (!this.queue.size) {
            throw new Error(
                `@Moonlink(Player) - The "shuffle" method doesn't work if there are no tracks in the queue`
            );
            return false;
        }
        mode ? mode : (mode = !this.shuffled);
        this.set("shuffled", mode);
        this.shuffled = mode;
        return mode;
    }
}
