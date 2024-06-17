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
            "User-Agent": "Moonlink.js/4 (Ghost)",
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
}
exports.Rest = Rest;
//# sourceMappingURL=Rest.js.map