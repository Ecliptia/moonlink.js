import { MoonlinkTrackOptions } from "../@Typings";
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
    time?: number;
    constructor(data?: MoonlinkTrackOptions, requester?: string | any);
    get calculateRealTimePosition(): number;
}
