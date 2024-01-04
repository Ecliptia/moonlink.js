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
    constructor(data, requester) {
        this.encoded = data.encoded;
        this.title = data.info.title;
        this.author = data.info.author;
        this.url = data.info.uri;
        this.duration = data.info.length;
        this.position = data.info.position;
        this.identifier = data.info.identifier;
        this.isSeekable = Boolean(data.info.isSeekable);
        this.isStream = Boolean(data.info.isStream);
        this.sourceName = data.info.sourceName || null;
        this.requester = requester;
        this.artworkUrl = data.info.artworkUrl;
        this.isrc = data.info.isrc;
    }
}
exports.MoonlinkTrack = MoonlinkTrack;
