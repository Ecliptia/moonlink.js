import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";
import { ILavaLyricsObject, ILavaLyricsLine } from "../typings/Interfaces";
export declare class LavaLyricsPlugin extends AbstractPlugin {
    name: string;
    readonly capabilities: string[];
    node: Node;
    private lyricsCallbacks;
    load(node: Node): void;
    unload(node: Node): void;
    private mapLavaLyricsResponse;
    getLyricsForCurrentTrack(guildId: string, skipTrackSource?: boolean): Promise<ILavaLyricsObject | null>;
    getLyricsForTrack(encodedTrack: string, skipTrackSource?: boolean): Promise<ILavaLyricsObject | null>;
    subscribeToLiveLyrics(guildId: string, skipTrackSource?: boolean): Promise<void>;
    unsubscribeFromLiveLyrics(guildId: string): Promise<void>;
    registerLyricsCallback(guildId: string, callback: (line: ILavaLyricsLine) => void): void;
    unregisterLyricsCallback(guildId: string): void;
    handleEvent(node: Node, payload: any): void;
}
