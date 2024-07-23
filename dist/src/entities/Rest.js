"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rest = void 0;
const index_1 = require("../../index");
class Rest {
    node;
    url;
    defaultHeaders;
    constructor(node) {
        this.node = node;
        this.url = `http${this.node.secure ? "s" : ""}://${this.node.address}/v4`;
        this.defaultHeaders = {
            Authorization: this.node.password,
            Accept: "application/json",
            "User-Agent": `Moonlink.js/${node.manager.version} (FALLING STAR)`,
            "Content-Type": "application/json",
        };
    }
    async loadTracks(source, query) {
        return new Promise(async (resolve) => {
            let identifier;
            if (query.startsWith("http://") || query.startsWith("https://"))
                identifier = query;
            else
                identifier = `${index_1.sources[source]}:${query}`;
            let params = new URLSearchParams({
                identifier,
            });
            let request = await (0, index_1.makeRequest)(`${this.url}/loadtracks?${params}`, {
                method: "GET",
                headers: this.defaultHeaders,
            });
            return resolve(request);
        });
    }
    async update(data) {
        let request = await (0, index_1.makeRequest)(`${this.url}/sessions/${this.node.sessionId}/players/${data.guildId}`, {
            method: "PATCH",
            body: JSON.stringify(data.data),
            headers: this.defaultHeaders,
        });
        return request;
    }
    async destroy(guildId) {
        let request = await (0, index_1.makeRequest)(`${this.url}/sessions/${this.node.sessionId}/players/${guildId}`, {
            method: "DELETE",
            headers: this.defaultHeaders,
        });
        return request;
    }
    getInfo() {
        return (0, index_1.makeRequest)(`${this.url}/info`, {
            method: "GET",
            headers: this.defaultHeaders,
        });
    }
    getStats() {
        return (0, index_1.makeRequest)(`${this.url}/stats`, {
            method: "GET",
            headers: this.defaultHeaders,
        });
    }
    getVersion() {
        return (0, index_1.makeRequest)(`http${this.node.secure ? "s" : ""}://${this.node.address}/version`, {
            method: "GET",
            headers: this.defaultHeaders,
        });
    }
    getLyrics(data) {
        return (0, index_1.makeRequest)(`${this.url}/loadlyrics?encodedTrack=${encodeURIComponent(data.encoded)}`, {
            method: "GET",
            headers: this.defaultHeaders,
        });
    }
    async updateSession(sessionId, data) {
        return (0, index_1.makeRequest)(`${this.url}/sessions/${sessionId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
            headers: this.defaultHeaders,
        });
    }
    async decodeTrack(encodedTrack) {
        return (0, index_1.makeRequest)(`${this.url}/decodetrack?encodedTrack=${encodeURIComponent(encodedTrack)}`, {
            method: "GET",
            headers: this.defaultHeaders,
        });
    }
    async decodeTracks(encodedTracks) {
        return (0, index_1.makeRequest)(`${this.url}/decodetracks`, {
            method: "POST",
            body: JSON.stringify(encodedTracks),
            headers: this.defaultHeaders,
        });
    }
    async getPlayers(sessionId) {
        return (0, index_1.makeRequest)(`${this.url}/sessions/${sessionId}/players`, {
            method: "GET",
            headers: this.defaultHeaders,
        });
    }
    async getPlayer(sessionId, guildId) {
        return (0, index_1.makeRequest)(`${this.url}/sessions/${sessionId}/players/${guildId}`, {
            method: "GET",
            headers: this.defaultHeaders,
        });
    }
    async getRoutePlannerStatus() {
        return (0, index_1.makeRequest)(`${this.url}/routeplanner/status`, {
            method: "GET",
            headers: this.defaultHeaders,
        });
    }
    async unmarkFailedAddress(address) {
        return (0, index_1.makeRequest)(`${this.url}/routeplanner/free/address`, {
            method: "POST",
            body: JSON.stringify({ address }),
            headers: this.defaultHeaders,
        });
    }
    async unmarkAllFailedAddresses() {
        return (0, index_1.makeRequest)(`${this.url}/routeplanner/free/all`, {
            method: "POST",
            headers: this.defaultHeaders,
        });
    }
}
exports.Rest = Rest;
//# sourceMappingURL=Rest.js.map