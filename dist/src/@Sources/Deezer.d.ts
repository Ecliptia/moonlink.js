import { MoonlinkManager } from "../@Moonlink/MoonlinkManager";
export declare class Deezer {
    manager: MoonlinkManager;
    constructor(options: MoonlinkManager, others: any);
    check(uri: string): any;
    request(endpoint: string): Promise<any>;
    resolve(url: string): Promise<any>;
    fetchPlaylist(id: string): Promise<any>;
    fetchAlbum(id: string): Promise<any>;
    fetchArtist(id: string): Promise<any>;
    fetchTrack(id: string): Promise<any>;
    fetch(query: string): Promise<any>;
    buildUnresolved(track: any): Promise<any>;
}
