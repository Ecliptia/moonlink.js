import { IRESTLoadTracks } from "../typings/Interfaces";
import { LoadType } from "../typings/types";
import { Track } from "../entities/Track";

export class SearchResult {
    public loadType: LoadType;
    public tracks: Track[];
    public playlistInfo?: { name: string; selectedTrack: number; duration: number };
    public exception?: {
        message: string;
        severity: string;
    };

    constructor(response: IRESTLoadTracks, requester?: any, playlistLoadLimit?: number) {
        switch (response.loadType) {
            case "track":
                this.loadType = LoadType.TRACK;
                this.tracks = [new Track(response.data, requester)];
                break;

            case "playlist":
                this.loadType = LoadType.PLAYLIST;
                this.tracks = response.data.tracks
                    .slice(0, playlistLoadLimit)
                    .map(track => new Track(track, requester));
                this.playlistInfo = {
                    duration: response.data.tracks.reduce(
                        (acc: number, cur: any) => acc + (cur.info.length || 0),
                        0
                    ),
                    name: response.data.info.name,
                    selectedTrack: response.data.info.selectedTrack
                };
                break;

            case "search":
                this.loadType = LoadType.SEARCH;
                this.tracks = response.data.map(track => new Track(track, requester));
                break;

            case "empty":
                this.loadType = LoadType.EMPTY;
                this.tracks = [];
                break;

            case "error":
                this.loadType = LoadType.ERROR;
                this.tracks = [];
                this.exception = response.data;
                break;
            
            default:
                this.loadType = LoadType.EMPTY;
                this.tracks = [];
                break;
        }
    }

    public get isPlaylist(): boolean {
        return this.loadType === LoadType.PLAYLIST;
    }

    public get isTrack(): boolean {
        return this.loadType === LoadType.TRACK;
    }

    public get isSearch(): boolean {
        return this.loadType === LoadType.SEARCH;
    }

    public get isEmpty(): boolean {
        return this.loadType === LoadType.EMPTY;
    }

    public get isError(): boolean {
        return this.loadType === LoadType.ERROR;
    }
}
