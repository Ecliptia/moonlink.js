"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rest = void 0;
const Util_1 = require("../Util");
class Rest {
    node;
    constructor(node) {
        this.node = node;
    }
    get url() {
        return `http${this.node.secure ? "s" : ""}://${this.node.host}:${this.node.port}`;
    }
    async getPlayers() {
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players`, {
            method: "GET",
            headers: {
                "Authorization": this.node.password
            }
        });
        return res || null;
    }
    async getPlayer(guildId) {
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}`, {
            method: "GET",
            headers: {
                "Authorization": this.node.password
            }
        });
        return res || null;
    }
    async updatePlayer(guildId, data) {
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}`, {
            method: "PATCH",
            headers: {
                "Authorization": this.node.password,
                "Content-Type": "application/json"
            },
            body: data
        });
        return res || null;
    }
    async destroyPlayer(guildId) {
        await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}`, {
            method: "DELETE",
            headers: {
                "Authorization": this.node.password
            }
        });
    }
    async loadTracks(identifier) {
        const params = new URLSearchParams();
        params.append("identifier", identifier);
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/loadtracks?${params}`, {
            method: "GET",
            headers: {
                "Authorization": this.node.password
            }
        });
        return res || { loadType: "empty", data: {} };
    }
    async getLyrics(trackId) {
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/lyrics/${trackId}`, {
            method: "GET",
            headers: {
                "Authorization": this.node.password
            }
        });
        return res || null;
    }
    async updateSession(resuming, timeout) {
        const res = await (0, Util_1.makeRequest)(`${this.url}/v4/sessions/${this.node.sessionId}`, {
            method: "PATCH",
            headers: {
                "Authorization": this.node.password,
                "Content-Type": "application/json"
            },
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