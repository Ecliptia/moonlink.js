export = Spotify;
declare class Spotify {
    constructor(options: any, others: any);
    manager: any;
    options: any;
    clientId: any;
    clientSecret: any;
    check(uri: any): boolean;
    requestToken(): Promise<void>;
    renew(): Promise<void>;
    request(endpoint: any): Promise<any>;
    resolve(url: any): Promise<{
        loadType: string;
        tracks: any[];
        playlistInfo: {
            name: any;
        } | {
            name?: undefined;
        };
    } | {
        loadType: string;
        tracks: MoonlinkTrack[];
        playlistInfo: {};
    }>;
    fetchPlaylist(id: any): Promise<{
        loadType: string;
        tracks: any[];
        playlistInfo: {
            name: any;
        } | {
            name?: undefined;
        };
    }>;
    fetchAlbum(id: any): Promise<{
        loadType: string;
        tracks: any[];
        playlistInfo: {
            name: any;
        } | {
            name?: undefined;
        };
    }>;
    fetchArtist(id: any): Promise<{
        loadType: string;
        tracks: any[];
        playlistInfo: {
            name: any;
        } | {
            name?: undefined;
        };
    }>;
    fetchTrack(id: any): Promise<{
        loadType: string;
        tracks: MoonlinkTrack[];
        playlistInfo: {};
    }>;
    fetch(query: any): Promise<{
        loadType: string;
        tracks: any[];
        playlistInfo: {
            name: any;
        } | {
            name?: undefined;
        };
    } | {
        loadType: string;
        tracks: MoonlinkTrack[];
        playlistInfo: {};
    }>;
    buildUnresolved(track: any): Promise<MoonlinkTrack>;
    #private;
}
import { MoonlinkTrack } from "../@Rest/MoonlinkTrack.js";
