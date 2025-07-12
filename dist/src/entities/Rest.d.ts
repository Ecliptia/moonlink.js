import { Node } from "../../index";
import { IRESTOptions, IRESTGetLyrics, IRESTGetPlayers } from "../typings/Interfaces";
export declare class Rest {
    node: Node;
    url: string;
    defaultHeaders: Record<string, string>;
    constructor(node: Node);
    loadTracks(source: string, query: string): Promise<any>;
    update(data: IRESTOptions): Promise<unknown>;
    destroy(guildId: string): Promise<unknown>;
    getInfo(): Promise<unknown>;
    getStats(): Promise<unknown>;
    getVersion(): Promise<unknown>;
    getLyrics(data: {
        encoded: string;
    }): Promise<IRESTGetLyrics>;
    updateSession(sessionId: string, data: any): Promise<any>;
    decodeTrack(encodedTrack: string): Promise<any>;
    decodeTracks(encodedTracks: string[]): Promise<any>;
    getPlayers(sessionId: string): Promise<IRESTGetPlayers>;
    getPlayer(sessionId: string, guildId: string): Promise<any>;
    getRoutePlannerStatus(): Promise<any>;
    unmarkFailedAddress(address: string): Promise<any>;
    unmarkAllFailedAddresses(): Promise<any>;
    patch(path: string, data: any): Promise<unknown>;
}
