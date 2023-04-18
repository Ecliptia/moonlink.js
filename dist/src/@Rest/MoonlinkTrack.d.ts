export interface MoonlinkTrackOptionsInfo {
    identifier: string;
    isSeekable: boolean;
    author: string;
    isStream: boolean;
    length: number;
    position: number;
    title: string;
    uri?: string;
    thumbnail?: string | null;
    sourceName: string;
}
export interface MoonlinkTrackOptions {
    info: MoonlinkTrackOptionsInfo;
    track?: string;
    encoded?: string;
    trackEncoded: string;
}
export declare class MoonlinkTrack {
    track: string | null;
    encoded: string | null;
    trackEncoded: string | null;
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
    constructor(data: MoonlinkTrackOptions);
    get thumbnail(): string | null;
    setRequester(data: any): void;
}
