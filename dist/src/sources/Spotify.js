"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Spotify {
    name;
    constructor() {
        this.name = "Spotify";
    }
    search(query, options) {
    }
    load(url, options) {
    }
    resolve(url, options) {
    }
    isLinkMatch(url) {
        return url.startsWith("spotify:") || url.startsWith("https://open.spotify.com/");
    }
}
exports.default = Spotify;
//# sourceMappingURL=Spotify.js.map