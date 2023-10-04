import { MoonlinkManager, MoonlinkQueue, MoonlinkRest, MoonlinkNode, MoonlinkFilters } from "../../index";
/**
 * Interface for optional connection options.
 */
export interface connectOptions {
    setMute?: boolean;
    setDeaf?: boolean;
}
/**
 * Interface for player information.
 */
export interface PlayerInfos {
    guildId: string;
    textChannel: string;
    voiceChannel: string | null;
    autoPlay?: boolean | null;
    connected?: boolean | null;
    playing?: boolean | null;
    paused?: boolean | null;
    shuffled?: boolean | null;
    loop?: number | null;
    volume?: number | null;
    node?: string;
}
/**
 * Represents a Moonlink media player.
 */
export declare class MoonlinkPlayer {
    private manager;
    private infos;
    private map;
    payload: Function;
    guildId: string;
    textChannel: string;
    voiceChannel: string;
    autoPlay: boolean | null;
    connected: boolean | null;
    playing: boolean | null;
    paused: boolean | null;
    loop: number | null;
    volume: number;
    shuffled: boolean | null;
    queue: MoonlinkQueue;
    filters: MoonlinkFilters;
    current: any;
    previous: any;
    data: any;
    node: MoonlinkNode | any;
    rest: MoonlinkRest;
    /**
     * Creates an instance of MoonlinkPlayer.
     * @param infos - Player information.
     * @param manager - MoonlinkManager instance.
     * @param map - Map for storing player data.
     */
    constructor(infos: PlayerInfos, manager: MoonlinkManager, map: Map<string, any>);
    /**
     * Private method to update player information in the map.
     */
    private updatePlayers;
    /**
     * Set a key-value pair in the player's data and update the map.
     * @param key - The key to set.
     * @param value - The value to set.
     */
    set(key: string, value: unknown): void;
    /**
     * Get a value from the player's data.
     * @param key - The key to retrieve.
     * @returns The value associated with the key.
     */
    get<T>(key: string): T;
    /**
     * Set the text channel for the player.
     * @param channelId - The ID of the text channel.
     * @returns True if the channel was set successfully.
     * @throws Error if channelId is empty or not a string.
     */
    setTextChannel(channelId: string): boolean;
    /**
     * Set the voice channel for the player.
     * @param channelId - The ID of the voice channel.
     * @returns True if the channel was set successfully.
     * @throws Error if channelId is empty or not a string.
     */
    setVoiceChannel(channelId: string): boolean;
    /**
     * Set the auto-play mode for the player.
     * @param mode - Auto-play mode (true/false).
     * @returns True if the mode was set successfully.
     * @throws Error if mode is not a boolean.
     */
    setAutoPlay(mode: boolean): boolean;
    /**
     * Connect the player to a voice channel with optional connection options.
     * @param options - Connection options (setMute, setDeaf).
     * @returns True if the connection was successful.
     */
    connect(options: connectOptions): boolean | null;
    /**
     * Disconnect the player from the voice channel.
     * @returns True if the disconnection was successful.
     */
    disconnect(): boolean;
    /**
     * Restart the player by reconnecting and updating its state.
     */
    restart(): Promise<void>;
    /**
     * Play the next track in the queue.
     */
    play(): Promise<void>;
    /**
     * Pause the playback.
     * @returns True if paused successfully.
     */
    pause(): Promise<boolean>;
    /**
     * Resume the playback.
     * @returns True if resumed successfully.
     */
    resume(): Promise<boolean>;
    /**
     * Private method to update the playback status (paused or resumed).
     * @param paused - Indicates whether to pause or resume the playback.
     */
    private updatePlaybackStatus;
    /**
     * Stop the playback and optionally clear player data.
     * @returns True if stopped successfully.
     */
    stop(destroy?: boolean): Promise<boolean>;
    /**
     * Skip to the next track in the queue.
     * @returns True if the next track was successfully played.
     */
    skip(): Promise<boolean>;
    /**
     * Set the volume level for the player.
     * @param percent - Volume percentage (0 to Infinity).
     * @returns The new volume level.
     * @throws Error if the volume is not a valid number or player is not playing.
     */
    setVolume(percent: number): Promise<number>;
    /**
     * Set the loop mode for the player.
     * @param mode - Loop mode (0 for no loop, 1 for single track, 2 for entire queue).
     * @returns The new loop mode.
     * @throws Error if the mode is not a valid number or out of range.
     */
    setLoop(mode: number | null): number | null;
    /**
     * Destroy the player, disconnecting it and removing player data.
     * @returns True if the player was successfully destroyed.
     */
    destroy(): Promise<boolean>;
    /**
     * Private method to validate a number parameter.
     * @param param - The number parameter to validate.
     * @param paramName - The name of the parameter.
     * @throws Error if the parameter is not a valid number.
     */
    private validateNumberParam;
    /**
     * Seek to a specific position in the current track.
     * @param position - The position to seek to.
     * @returns The new position after seeking.
     * @throws Error if the position is greater than the track duration or seek is not allowed.
     */
    seek(position: number): Promise<number | null>;
    /**
     * Skip to a specific position in the queue.
     * @param position - The position to skip to.
     * @returns True if the position exists and the skip was successful.
     * @throws Error if the queue is empty, or the indicated position does not exist.
     */
    skipTo(position: number): Promise<boolean | void>;
    /**
     * Shuffle the tracks in the queue.
     * @returns True if the shuffle was successful.
     * @throws Error if the queue is empty.
     */
    shuffle(mode?: boolean | null): boolean | null;
}
