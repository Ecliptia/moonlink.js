"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkRest = void 0;
const MakeRequest_1 = require("../@Rest/MakeRequest");
class MoonlinkRest {
    manager;
    sessionId;
    node;
    url;
    constructor(manager, node) {
        this.manager = manager;
        this.node = node;
    }
    setSessionId(sessionId) {
        this.sessionId = sessionId;
        this.url = this.node.restUri;
    }
    async update(data) {
        if (!this.url)
            this.url = this.node.restUri;
        return await this.patch(`sessions/${this.sessionId}/players/${data.guildId}`, data);
    }
    async destroy(guildId) {
        return await this.delete(`sessions/${this.sessionId}/players/${guildId}`);
    }
    async get(endpoint) {
        if (!this.url)
            this.url = this.node.restUri;
        let req = await (0, MakeRequest_1.makeRequest)(this.url + endpoint, {
            method: "GET",
            headers: {
                Authorization: this.node.password,
            },
        }).catch((err) => {
            return err;
        });
        return req;
    }
    async post(endpoint, data) {
        if (!this.url)
            this.url = this.node.restUri;
        let req = await (0, MakeRequest_1.makeRequest)(this.url + endpoint, {
            method: "POST",
            headers: {
                Authorization: this.node.password,
            },
        }, data).catch((err) => {
            return err;
        });
        return req;
    }
    async patch(endpoint, data) {
        if (!this.url)
            this.url = this.node.restUri;
        let req = await (0, MakeRequest_1.makeRequest)(this.url + endpoint, {
            method: "PATCH",
            headers: {
                Authorization: this.node.password,
            },
        }, data.data).catch((err) => {
            return err;
        });
        return req;
    }
    async delete(endpoint) {
        if (!this.url)
            this.url = this.node.restUri;
        let req = await (0, MakeRequest_1.makeRequest)(this.url + endpoint, {
            method: "DELETE",
            headers: {
                Authorization: this.node.password,
            },
        }).catch((err) => {
            return err;
        });
        return req;
    }
}
exports.MoonlinkRest = MoonlinkRest;
//# sourceMappingURL=MoonlinkRest.js.map