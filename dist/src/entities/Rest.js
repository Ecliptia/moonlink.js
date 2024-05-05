"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rest = void 0;
const index_1 = require("../../index");
class Rest {
    node;
    constructor(node) {
        this.node = node;
    }
    async update(data) {
        let request = await this.makeRequest(`sessions/${this.node.sessionId}/players/${data.guildId}`, "PATCH", data.data);
        return request;
    }
    async makeRequest(endpoint, method, data) {
        let request = await (0, index_1.makeRequest)(`http${this.node.secure ? "s" : ""}${this.node.address}/${endpoint}?noReplace=${index_1.Structure.getManager().options?.noReplace ? true : false}`, {
            method,
            body: data ? JSON.stringify(data) : null,
            headers: {
                "Authorization": this.node.password,
                "User-Agent": index_1.Structure.getManager().options.clientName
            }
        });
        return request;
    }
}
exports.Rest = Rest;
//# sourceMappingURL=Rest.js.map