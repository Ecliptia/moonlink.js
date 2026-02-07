import { Node } from "./Node";
import { IRESTLoadTracks, IRESTGetPlayers, ITrack, INodeStats, IRoutePlannerStatus } from "../typings/Interfaces";
export declare class Rest {
    private readonly node;
    private readonly authHeaders;
    private readonly jsonHeaders;
    private readonly userAgentHeaders;
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
    updateSession(resuming: boolean, timeout: number): Promise<any | null>;
}
