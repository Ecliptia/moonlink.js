import { IRESTLoadTracks } from "../typings/Interfaces";
import { LoadType } from "../typings/types";
import { Track } from "../entities/Track";
export declare class SearchResult {
    loadType: LoadType;
    tracks: Track[];
    playlistInfo?: {
        name: string;
        selectedTrack: number;
        duration: number;
    };
    exception?: {
        message: string;
        severity: string;
    };
    constructor(response: IRESTLoadTracks, requester?: any, playlistLoadLimit?: number);
    get isPlaylist(): boolean;
    get isTrack(): boolean;
    get isSearch(): boolean;
    get isEmpty(): boolean;
    get isError(): boolean;
}
