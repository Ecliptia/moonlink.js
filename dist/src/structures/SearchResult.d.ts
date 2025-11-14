import { IRESTLoadTracks } from "../typings/interfaces";
import { LoadType } from "../typings/types";
import { Track } from "../entities/Track";
export declare class SearchResult {
    loadType: LoadType;
    tracks: Track[];
    playlistName?: string;
    exception?: {
        message: string;
        severity: string;
    };
    constructor(response: IRESTLoadTracks, requester?: any);
    get isPlaylist(): boolean;
    get isTrack(): boolean;
    get isSearch(): boolean;
    get isEmpty(): boolean;
    get isError(): boolean;
}
