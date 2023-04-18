"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkTrack = void 0;
class MoonlinkTrack {
    track;
    encoded;
    trackEncoded;
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
    constructor(data) {
        data.track ? this.track = data.track : data.encoded ? this.encoded = data.encoded : data.trackEncoded ? this.trackEncoded = data.trackEncoded : null;
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
    }
    get thumbnail() {
        if (this.sourceName === 'youtube')
            return `https://img.youtube.com/vi/${this.identifier}/sddefault.jpg`;
        return null;
    }
    setRequester(data) {
        this.requester = data;
    }
}
exports.MoonlinkTrack = MoonlinkTrack;
//# sourceMappingURL=MoonlinkTrack.js.map