import { MoonlinkManager } from '../../index';
interface SpotifyOptions {
    clientSecret?: string;
    clientId?: string;
    searchMarket?: string;
    artistLimit?: number;
    albumLimit?: number;
}
export declare class Spotify {
    private token;
    private interval;
    private clientId;
    private clientSecret;
    private authorization;
    private searchMarket;
    private artistLimit;
    private albumLimit;
    manager: MoonlinkManager;
    private searchDefault;
    constructor(data: SpotifyOptions, manager: MoonlinkManager);
    private init;
    private handleError;
    fetchPlaylist(id: string): Promise<any>;
    private fetchAllTracks;
    requestToken(): Promise<void>;
    renew(): Promise<void>;
    request(endpoint: string): Promise<any>;
    resolve(url: string): Promise<any>;
    fetchAlbum(id: string): Promise<any>;
    fetchArtist(id: string): Promise<any>;
    fetchTrack(id: string): Promise<any>;
    fetch(query: string): Promise<any>;
    isSpotifyUrl(url: string): boolean;
    buildUnresolved(track: any): Promise<any>;
}
export {};
