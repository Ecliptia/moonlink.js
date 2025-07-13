import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";
import { ILavaLyricsObject, ILavaLyricsLine } from "../typings/Interfaces";
export declare class LyricsKtPlugin extends AbstractPlugin {
    name: string;
    readonly capabilities: string[];
    node: Node;
    private lyricsCallbacks;
    private lyricsCache;
    private searchCache;
    load(node: Node): void;
    unload(node: Node): void;
    private mapLyricsKtResponse;
    search(query: string): Promise<any[]>;
    getLyricsByVideoId(videoId: string): Promise<ILavaLyricsObject | null>;
    getLyricsForCurrentTrack(guildId: string): Promise<ILavaLyricsObject | null>;
    private liveLyricsIntervals;
    private cleanTrackTitle;
    getStaticLyricsForTrack(guildId: string): Promise<ILavaLyricsObject | null>;
    subscribeToLiveLyrics(guildId: string): Promise<void>;
    unsubscribeFromLiveLyrics(guildId: string): Promise<void>;
    registerLyricsCallback(guildId: string, callback: (line: ILavaLyricsLine) => void): void;
    unregisterLyricsCallback(guildId: string): void;
}
