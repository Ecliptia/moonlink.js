"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkRestFul = void 0;
const index_1 = require("../../index");
class MoonlinkRestFul {
    manager;
    sessionId;
    node;
    url;
    constructor(node) {
        this.manager = index_1.Structure.manager;
        this.node = node;
    }
    setSessionId(sessionId) {
        this.sessionId = sessionId;
        this.ensureUrlIsSet();
    }
    async update(data) {
        this.ensureUrlIsSet();
        return this.makePatchRequest(`sessions/${this.sessionId}/players/${data.guildId}`, data.data);
    }
    async destroy(guildId) {
        return this.makeDeleteRequest(`sessions/${this.sessionId}/players/${guildId}`);
    }
    async get(endpoint) {
        this.ensureUrlIsSet();
        return this.makeGetRequest(endpoint);
    }
    async post(endpoint, data) {
        this.ensureUrlIsSet();
        return this.makePostRequest(endpoint, data);
    }
    async patch(endpoint, data) {
        this.ensureUrlIsSet();
        return this.makePatchRequest(endpoint, data.data);
    }
    async delete(endpoint) {
        this.ensureUrlIsSet();
        return this.makeDeleteRequest(endpoint);
    }
    async decodeTrack(encodedTrack) {
        return this.get(`decodetrack?encodedTrack=${encodedTrack}`);
    }
    async decodeTracks(data) {
        return this.post("decodetracks", data);
    }
    async getInfo() {
        return this.get("info");
    }
    async getStats() {
        return this.get("stats");
    }
    async getVersion() {
        return this.get("version");
    }
    async routePlannerFreeAddress(data) {
        return this.post("routeplanner/free/address", data);
    }
    async routePlannerFreeAll(data) {
        return this.post("routeplanner/free/all", data);
    }
    ensureUrlIsSet() {
        if (!this.url) {
            this.url = this.node.http;
        }
    }
    async makeGetRequest(endpoint) {
        const headers = {
            Authorization: this.node.password
        };
        return (0, index_1.makeRequest)(this.url + endpoint, {
            method: "GET",
            headers
        }).catch(err => err);
    }
    async makePostRequest(endpoint, data) {
        const headers = {
            Authorization: this.node.password
        };
        return (0, index_1.makeRequest)(this.url + endpoint, {
            method: "POST",
            headers
        }, data).catch(err => err);
    }
    async makePatchRequest(endpoint, data) {
        const headers = {
            Authorization: this.node.password
        };
        return (0, index_1.makeRequest)(this.url + endpoint, {
            method: "PATCH",
            headers
        }, data).catch(err => err);
    }
    async makeDeleteRequest(endpoint) {
        const headers = {
            Authorization: this.node.password
        };
        return (0, index_1.makeRequest)(this.url + endpoint, {
            method: "DELETE",
            headers
        }).catch(err => err);
    }
}
exports.MoonlinkRestFul = MoonlinkRestFul;
//# sourceMappingURL=MoonlinkRestFul.js.map