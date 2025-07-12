import { IPlaylistInfo, Track } from "../../index";
export type LoadType = 'track' | 'search' | 'playlist' | 'error' | 'empty' | 'short';
export interface SearchResultOptions {
    query: string;
    source?: string;
    requester?: unknown;
}
export declare class SearchResult {
    query: string;
    source: string;
    tracks: Track[];
    loadType: LoadType;
    playlistInfo: IPlaylistInfo;
    error?: string;
    constructor(req: any, options: SearchResultOptions);
    private resolveTracks;
    getFirst(): Track | undefined;
    getTotalDuration(): number;
}
