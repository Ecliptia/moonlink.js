"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LavaSearchPlugin = void 0;
const AbstractPlugin_1 = require("./AbstractPlugin");
const Utils_1 = require("../Utils");
class LavaSearchPlugin extends AbstractPlugin_1.AbstractPlugin {
    name = "lavasearch-plugin";
    capabilities = ["lavasearch"];
    node;
    load(node) {
        this.node = node;
    }
    unload(node) {
    }
    async search(query, options) {
        const params = new URLSearchParams({
            query: `${Utils_1.sources[options.source] ?? options.source}:${query}`,
            types: options.types ?? "track,album,artist,playlist,text",
        });
        const request = await this.node.rest.get(`loadsearch?${params}`);
        return request;
    }
}
exports.LavaSearchPlugin = LavaSearchPlugin;
//# sourceMappingURL=LavaSearchPlugin.js.map