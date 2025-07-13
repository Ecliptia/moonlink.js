import { IPlaylistInfo, Track, ILavaSearchAlbum, ILavaSearchArtist, ILavaSearchPlaylist, ILavaSearchText } from "../../index";
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
    albums?: ILavaSearchAlbum[];
    artists?: ILavaSearchArtist[];
    playlists?: ILavaSearchPlaylist[];
    texts?: ILavaSearchText[];
    lavasearchPluginInfo?: Object;
    isLavaSearchResult?: boolean;
    constructor(req: any, options: SearchResultOptions);
    private resolveTracks;
    getFirst(): Track | undefined;
    getTotalDuration(): number;
}
