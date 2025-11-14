import { ITrack } from "../typings/interfaces";
export declare class Track {
    readonly encoded: string;
    title: string;
    author: string;
    duration: number;
    identifier: string;
    isSeekable: boolean;
    isStream: boolean;
    uri: string | null;
    artworkUrl: string | null;
    isrc: string | null;
    sourceName: string;
    position: number;
    time: number;
    requester: any;
    origin?: string;
    pluginInfo: Record<string, any>;
    userData: Record<string, any>;
    constructor(data: ITrack, requester?: any, origin?: string);
    get thumbnail(): string | null;
    setRequester(requester: any): this;
    setPosition(position: number): this;
    toJSON(): ITrack;
}
