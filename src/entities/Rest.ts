import { makeRequest, makeStreamRequest, normalizeNodeLinkResponse, type NodeLinkResponse, type ResponseWithHeaders, nodeLinkOnlyError } from "../Util";
import type { IChapter, IFilters, ILyricsData, ILyricsResponse, IMeaningResponse } from "../typings/Interfaces";
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

    public async getInfoWithHeaders(): Promise<ResponseWithHeaders<any> | null> {
        const res = await makeRequest<any>(`${this.url}/v4/info`, {
            method: "GET",
            headers: this.authHeaders,
            returnHeaders: true
        });
        return res || null;
    }

    public async getVersion(timeout?: number, retries?: number): Promise<string | null> {
        const res = await makeRequest<string>(`${this.url}/version`, {
            method: "GET",
            headers: this.authHeaders
        }, timeout, retries);
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

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async addMixLayer(
        guildId: string,
        data: { track: { encoded: string; userData?: Record<string, any> }; volume?: number }
    ): Promise<any | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("mix:add");
        }

        const res = await makeRequest<any>(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: data
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async getMixLayers(guildId: string): Promise<any | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("mix:list");
        }

        const res = await makeRequest<any>(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async updateMixLayerVolume(guildId: string, mixId: string, volume: number): Promise<void> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("mix:update");
        }

        await makeRequest(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix/${mixId}`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: { volume }
        });
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async removeMixLayer(guildId: string, mixId: string): Promise<void> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("mix:remove");
        }

        await makeRequest(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix/${mixId}`, {
            method: "DELETE",
            headers: this.authHeaders
        });
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async loadLyrics(encodedTrack: string, lang?: string): Promise<NodeLinkResponse<ILyricsData | Record<string, any>> | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("lyrics");
        }

        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        if (lang) params.append("lang", lang);

        const res = await makeRequest<ILyricsResponse>(`${this.url}/v4/loadlyrics?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res ? normalizeNodeLinkResponse(res, res.loadType) : null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async loadChapters(encodedTrack: string): Promise<NodeLinkResponse<IChapter[]> | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("chapters");
        }

        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);

        const res = await makeRequest<IChapter[]>(`${this.url}/v4/loadchapters?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res ? normalizeNodeLinkResponse(res, "chapters") : null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async loadMeaning(encodedTrack: string, lang?: string): Promise<NodeLinkResponse<IMeaningResponse | Record<string, any>> | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("meaning");
        }

        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        if (lang) params.append("lang", lang);

        const res = await makeRequest<IMeaningResponse>(`${this.url}/v4/meaning?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res ? normalizeNodeLinkResponse(res, res.loadType) : null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async getConnectionStatus(): Promise<NodeLinkResponse<{ status: string; metrics: any }> | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("connection");
        }

        const res = await makeRequest<{ status: string; metrics: any }>(`${this.url}/v4/connection`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res ? normalizeNodeLinkResponse(res, "connection") : null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async getMetrics(): Promise<string | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("metrics");
        }

        const res = await makeRequest<string>(`${this.url}/v4/metrics`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async getWorkers(): Promise<NodeLinkResponse<any[]> | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("workers:get");
        }

        const res = await makeRequest<any[]>(`${this.url}/v4/workers`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res ? normalizeNodeLinkResponse(res, "workers") : null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async patchWorker(payload: Record<string, any>): Promise<any | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("workers:patch");
        }

        const res = await makeRequest<any>(`${this.url}/v4/workers`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: payload
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async getYoutubeConfig(validate: boolean = false): Promise<any | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("youtube:config");
        }

        const params = new URLSearchParams();
        if (validate) params.append("validate", "true");
        const res = await makeRequest<any>(`${this.url}/v4/youtube/config${params.toString() ? `?${params}` : ""}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async updateYoutubeConfig(payload: { refreshToken?: string; visitorData?: string }): Promise<any | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("youtube:config");
        }

        const res = await makeRequest<any>(`${this.url}/v4/youtube/config`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: payload
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async exchangeYoutubeOAuth(refreshToken: string): Promise<any | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("youtube:oauth");
        }

        const params = new URLSearchParams();
        params.append("refreshToken", refreshToken);
        const res = await makeRequest<any>(`${this.url}/v4/youtube/oauth?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async encodeTrackRemote(track: string): Promise<string | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("encodetrack");
        }

        const params = new URLSearchParams();
        params.append("track", track);
        const res = await makeRequest<string>(`${this.url}/v4/encodetrack?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async encodeTracksRemote(tracks: Array<{ encoded: string; info: Record<string, any> }>): Promise<string[] | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("encodedtracks");
        }

        const res = await makeRequest<string[]>(`${this.url}/v4/encodedtracks`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: tracks
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async trackStream(encodedTrack: string, itag?: number | null): Promise<any | null> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("trackstream");
        }

        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        if (itag !== undefined && itag !== null) {
            params.append("itag", String(itag));
        }

        const res = await makeRequest<any>(`${this.url}/v4/trackstream?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async loadStream(payload: { encodedTrack: string; volume?: number; position?: number; filters?: IFilters | Record<string, any> }): Promise<{ stream: NodeJS.ReadableStream; headers: Record<string, any> }> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("loadstream");
        }

        const res = await makeStreamRequest(`${this.url}/v4/loadstream`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: payload
        });

        return { stream: res.stream, headers: res.headers };
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async subscribeLyrics(guildId: string, skipTrackSource?: boolean): Promise<void> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("lyrics:subscribe");
        }

        const params = new URLSearchParams();
        if (skipTrackSource) params.append("skipTrackSource", "true");
        await makeRequest(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe${params.toString() ? `?${params}` : ""}`, {
            method: "POST",
            headers: this.authHeaders
        });
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async unsubscribeLyrics(guildId: string): Promise<void> {
        if (!this.node.isNodeLink) {
            throw nodeLinkOnlyError("lyrics:unsubscribe");
        }

        await makeRequest(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe`, {
            method: "DELETE",
            headers: this.authHeaders
        });
    }
}
