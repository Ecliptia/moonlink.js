"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rest = void 0;
const index_1 = require("../../index");
class Rest {
    node;
    constructor(node) {
        this.node = node;
    }
    async loadTracks(source, query) {
        let request = await this.makeRequest(`loadtracks?identifier=${source}:${encodeURIComponent(query)}`, "GET");
        return request;
    }
    async update(data) {
        let request = await this.makeRequest(`sessions/${this.node.sessionId}/players/${data.guildId}`, "patch", data.data);
        return request;
    }
    async makeRequest(endpoint, method, data) {
        let request = await (0, index_1.makeRequest)(`http${this.node.secure ? "s" : ""}://${this.node.address}/${endpoint}?noReplace=${this.node.manager.options?.noReplace ? true : false}`, {
            method,
            body: data ? data : null,
            headers: {
                "Authorization": this.node.password,
                "User-Agent": this.node.manager.options.clientName,
                "content-type": "application/json"
            }
        });
        return request;
    }
}
exports.Rest = Rest;
//# sourceMappingURL=Rest.js.map