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
        return await this.patch(`sessions/${this.sessionId}/players/${data.guildId}`, data);
    }
    async destroy(guildId) {
        return await this.delete(`sessions/${this.sessionId}/players/${guildId}`);
    }
    async get(endpoint) {
        let req = await (0, MakeRequest_1.makeRequest)(this.url + endpoint, {
            method: 'GET',
            headers: {
                Authorization: this.node.password
            }
        }).catch(err => {
            return err;
        });
        return req;
    }
    async post(endpoint, data) {
        let req = await (0, MakeRequest_1.makeRequest)(this.url + endpoint, {
            method: 'POST',
            headers: {
                Authorization: this.node.password
            }
        }, data).catch(err => {
            return err;
        });
        return req;
    }
    async patch(endpoint, data) {
        let req = await (0, MakeRequest_1.makeRequest)(this.url + endpoint, {
            method: 'PATCH',
            headers: {
                Authorization: this.node.password
            }
        }, data.data).catch(err => {
            return err;
        });
        return req;
    }
    async delete(endpoint) {
        let req = await (0, MakeRequest_1.makeRequest)(this.url + endpoint, {
            method: 'DELETE',
            headers: {
                Authorization: this.node.password
            }
        }).catch(err => {
            return err;
        });
        return req;
    }
}
exports.MoonlinkRest = MoonlinkRest;
//# sourceMappingURL=MoonlinkRest.js.map