import { MoonlinkNode } from "./MoonlinkNodes";
import { MoonlinkManager } from "./MoonlinkManager";
export interface voiceOptions {
    endpoint: string;
    token: string;
    sessionId: string;
    connected?: boolean;
    ping?: number;
}
export interface restOptions {
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
        voice?: voiceOptions;
    };
}
export type Endpoint = string;
export declare class MoonlinkRest {
    manager: MoonlinkManager;
    sessionId: string;
    node: MoonlinkNode;
    url: string;
    constructor(manager: MoonlinkManager, node: MoonlinkNode);
    setSessionId(sessionId: any): void;
    update(data: restOptions): Promise<object>;
    destroy(guildId: string): Promise<object>;
    get(endpoint: Endpoint): Promise<object>;
    post(endpoint: Endpoint, data: restOptions): Promise<object>;
    patch(endpoint: Endpoint, data: restOptions): Promise<object>;
    delete(endpoint: Endpoint): Promise<object>;
}
