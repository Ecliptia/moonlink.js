import { MoonlinkManager } from "../@Moonlink/MoonlinkManager";
export declare class Spotify {
    private token;
    private interval;
    private authorization;
    manager: MoonlinkManager;
    options: any;
    clientId: string | null;
    clientSecret: string | null;
    constructor(options: MoonlinkManager, others: any);
    check(uri: string): any;
    requestToken(): Promise<void>;
    renew(): Promise<void>;
    request(endpoint: string): Promise<any>;
    resolve(url: string): Promise<any>;
    fetchPlaylist(id: string): Promise<any>;
    fetchAlbum(id: string): Promise<any>;
    fetchArtist(id: string): Promise<any>;
    fetchTrack(id: string): Promise<any>;
    fetch(query: string): Promise<any>;
    buildUnresolved(track: any): Promise<any>;
}
