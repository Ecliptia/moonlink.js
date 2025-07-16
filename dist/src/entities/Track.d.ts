import { ITrack, IChapter } from "../typings/Interfaces";
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
    origin?: string;
    requestedBy?: Object | string;
    pluginInfo: Record<string, any>;
    chapters?: IChapter[];
    currentChapterIndex?: number;
    private isPartial;
    constructor(trackData: ITrack, requester?: Object | string);
    private createPropertySetters;
    setPosition(position: number): void;
    setTime(time: number): void;
    setChapters(chapters: IChapter[]): void;
    setRequester(requester: Object | string): void;
    resolve(): Promise<boolean>;
    resolveData(): Track;
    isPartialTrack(): boolean;
    raw(): ITrack;
    getThumbnailUrl(quality?: string): string | undefined;
    static unresolvedTrack(options: {
        title: string;
        author: string;
        duration?: number;
        source?: string;
    }): Promise<Track>;
}
