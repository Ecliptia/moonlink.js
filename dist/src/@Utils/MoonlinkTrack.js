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
    time = 0;
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
    get calculateRealTimePosition() {
        if (this.position >= this.duration) {
            return this.duration;
        }
        if (this.time) {
            const elapsed = Date.now() - this.time;
            const calculatedPosition = this.position + elapsed / 1000;
            if (calculatedPosition >= this.duration) {
                return this.duration;
            }
            return calculatedPosition;
        }
        return this.position;
    }
    resolveQueueData(data) {
        this.encoded = data.encoded;
        this.title = data.title;
        this.author = data.author;
        this.url = data.url;
        this.duration = data.duration;
        this.position = data.position;
        this.identifier = data.identifier;
        this.isSeekable = Boolean(data.isSeekable);
        this.isStream = Boolean(data.isStream);
        this.sourceName = data.sourceName;
        this.requester = data.requester;
        this.artworkUrl = data.artworkUrl;
        this.isrc = data.isrc;
    }
}
exports.MoonlinkTrack = MoonlinkTrack;
