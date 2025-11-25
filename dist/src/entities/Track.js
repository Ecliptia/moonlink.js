"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Track = void 0;
class Track {
    encoded;
    title;
    author;
    duration;
    identifier;
    isSeekable;
    isStream;
    uri;
    artworkUrl;
    isrc;
    sourceName;
    position;
    time;
    requester;
    origin;
    pluginInfo;
    userData;
    retries = 0;
    constructor(data, requester, origin) {
        this.encoded = data.encoded;
        this.title = data.info.title;
        this.author = data.info.author;
        this.duration = data.info.length;
        this.identifier = data.info.identifier;
        this.isSeekable = data.info.isSeekable;
        this.isStream = data.info.isStream;
        this.uri = data.info.uri;
        this.artworkUrl = data.info.artworkUrl || null;
        this.isrc = data.info.isrc || null;
        this.sourceName = data.info.sourceName;
        this.position = data.info.position || 0;
        this.time = 0;
        this.requester = requester;
        this.origin = origin;
        this.pluginInfo = data.pluginInfo || {};
        this.userData = data.userData || {};
    }
    get thumbnail() {
        if (this.artworkUrl)
            return this.artworkUrl;
        if (this.sourceName === "youtube") {
            return `https://img.youtube.com/vi/${this.identifier}/mqdefault.jpg`;
        }
        return null;
    }
    setRequester(requester) {
        this.requester = requester;
        return this;
    }
    setPosition(position) {
        this.position = position;
        return this;
    }
    toJSON() {
        return {
            encoded: this.encoded,
            info: {
                title: this.title,
                author: this.author,
                length: this.duration,
                identifier: this.identifier,
                isSeekable: this.isSeekable,
                isStream: this.isStream,
                uri: this.uri,
                artworkUrl: this.artworkUrl,
                isrc: this.isrc,
                sourceName: this.sourceName,
                position: this.position,
            },
            pluginInfo: this.pluginInfo,
            userData: this.userData,
        };
    }
}
exports.Track = Track;
//# sourceMappingURL=Track.js.map