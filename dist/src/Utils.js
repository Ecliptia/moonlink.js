"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = exports.sources = exports.makeRequest = exports.validateProperty = void 0;
function validateProperty(prop, validator, errorMessage) {
    if (!validator(prop)) {
        throw new Error(errorMessage);
    }
}
exports.validateProperty = validateProperty;
function makeRequest(url, options) {
    return fetch(url, options)
        .then((res) => res.json())
        .then((json) => json);
}
exports.makeRequest = makeRequest;
exports.sources = {
    youtube: "ytsearch",
    youtubemusic: "ytmsearch",
    soundcloud: "scsearch",
    local: "local",
};
class Plugin {
    name;
    load(manager) { }
    unload(manager) { }
}
exports.Plugin = Plugin;
//# sourceMappingURL=Utils.js.map