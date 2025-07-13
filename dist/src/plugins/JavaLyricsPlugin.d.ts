import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";
import { ILavaLyricsObject, ILavaLyricsLine } from "../typings/Interfaces";
import { Player } from "../entities/Player";
export declare class JavaLyricsPlugin extends AbstractPlugin {
    name: string;
    readonly capabilities: string[];
    node: Node;
    private lyricsCallbacks;
    private lyricsCache;
    private searchCache;
    private liveLyricsTimeouts;
    load(node: Node): void;
    unload(node: Node): void;
    onTrackEnd(player: Player): void;
    private mapLyricsResponse;
    search(query: string, source?: string): Promise<any[]>;
    getLyricsByVideoId(videoId: string): Promise<ILavaLyricsObject | null>;
    getLyricsForCurrentTrack(guildId: string): Promise<ILavaLyricsObject | null>;
    private cleanTrackTitle;
    getStaticLyricsForTrack(guildId: string): Promise<ILavaLyricsObject | null>;
    subscribeToLiveLyrics(guildId: string): Promise<void>;
    private scheduleNextLine;
    unsubscribeFromLiveLyrics(guildId: string): Promise<void>;
    registerLyricsCallback(guildId: string, callback: (line: ILavaLyricsLine) => void): void;
    unregisterLyricsCallback(guildId: string): void;
}
