"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = exports.Structure = exports.structures = exports.sources = void 0;
exports.validateProperty = validateProperty;
exports.makeRequest = makeRequest;
const index_1 = require("../index");
function validateProperty(prop, validator, errorMessage) {
    if (!validator(prop)) {
        throw new Error(errorMessage);
    }
}
function makeRequest(url, options) {
    let request = fetch(url, options)
        .then((res) => res.json().catch(() => res.text()))
        .then((json) => json);
    if (!request)
        return;
    return request;
}
exports.sources = {
    youtube: "ytsearch",
    youtubemusic: "ytmsearch",
    soundcloud: "scsearch",
    local: "local",
};
exports.structures = {
    NodeManager: index_1.NodeManager,
    PlayerManager: index_1.PlayerManager,
    Player: index_1.Player,
    Queue: index_1.Queue,
    Node: index_1.Node,
    Rest: index_1.Rest,
    Filters: index_1.Filters,
    Track: index_1.Track,
    Lyrics: index_1.Lyrics,
    Listen: index_1.Listen,
};
class Structure {
    static manager;
    static setManager(manager) {
        this.manager = manager;
    }
    static getManager() {
        return this.manager;
    }
    static get(name) {
        const structure = exports.structures[name];
        if (!structure) {
            throw new TypeError(`"${name}" structure must be provided.`);
        }
        return structure;
    }
    static extend(name, extender) {
        exports.structures[name] = extender;
    }
}
exports.Structure = Structure;
class Plugin {
    name;
    load(manager) { }
    unload(manager) { }
}
exports.Plugin = Plugin;
//# sourceMappingURL=Utils.js.map