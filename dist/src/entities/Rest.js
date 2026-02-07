"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rest = void 0;
const Util_1 = require("../Util");
class Rest {
    node;
    authHeaders;
    jsonHeaders;
    userAgentHeaders;
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
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}?${params.toString()}`, {
            method: "PATCH",
            headers: this.jsonHeaders,
            body: data
        });
        return res || null;
    }
    async destroyPlayer(guildId) {
        await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}`, {
            method: "DELETE",
            headers: this.authHeaders
        });
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
    async getVersion() {
        const res = await (0, Util_1.makeRequest)(`${this.url}/version`, {
            method: "GET",
            headers: this.userAgentHeaders
        });
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
}
exports.Rest = Rest;
//# sourceMappingURL=Rest.js.map