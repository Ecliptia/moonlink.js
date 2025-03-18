import { ITrack } from "../typings/Interfaces";
export declare class Track {
    encoded: string;
    url?: string;
    author: string;
    duration: number;
    title: string;
    position: number;
    identifier?: string;
    isSeekable: boolean;
    isStream: boolean;
    artworkUrl?: string;
    isrc?: string;
    time?: number;
    sourceName?: string;
    requestedBy?: Object | string;
    pluginInfo: Record<string, any>;
    private isPartial;
    constructor(trackData: ITrack, requester?: Object);
    private createPropertySetters;
    setRequester(requester: Object | string): void;
    resolveData(): Track;
    isPartialTrack(): boolean;
    raw(): ITrack;
    static unresolvedTrack(options: {
        title: string;
        author: string;
        duration?: number;
        source?: string;
    }): Promise<Track>;
}
