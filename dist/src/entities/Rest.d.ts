import { Node } from "./Node";
import { IRESTLoadTracks, IRESTGetLyrics, IRESTGetPlayers, ITrack, INodeStats, IRoutePlannerStatus } from "../typings/interfaces";
export declare class Rest {
    private readonly node;
    constructor(node: Node);
    get url(): string;
    getPlayers(): Promise<IRESTGetPlayers[] | null>;
    getPlayer(guildId: string): Promise<any | null>;
    updatePlayer(guildId: string, data: any, noReplace?: boolean): Promise<any | null>;
    destroyPlayer(guildId: string): Promise<void>;
    loadTracks(identifier: string): Promise<IRESTLoadTracks>;
    decodeTrack(encodedTrack: string): Promise<ITrack | null>;
    decodeTracks(encodedTracks: string[]): Promise<ITrack[] | null>;
    getInfo(): Promise<any | null>;
    getVersion(): Promise<string | null>;
    getStats(): Promise<INodeStats | null>;
    getRoutePlannerStatus(): Promise<IRoutePlannerStatus | null>;
    freeFailedAddress(address: string): Promise<void>;
    freeAllFailedAddresses(): Promise<void>;
    getLyrics(trackId: string): Promise<IRESTGetLyrics | null>;
    updateSession(resuming: boolean, timeout: number): Promise<any | null>;
}
