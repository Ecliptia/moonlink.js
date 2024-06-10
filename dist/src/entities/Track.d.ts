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
    requestedBy?: Object;
    constructor(trackData: ITrack, requester?: Object);
}
