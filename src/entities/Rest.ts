import { makeRequest } from "../Util";
import { Node } from "./Node";
import { IRESTLoadTracks, IRESTGetLyrics, IRESTGetPlayers, ITrack, INodeStats, IRoutePlannerStatus } from "../typings/Interfaces";

export class Rest {
    private readonly node: Node;
    private readonly authHeaders: Record<string, string>;
    private readonly jsonHeaders: Record<string, string>;
    private readonly userAgentHeaders: Record<string, string>;

    constructor(node: Node) {
        this.node = node;
        this.authHeaders = {
            "Authorization": this.node.password,
            "User-Agent": this.node.manager.options?.userAgent
        };
        this.jsonHeaders = {
            ...this.authHeaders,
            "Content-Type": "application/json"
        };
        this.userAgentHeaders = {
            "User-Agent": this.node.manager.options?.userAgent
        };
    }

    public get url(): string {
        return `http${this.node.secure ? "s" : ""}://${this.node.host}:${this.node.port}`;
    }

    public async getPlayers(): Promise<IRESTGetPlayers[] | null> {
        const res = await makeRequest<IRESTGetPlayers[]>(`${this.url}/v4/sessions/${this.node.sessionId}/players`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }

    public async getPlayer(guildId: string): Promise<any | null> {
        const res = await makeRequest<any>(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }

    public async updatePlayer(guildId: string, data: any, noReplace: boolean = false): Promise<any | null> {
        const params = new URLSearchParams();
        if (noReplace) {
            params.append("noReplace", "true");
        }
        const res = await makeRequest<any>(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}?${params.toString()}`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: data
        });
        return res || null;
    }

    public async destroyPlayer(guildId: string): Promise<void> {
        await makeRequest(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}`, {
            method: "DELETE",
            headers: this.authHeaders
        });
    }

    public async loadTracks(identifier: string): Promise<IRESTLoadTracks> {
        const params = new URLSearchParams();
        params.append("identifier", identifier);

        const res = await makeRequest<any>(`${this.url}/v4/loadtracks?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res || { loadType: "empty", data: {} };
    }

    public async decodeTrack(encodedTrack: string): Promise<ITrack | null> {
        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);

        const res = await makeRequest<ITrack>(`${this.url}/v4/decodetrack?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }

    public async decodeTracks(encodedTracks: string[]): Promise<ITrack[] | null> {
        const res = await makeRequest<ITrack[]>(`${this.url}/v4/decodetracks`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: encodedTracks
        });
        return res || null;
    }

    public async getInfo(): Promise<any | null> {
        const res = await makeRequest<any>(`${this.url}/v4/info`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }

    public async getVersion(): Promise<string | null> {
        const res = await makeRequest<string>(`${this.url}/version`, {
            method: "GET",
            headers: this.userAgentHeaders
        });
        return res || null;
    }

    public async getStats(): Promise<INodeStats | null> {
        const res = await makeRequest<INodeStats>(`${this.url}/v4/stats`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }

    public async getRoutePlannerStatus(): Promise<IRoutePlannerStatus | null> {
        const res = await makeRequest<IRoutePlannerStatus>(`${this.url}/v4/routeplanner/status`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }

    public async freeFailedAddress(address: string): Promise<void> {
        await makeRequest(`${this.url}/v4/routeplanner/free/address`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: { address }
        });
    }

    public async freeAllFailedAddresses(): Promise<void> {
        await makeRequest(`${this.url}/v4/routeplanner/free/all`, {
            method: "POST",
            headers: this.authHeaders
        });
    }

    public async updateSession(resuming: boolean, timeout: number): Promise<any | null> {
        const res = await makeRequest<any>(`${this.url}/v4/sessions/${this.node.sessionId}`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: {
                resuming,
                timeout
            }
        });
        return res || null;
    }
}
