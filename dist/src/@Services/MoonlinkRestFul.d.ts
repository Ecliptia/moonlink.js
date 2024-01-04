import { MoonlinkManager, MoonlinkNode } from "../../index";
import { RestOptions, Endpoint } from "../@Typings";
export declare class MoonlinkRestFul {
    manager: MoonlinkManager;
    sessionId: string;
    node: MoonlinkNode;
    url: string;
    constructor(node: MoonlinkNode);
    setSessionId(sessionId: string): void;
    update(data: RestOptions): Promise<Record<string, unknown>>;
    destroy(guildId: string): Promise<Record<string, unknown>>;
    get(endpoint: Endpoint): Promise<Record<string, unknown>>;
    post(endpoint: Endpoint, data: RestOptions): Promise<Record<string, unknown>>;
    patch(endpoint: Endpoint, data: RestOptions | any): Promise<Record<string, unknown>>;
    delete(endpoint: Endpoint): Promise<Record<string, unknown>>;
    decodeTrack(encodedTrack: string): Promise<Record<string, unknown>>;
    decodeTracks(data: RestOptions): Promise<Record<string, unknown>>;
    getInfo(): Promise<Record<string, unknown>>;
    getStats(): Promise<Record<string, unknown>>;
    getVersion(): Promise<Record<string, unknown>>;
    routePlannerFreeAddress(data: RestOptions): Promise<Record<string, unknown>>;
    routePlannerFreeAll(data: RestOptions): Promise<Record<string, unknown>>;
    private ensureUrlIsSet;
    private makeGetRequest;
    private makePostRequest;
    private makePatchRequest;
    private makeDeleteRequest;
}
