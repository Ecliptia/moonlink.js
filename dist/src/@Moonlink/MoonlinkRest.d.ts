import { MoonlinkNode, MoonlinkManager } from "../../index";
export interface VoiceOptions {
    endpoint: string;
    token: string;
    sessionId: string;
    connected?: boolean;
    ping?: number;
}
export interface RestOptions {
    guildId: string;
    data: {
        encodedTrack?: string;
        identifier?: string;
        startTime?: number;
        endTime?: number;
        volume?: number;
        position?: number;
        paused?: Boolean;
        filters?: Object;
        voice?: VoiceOptions;
    };
}
export type Endpoint = string;
export declare class MoonlinkRest {
    manager: MoonlinkManager;
    sessionId: string;
    node: MoonlinkNode;
    url: string;
    constructor(manager: MoonlinkManager, node: MoonlinkNode);
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
