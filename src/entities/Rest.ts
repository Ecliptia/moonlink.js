import type http from "node:http";
import { HttpError } from "../errors/HttpError";
import { FeatureUnavailableError } from "../errors/FeatureUnavailableError";
import { makeRequest, makeStreamRequest, normalizeNodeLinkResponse, type NodeLinkResponse, type ResponseWithHeaders, nodeLinkOnlyError } from "../Util";
import type { IChapter, IFilters, ILyricsData, ILyricsResponse, IMeaningResponse, INodeConnectionStatus } from "../typings/Interfaces";
import { Node } from "./Node";
import { IRESTLoadTracks, IRESTGetLyrics, IRESTGetPlayers, ITrack, INodeStats, IRoutePlannerStatus } from "../typings/Interfaces";
import { playbackGuard } from '../players/PlaybackGuard';

export class RestError extends Error {
    public statusCode: number;
    public isSessionExpired: boolean;
    
    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'RestError';
        this.statusCode = statusCode;
        this.isSessionExpired = statusCode === 404;
    }
}

export class Rest {
    private readonly node: Node;
    private readonly authHeaders: Record<string, string>;
    private readonly jsonHeaders: Record<string, string>;
    private readonly userAgentHeaders: Record<string, string>;
    private sessionRecoveryInProgress: boolean = false;

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

    private async triggerPlayerRecovery(player: any): Promise<void> {
        if (player.destroyed) return;
        
        player.stuckDetectionCount = 0;
        player.silentDetectionCount = 0;
        
        try {
            const recovering = player.softRestart("Session expired (404)");
            const ticket = playbackGuard(player).ticket;
            const recovered = await recovering;
            if (player.destroyed || !playbackGuard(player).isCurrent(ticket)) return;
            if (recovered) {
                this.node.manager.emit("playerRecoverySuccess", player);
            } else {
                await player.destroy("Session expired and recovery failed");
            }
        } catch (e) {
            this.node.manager.emit("debug", `Moonlink.js > Rest >> Recovery error: ${(e as Error).message}`);
            await player.destroy("Session recovery error");
        }
    }

    private async featureRequest<T = any>(feature: string, url: string, options: http.RequestOptions & { body?: any }): Promise<T> {
        this.node.assertFeature(feature);
        try {
            const result = await makeRequest<T>(url, { ...options, throwOnError: true }, 10000, 0);
            this.node.backend?.recordFeature(feature, 'available');
            return result;
        } catch (error) {
            this.featureError(feature, error);
        }
    }

    private featureError(feature: string, error: unknown): never {
        const body = error instanceof HttpError ? error.body : undefined;
        const message = body && typeof body === 'object' && 'message' in body ? String(body.message) : '';
        const unavailable = error instanceof HttpError && (error.statusCode === 501 ||
            [403, 404].includes(error.statusCode) && /requested route was not found|unknown (?:route|endpoint)|(?:endpoint|feature).*disabled/i.test(message));
        if (unavailable) {
            this.node.backend?.recordFeature(feature, 'unavailable');
            throw new FeatureUnavailableError(feature, this.node.backend?.kind ?? 'unknown', error.statusCode);
        }
        throw error;
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
        
        try {
            const res = await makeRequest<any>(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}?${params.toString()}`, {
                method: "PATCH",
                headers: this.jsonHeaders,
                body: data,
                throwOnError: true
            }, undefined, 0);
            return res || null;
        } catch (error) {
            const err = error as Error;
            if (err.message.includes('status 404')) {
                this.node.manager.emit("debug", `Moonlink.js > Rest >> updatePlayer 404 for guild ${guildId}, triggering recovery.`);
                
                const player = this.node.manager.players.get(guildId);
                if (player && !player.destroyed) {
                    if (!this.sessionRecoveryInProgress) {
                        this.sessionRecoveryInProgress = true;
                        void this.triggerPlayerRecovery(player)
                            .catch(error => this.node.manager.emit("debug", `Moonlink.js > Rest >> Recovery failed: ${error.message}`))
                            .finally(() => { this.sessionRecoveryInProgress = false; });
                    }
                }
            }
            throw error;
        }
    }

    public async destroyPlayer(guildId: string): Promise<void> {
        try {
            await makeRequest(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}`, {
                method: "DELETE",
                headers: this.authHeaders
            });
        } catch (error) {
            const err = error as Error;
            if (!err.message.includes('status 404')) {
                throw error;
            }
        }
    }

    public async loadTracks(identifier: string, options?: { timeoutMs: number; signal?: AbortSignal }): Promise<IRESTLoadTracks> {
        const params = new URLSearchParams();
        params.append("identifier", identifier);

        const res = await makeRequest<any>(`${this.url}/v4/loadtracks?${params}`, {
            method: "GET",
            headers: this.authHeaders,
            throwOnError: options !== undefined,
            signal: options?.signal
        }, options?.timeoutMs ?? 0, options ? 0 : 3);

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
            returnHeaders: true,
            throwOnError: true
        }, 10000, 0);
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
        this.node.assertFeature("mix:add");

        const res = await this.featureRequest<any>("mix:add", `${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: data
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async getMixLayers(guildId: string): Promise<any | null> {
        this.node.assertFeature("mix:list");

        const res = await this.featureRequest<any>("mix:list", `${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async updateMixLayerVolume(guildId: string, mixId: string, volume: number): Promise<void> {
        this.node.assertFeature("mix:update");

        await this.featureRequest("mix:update", `${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix/${mixId}`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: { volume }
        });
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async removeMixLayer(guildId: string, mixId: string): Promise<void> {
        this.node.assertFeature("mix:remove");

        await this.featureRequest("mix:remove", `${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix/${mixId}`, {
            method: "DELETE",
            headers: this.authHeaders
        });
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async loadLyrics(encodedTrack: string, lang?: string): Promise<NodeLinkResponse<ILyricsData | Record<string, any>> | null> {
        this.node.assertFeature("lyrics");

        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        if (lang) params.append("lang", lang);

        const res = await this.featureRequest<ILyricsResponse>("lyrics", `${this.url}/v4/loadlyrics?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res ? normalizeNodeLinkResponse(res, res.loadType) : null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async loadChapters(encodedTrack: string): Promise<NodeLinkResponse<IChapter[]> | null> {
        this.node.assertFeature("chapters");

        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);

        const res = await this.featureRequest<IChapter[]>("chapters", `${this.url}/v4/loadchapters?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res ? normalizeNodeLinkResponse(res, "chapters") : null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async loadMeaning(encodedTrack: string, lang?: string): Promise<NodeLinkResponse<IMeaningResponse | Record<string, any>> | null> {
        this.node.assertFeature("meaning");

        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        if (lang) params.append("lang", lang);

        const res = await this.featureRequest<IMeaningResponse>("meaning", `${this.url}/v4/meaning?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res ? normalizeNodeLinkResponse(res, res.loadType) : null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async getConnectionStatus(): Promise<NodeLinkResponse<INodeConnectionStatus> | null> {
        this.node.assertFeature("connection");

        const res = await this.featureRequest<INodeConnectionStatus>("connection", `${this.url}/v4/connection`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res ? normalizeNodeLinkResponse(res, "connection") : null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async getMetrics(): Promise<string | null> {
        this.node.assertFeature("metrics");

        const res = await this.featureRequest<string>("metrics", `${this.url}/v4/metrics`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async getWorkers(): Promise<NodeLinkResponse<any[]> | null> {
        this.node.assertFeature("workers:get");

        const res = await this.featureRequest<any[]>("workers:get", `${this.url}/v4/workers`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res ? normalizeNodeLinkResponse(res, "workers") : null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async patchWorker(payload: Record<string, any>): Promise<any | null> {
        this.node.assertFeature("workers:patch");

        const res = await this.featureRequest<any>("workers:patch", `${this.url}/v4/workers`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: payload
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async getYoutubeConfig(validate: boolean = false): Promise<any | null> {
        this.node.assertFeature("youtube:config");

        const params = new URLSearchParams();
        if (validate) params.append("validate", "true");
        const res = await this.featureRequest<any>("youtube:config", `${this.url}/v4/youtube/config${params.toString() ? `?${params}` : ""}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async updateYoutubeConfig(payload: { refreshToken?: string; visitorData?: string }): Promise<any | null> {
        this.node.assertFeature("youtube:config");

        const res = await this.featureRequest<any>("youtube:config", `${this.url}/v4/youtube/config`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: payload
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async exchangeYoutubeOAuth(refreshToken: string): Promise<any | null> {
        this.node.assertFeature("youtube:oauth");

        const params = new URLSearchParams();
        params.append("refreshToken", refreshToken);
        const res = await this.featureRequest<any>("youtube:oauth", `${this.url}/v4/youtube/oauth?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async encodeTrackRemote(track: string): Promise<string | null> {
        this.node.assertFeature("encodetrack");

        const params = new URLSearchParams();
        params.append("track", track);
        const res = await this.featureRequest<string>("encodetrack", `${this.url}/v4/encodetrack?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async encodeTracksRemote(tracks: Array<{ encoded: string; info: Record<string, any> }>): Promise<string[] | null> {
        this.node.assertFeature("encodedtracks");

        const res = await this.featureRequest<string[]>("encodedtracks", `${this.url}/v4/encodedtracks`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: tracks
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async trackStream(encodedTrack: string, itag?: number | null): Promise<any | null> {
        this.node.assertFeature("trackstream");

        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        if (itag !== undefined && itag !== null) {
            params.append("itag", String(itag));
        }

        const res = await this.featureRequest<any>("trackstream", `${this.url}/v4/trackstream?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });

        return res || null;
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async loadStream(payload: { encodedTrack: string; volume?: number; position?: number; format?: 'pcm' | 'wav'; filters?: IFilters | Record<string, any> }, options: { signal?: AbortSignal; timeoutMs?: number } = {}): Promise<{ stream: NodeJS.ReadableStream; headers: Record<string, any> }> {
        this.node.assertFeature('loadstream');
        try {
            const res = await makeStreamRequest(`${this.url}/v4/loadstream`, {
                method: 'POST', headers: this.jsonHeaders, body: payload, signal: options.signal,
            }, options.timeoutMs ?? 100000);
            this.node.backend?.recordFeature('loadstream', 'available');
            return { stream: res.stream, headers: res.headers };
        } catch (error) { this.featureError('loadstream', error); }
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async subscribeLyrics(guildId: string, skipTrackSource?: boolean): Promise<void> {
        this.node.assertFeature("lyrics:subscribe");

        const params = new URLSearchParams();
        if (skipTrackSource) params.append("skipTrackSource", "true");
        await this.featureRequest("lyrics:subscribe", `${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe${params.toString() ? `?${params}` : ""}`, {
            method: "POST",
            headers: this.authHeaders
        });
    }

    /** NodeLink-only feature. See https://github.com/PerformanC/NodeLink */
    public async unsubscribeLyrics(guildId: string): Promise<void> {
        this.node.assertFeature("lyrics:unsubscribe");

        await this.featureRequest("lyrics:unsubscribe", `${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe`, {
            method: "DELETE",
            headers: this.authHeaders
        });
    }
}
