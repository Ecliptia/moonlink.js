export interface TrackInfo {
    identifier: string;
    isSeekable: boolean;
    author: string;
    isStream: boolean;
    length: number;
    position: number;
    title: string;
    uri?: string;
    artworkUrl?: string | null;
    sourceName: string;
    isrc?: string;
}
export interface MoonlinkTrackOptions {
    info: TrackInfo;
    encoded?: string;
    pluginInfo?: object;
}
export declare class MoonlinkTrack {
    encoded: string | null;
    identifier: string;
    title: string;
    author: string;
    url: string;
    duration: number;
    position: number;
    isSeekable: boolean;
    isStream: boolean;
    sourceName: string;
    requester: any;
    artworkUrl: string;
    isrc: string;
    constructor(data: MoonlinkTrackOptions);
    setRequester(data: any): void;
}
