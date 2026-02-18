"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rest = exports.RestError = void 0;
const Util_1 = require("../Util");
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
            const recovered = await player.softRestart("Session expired (404)");
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
                body: data
            });
            return res || null;
        }
        catch (error) {
            const err = error;
            if (err.message.includes('status 404')) {
                this.node.manager.emit("debug", `Moonlink.js > Rest >> updatePlayer 404 for guild ${guildId}, triggering recovery.`);
                const player = this.node.manager.players.get(guildId);
                if (player && !player.destroyed) {
                    await this.triggerPlayerRecovery(player);
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
    async loadTracks(identifier) {
        const params = new URLSearchParams();
        params.append("identifier", identifier);
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/loadtracks?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
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
            returnHeaders: true
        });
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
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("mix:add");
        }
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: data
        });
        return res || null;
    }
    async getMixLayers(guildId) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("mix:list");
        }
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async updateMixLayerVolume(guildId, mixId, volume) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("mix:update");
        }
        await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix/${mixId}`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: { volume }
        });
    }
    async removeMixLayer(guildId, mixId) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("mix:remove");
        }
        await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/mix/${mixId}`, {
            method: "DELETE",
            headers: this.authHeaders
        });
    }
    async loadLyrics(encodedTrack, lang) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("lyrics");
        }
        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        if (lang)
            params.append("lang", lang);
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/loadlyrics?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res ? (0, Util_1.normalizeNodeLinkResponse)(res, res.loadType) : null;
    }
    async loadChapters(encodedTrack) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("chapters");
        }
        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/loadchapters?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res ? (0, Util_1.normalizeNodeLinkResponse)(res, "chapters") : null;
    }
    async loadMeaning(encodedTrack, lang) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("meaning");
        }
        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        if (lang)
            params.append("lang", lang);
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/meaning?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res ? (0, Util_1.normalizeNodeLinkResponse)(res, res.loadType) : null;
    }
    async getConnectionStatus() {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("connection");
        }
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/connection`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res ? (0, Util_1.normalizeNodeLinkResponse)(res, "connection") : null;
    }
    async getMetrics() {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("metrics");
        }
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/metrics`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async getWorkers() {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("workers:get");
        }
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/workers`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res ? (0, Util_1.normalizeNodeLinkResponse)(res, "workers") : null;
    }
    async patchWorker(payload) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("workers:patch");
        }
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/workers`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: payload
        });
        return res || null;
    }
    async getYoutubeConfig(validate = false) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("youtube:config");
        }
        const params = new URLSearchParams();
        if (validate)
            params.append("validate", "true");
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/youtube/config${params.toString() ? `?${params}` : ""}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async updateYoutubeConfig(payload) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("youtube:config");
        }
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/youtube/config`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: payload
        });
        return res || null;
    }
    async exchangeYoutubeOAuth(refreshToken) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("youtube:oauth");
        }
        const params = new URLSearchParams();
        params.append("refreshToken", refreshToken);
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/youtube/oauth?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async encodeTrackRemote(track) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("encodetrack");
        }
        const params = new URLSearchParams();
        params.append("track", track);
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/encodetrack?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async encodeTracksRemote(tracks) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("encodedtracks");
        }
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/encodedtracks`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: tracks
        });
        return res || null;
    }
    async trackStream(encodedTrack, itag) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("trackstream");
        }
        const params = new URLSearchParams();
        params.append("encodedTrack", encodedTrack);
        if (itag !== undefined && itag !== null) {
            params.append("itag", String(itag));
        }
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/trackstream?${params}`, {
            method: "GET",
            headers: this.authHeaders
        });
        return res || null;
    }
    async loadStream(payload) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("loadstream");
        }
        const res = await (0, Util_1.makeStreamRequest)(`${this.url}/v4/loadstream`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: payload
        });
        return { stream: res.stream, headers: res.headers };
    }
    async subscribeLyrics(guildId, skipTrackSource) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("lyrics:subscribe");
        }
        const params = new URLSearchParams();
        if (skipTrackSource)
            params.append("skipTrackSource", "true");
        await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe${params.toString() ? `?${params}` : ""}`, {
            method: "POST",
            headers: this.authHeaders
        });
    }
    async unsubscribeLyrics(guildId) {
        if (!this.node.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("lyrics:unsubscribe");
        }
        await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe`, {
            method: "DELETE",
            headers: this.authHeaders
        });
    }
}
exports.Rest = Rest;
//# sourceMappingURL=Rest.js.map