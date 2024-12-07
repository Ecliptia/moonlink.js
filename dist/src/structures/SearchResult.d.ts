import { IPlaylistInfo, Track } from "../../index";
export declare class SearchResult {
    query: string;
    source: string;
    tracks: Track[];
    loadType: string;
    playlistInfo: IPlaylistInfo;
    error?: string;
    constructor(req: any, options: {
        query: string;
        source?: string;
        requester?: unknown;
    });
    private resolveTracks;
}
