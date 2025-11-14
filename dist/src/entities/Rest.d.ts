import { Node } from "./Node";
import { IRESTLoadTracks, IRESTGetLyrics, IRESTGetPlayers } from "../typings/interfaces";
export declare class Rest {
    private readonly node;
    constructor(node: Node);
    get url(): string;
    getPlayers(): Promise<IRESTGetPlayers[] | null>;
    getPlayer(guildId: string): Promise<any | null>;
    updatePlayer(guildId: string, data: any): Promise<any | null>;
    destroyPlayer(guildId: string): Promise<void>;
    loadTracks(identifier: string): Promise<IRESTLoadTracks>;
    getLyrics(trackId: string): Promise<IRESTGetLyrics | null>;
    updateSession(resuming: boolean, timeout: number): Promise<any | null>;
}
