"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rest = exports.RestError = void 0;
const HttpError_1 = require("../errors/HttpError");
const FeatureUnavailableError_1 = require("../errors/FeatureUnavailableError");
const Util_1 = require("../Util");
const PlaybackGuard_1 = require("../players/PlaybackGuard");
class RestError extends Error {
    statusCode;
    isSessionExpired;
    constructor(message, statusCode) {
        super(message);
        this.name = 'RestError';
        this.statusCode = statusCode;
        this.isSessionExpired = statusCode === 404;
    }
}
exports.RestError = RestError;
class Rest {
    node;
    authHeaders;
    jsonHeaders;
    userAgentHeaders;
    sessionRecoveryInProgress = false;
    constructor(node) {
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
    get url() {
        return `http${this.node.secure ? "s" : ""}://${this.node.host}:${this.node.port}`;
    }
    async triggerPlayerRecovery(player) {
        if (player.destroyed)
            return;
        player.stuckDetectionCount = 0;
        player.silentDetectionCount = 0;
        try {
            const recovering = player.softRestart("Session expired (404)");
            const ticket = (0, PlaybackGuard_1.playbackGuard)(player).ticket;
            const recovered = await recovering;
            if (player.destroyed || !(0, PlaybackGuard_1.playbackGuard)(player).isCurrent(ticket))
                return;
            if (recovered) {
                this.node.manager.emit("playerRecoverySuccess", player);
            }
            else {
                await player.destroy("Session expired and recovery failed");
            }
        }
        catch (e) {
            this.node.manager.emit("debug", `Moonlink.js > Rest >> Recovery error: ${e.message}`);
            await player.destroy("Session recovery error");
        }
    }
    async featureRequest(feature, url, options) {
        this.node.assertFeature(feature);
        try {
            const result = await (0, Util_1.makeRequest)(url, { ...options, throwOnError: true }, 10000, 0);
            this.node.backend?.recordFeature(feature, 'available');
            return result;
        }
        catch (error) {
            this.featureError(feature, error);
        }
    }
    featureError(feature, error) {
        const body = error instanceof HttpError_1.HttpError ? error.body : undefined;
        const message = body && typeof body === 'object' && 'message' in body ? String(body.message) : '';
        const unavailable = error instanceof HttpError_1.HttpError && (error.statusCode === 501 ||
            [403, 404].includes(error.statusCode) && /requested route was not found|unknown (?:route|endpoint)|(?:endpoint|feature).*disabled/i.test(message));
        if (unavailable) {
            this.node.backend?.recordFeature(feature, 'unavailable');
            throw new FeatureUnavailableError_1.FeatureUnavailableError(feature, this.node.backend?.kind ?? 'unknown', error.statusCode);
        }
        throw error;
    }
    async getPlayers() {
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async getPlayer(guildId) {
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async updatePlayer(guildId, data, noReplace = false) {
        const params = new URLSearchParams();
        if (noReplace) {
            params.append("noReplace", "true");
        }
        try {
            const res = await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}?${params.toString()}`, {
                method: "PATCH",
                headers: this.jsonHeaders,
                body: data,
                throwOnError: true
            }, undefined, 0);
            return res || null;
        }
        catch (error) {
            const err = error;
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
    async destroyPlayer(guildId) {
        try {
            await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}`, {
                method: "DELETE",
                headers: this.authHeaders
            });
        }
        catch (error) {
            const err = error;
            if (!err.message.includes('status 404')) {
                throw error;
            }
        }
    }
    async loadTracks(identifier, options) {
        const params = new URLSearchParams();
        params.append("identifier", identifier);
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/loadtracks?${params}`, {
            method: "GET",
            headers: this.authHeaders,
            throwOnError: options !== undefined,
            signal: options?.signal
        }, options?.timeoutMs ?? 0, options ? 0 : 3);
        return res || { loadType: "empty", data: {} };
    }
    async decodeTrack(encodedTrack) {
        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/decodetrack?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async decodeTracks(encodedTracks) {
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/decodetracks`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: encodedTracks
        });
        return res || null;
    }
    async getInfo() {
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/info`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async getInfoWithHeaders() {
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/info`, {
            method: "GET",
            headers: this.authHeaders,
            returnHeaders: true,
            throwOnError: true
        }, 10000, 0);
        return res || null;
    }
    async getVersion(timeout, retries) {
        const res = await (0, Util_1.makeRequest)(`${this.url}/version`, {
            method: "GET",
            headers: this.authHeaders
        }, timeout, retries);
        return res || null;
    }
    async getStats() {
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/stats`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async getRoutePlannerStatus() {
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/routeplanner/status`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async freeFailedAddress(address) {
        await (0, Util_1.makeRequest)(`${this.url}/v4/routeplanner/free/address`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: { address }
        });
    }
    async freeAllFailedAddresses() {
        await (0, Util_1.makeRequest)(`${this.url}/v4/routeplanner/free/all`, {
            method: "POST",
            headers: this.authHeaders
        });
    }
    async updateSession(resuming, timeout) {
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: {
                resuming,
                timeout
            }
        });
        return res || null;
    }
    async addMixLayer(guildId, data) {
        this.node.assertFeature("mix:add");
        const res = await this.featureRequest("mix:add", `${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: data
        });
        return res || null;
    }
    async getMixLayers(guildId) {
        this.node.assertFeature("mix:list");
        const res = await this.featureRequest("mix:list", `${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async updateMixLayerVolume(guildId, mixId, volume) {
        this.node.assertFeature("mix:update");
        await this.featureRequest("mix:update", `${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix/${mixId}`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: { volume }
        });
    }
    async removeMixLayer(guildId, mixId) {
        this.node.assertFeature("mix:remove");
        await this.featureRequest("mix:remove", `${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix/${mixId}`, {
            method: "DELETE",
            headers: this.authHeaders
        });
    }
    async loadLyrics(encodedTrack, lang) {
        this.node.assertFeature("lyrics");
        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        if (lang)
            params.append("lang", lang);
        const res = await this.featureRequest("lyrics", `${this.url}/v4/loadlyrics?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res ? (0, Util_1.normalizeNodeLinkResponse)(res, res.loadType) : null;
    }
    async loadChapters(encodedTrack) {
        this.node.assertFeature("chapters");
        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        const res = await this.featureRequest("chapters", `${this.url}/v4/loadchapters?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res ? (0, Util_1.normalizeNodeLinkResponse)(res, "chapters") : null;
    }
    async loadMeaning(encodedTrack, lang) {
        this.node.assertFeature("meaning");
        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        if (lang)
            params.append("lang", lang);
        const res = await this.featureRequest("meaning", `${this.url}/v4/meaning?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res ? (0, Util_1.normalizeNodeLinkResponse)(res, res.loadType) : null;
    }
    async getConnectionStatus() {
        this.node.assertFeature("connection");
        const res = await this.featureRequest("connection", `${this.url}/v4/connection`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res ? (0, Util_1.normalizeNodeLinkResponse)(res, "connection") : null;
    }
    async getMetrics() {
        this.node.assertFeature("metrics");
        const res = await this.featureRequest("metrics", `${this.url}/v4/metrics`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async getWorkers() {
        this.node.assertFeature("workers:get");
        const res = await this.featureRequest("workers:get", `${this.url}/v4/workers`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res ? (0, Util_1.normalizeNodeLinkResponse)(res, "workers") : null;
    }
    async patchWorker(payload) {
        this.node.assertFeature("workers:patch");
        const res = await this.featureRequest("workers:patch", `${this.url}/v4/workers`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: payload
        });
        return res || null;
    }
    async getYoutubeConfig(validate = false) {
        this.node.assertFeature("youtube:config");
        const params = new URLSearchParams();
        if (validate)
            params.append("validate", "true");
        const res = await this.featureRequest("youtube:config", `${this.url}/v4/youtube/config${params.toString() ? `?${params}` : ""}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async updateYoutubeConfig(payload) {
        this.node.assertFeature("youtube:config");
        const res = await this.featureRequest("youtube:config", `${this.url}/v4/youtube/config`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: payload
        });
        return res || null;
    }
    async exchangeYoutubeOAuth(refreshToken) {
        this.node.assertFeature("youtube:oauth");
        const params = new URLSearchParams();
        params.append("refreshToken", refreshToken);
        const res = await this.featureRequest("youtube:oauth", `${this.url}/v4/youtube/oauth?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async encodeTrackRemote(track) {
        this.node.assertFeature("encodetrack");
        const params = new URLSearchParams();
        params.append("track", track);
        const res = await this.featureRequest("encodetrack", `${this.url}/v4/encodetrack?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async encodeTracksRemote(tracks) {
        this.node.assertFeature("encodedtracks");
        const res = await this.featureRequest("encodedtracks", `${this.url}/v4/encodedtracks`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: tracks
        });
        return res || null;
    }
    async trackStream(encodedTrack, itag) {
        this.node.assertFeature("trackstream");
        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        if (itag !== undefined && itag !== null) {
            params.append("itag", String(itag));
        }
        const res = await this.featureRequest("trackstream", `${this.url}/v4/trackstream?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async loadStream(payload, options = {}) {
        this.node.assertFeature('loadstream');
        try {
            const res = await (0, Util_1.makeStreamRequest)(`${this.url}/v4/loadstream`, {
                method: 'POST', headers: this.jsonHeaders, body: payload, signal: options.signal,
            }, options.timeoutMs ?? 100000);
            this.node.backend?.recordFeature('loadstream', 'available');
            return { stream: res.stream, headers: res.headers };
        }
        catch (error) {
            this.featureError('loadstream', error);
        }
    }
    async subscribeLyrics(guildId, skipTrackSource) {
        this.node.assertFeature("lyrics:subscribe");
        const params = new URLSearchParams();
        if (skipTrackSource)
            params.append("skipTrackSource", "true");
        await this.featureRequest("lyrics:subscribe", `${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe${params.toString() ? `?${params}` : ""}`, {
            method: "POST",
            headers: this.authHeaders
        });
    }
    async unsubscribeLyrics(guildId) {
        this.node.assertFeature("lyrics:unsubscribe");
        await this.featureRequest("lyrics:unsubscribe", `${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe`, {
            method: "DELETE",
            headers: this.authHeaders
        });
    }
}
exports.Rest = Rest;
//# sourceMappingURL=Rest.js.map