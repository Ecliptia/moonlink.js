import { MoonlinkManager, MoonlinkNode } from "../..";
import { RestOptions, Endpoint } from "../@Typings";
export declare class MoonlinkRestFul {
    manager: MoonlinkManager;
    sessionId: string;
    node: MoonlinkNode;
    url: string;
    constructor(node: MoonlinkNode);
    setSessionId(sessionId: string): void;
    update(data: RestOptions): Promise<object>;
    destroy(guildId: string): Promise<object>;
    get(endpoint: Endpoint): Promise<object>;
    post(endpoint: Endpoint, data: RestOptions): Promise<object>;
    patch(endpoint: Endpoint, data: RestOptions | any): Promise<object>;
    delete(endpoint: Endpoint): Promise<object>;
    decodeTrack(encodedTrack: string): Promise<object>;
    decodeTracks(data: RestOptions): Promise<object>;
    getInfo(): Promise<object>;
    getStats(): Promise<object>;
    getVersion(): Promise<object>;
    routePlannerFreeAddress(data: RestOptions): Promise<object>;
    routePlannerFreeAll(data: RestOptions): Promise<object>;
    private ensureUrlIsSet;
    private makeGetRequest;
    private makePostRequest;
    private makePatchRequest;
    private makeDeleteRequest;
}
