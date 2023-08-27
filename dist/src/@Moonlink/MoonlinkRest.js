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
        this.ensureUrlIsSet();
    }
    async update(data) {
        this.ensureUrlIsSet();
        return await this.makePatchRequest(`sessions/${this.sessionId}/players/${data.guildId}`, data.data);
    }
    async destroy(guildId) {
        return await this.makeDeleteRequest(`sessions/${this.sessionId}/players/${guildId}`);
    }
    async get(endpoint) {
        this.ensureUrlIsSet();
        return await this.makeGetRequest(endpoint);
    }
    async post(endpoint, data) {
        this.ensureUrlIsSet();
        return await this.makePostRequest(endpoint, data);
    }
    async patch(endpoint, data) {
        this.ensureUrlIsSet();
        return await this.makePatchRequest(endpoint, data.data);
    }
    async delete(endpoint) {
        this.ensureUrlIsSet();
        return await this.makeDeleteRequest(endpoint);
    }
    ensureUrlIsSet() {
        if (!this.url)
            this.url = this.node.restUri;
    }
    async makeGetRequest(endpoint) {
        const headers = {
            Authorization: this.node.password,
        };
        return await (0, MakeRequest_1.makeRequest)(this.url + endpoint, {
            method: "GET",
            headers,
        }).catch((err) => {
            return err;
        });
    }
    async makePostRequest(endpoint, data) {
        const headers = {
            Authorization: this.node.password,
        };
        return await (0, MakeRequest_1.makeRequest)(this.url + endpoint, {
            method: "POST",
            headers,
        }, data).catch((err) => {
            return err;
        });
    }
    async makePatchRequest(endpoint, data) {
        const headers = {
            Authorization: this.node.password,
        };
        return await (0, MakeRequest_1.makeRequest)(this.url + endpoint, {
            method: "PATCH",
            headers,
        }, data).catch((err) => {
            return err;
        });
    }
    async makeDeleteRequest(endpoint) {
        const headers = {
            Authorization: this.node.password,
        };
        return await (0, MakeRequest_1.makeRequest)(this.url + endpoint, {
            method: "DELETE",
            headers,
        }).catch((err) => {
            return err;
        });
    }
}
exports.MoonlinkRest = MoonlinkRest;
//# sourceMappingURL=MoonlinkRest.js.map