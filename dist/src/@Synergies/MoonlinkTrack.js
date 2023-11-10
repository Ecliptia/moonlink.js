"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkTrack = void 0;
class MoonlinkTrack {
    encoded;
    identifier;
    title;
    author;
    url;
    duration;
    position;
    isSeekable;
    isStream;
    sourceName;
    requester;
    artworkUrl;
    isrc;
    constructor(data) {
        this.encoded = data.encoded;
        this.title = data.info.title;
        this.author = data.info.author;
        this.url = data.info.uri;
        this.duration = data.info.length;
        this.position = data.info.position;
        this.identifier = data.info.identifier;
        this.isSeekable = Boolean(data.info.isSeekable);
        this.isStream = Boolean(data.info.isStream);
        this.requester = null;
        this.sourceName = data.info.sourceName || null;
        this.artworkUrl = data.info.artworkUrl;
        this.isrc = data.info.isrc;
    }
    setRequester(data) {
        this.requester = data;
    }
}
exports.MoonlinkTrack = MoonlinkTrack;
//# sourceMappingURL=MoonlinkTrack.js.map