"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Track = void 0;
const Util_1 = require("../Util");
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
    isPartial = false;
    constructor(data, requester, origin) {
        const manager = Util_1.Structure.getManager();
        const partialTrackOptions = manager?.options?.trackPartial;
        this.encoded = data.encoded;
        this.requester = requester || data.userData?.requester;
        this.origin = origin;
        const trackProps = this.createPropertySetters(data.info);
        if (partialTrackOptions && Array.isArray(partialTrackOptions) && partialTrackOptions.length > 0) {
            this.isPartial = true;
            trackProps.title();
            trackProps.author();
            partialTrackOptions.forEach(prop => {
                if (prop in trackProps) {
                    trackProps[prop]();
                }
            });
        }
        else {
            Object.values(trackProps).forEach(setter => setter());
        }
        if (this.requester) {
            if (!this.userData)
                this.userData = {};
            this.userData.requester = this.requester;
        }
        Object.keys(this).forEach(key => {
            if (this[key] === undefined) {
                delete this[key];
            }
        });
    }
    createPropertySetters(info) {
        return {
            title: () => (this.title = info.title),
            author: () => (this.author = info.author),
            duration: () => (this.duration = info.length),
            identifier: () => (this.identifier = info.identifier),
            isSeekable: () => (this.isSeekable = info.isSeekable),
            isStream: () => (this.isStream = info.isStream),
            uri: () => (this.uri = info.uri),
            artworkUrl: () => (this.artworkUrl = info.artworkUrl || null),
            isrc: () => (this.isrc = info.isrc || null),
            sourceName: () => (this.sourceName = info.sourceName),
            position: () => (this.position = info.position || 0),
            time: () => (this.time = 0)
        };
    }
    isPartialTrack() {
        return this.isPartial;
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
        if (this.requester) {
            if (!this.userData)
                this.userData = {};
            this.userData.requester = this.requester;
        }
        return this;
    }
    setPosition(position) {
        this.position = position;
        return this;
    }
    clone() {
        const newTrack = new (Util_1.Structure.get("Track"))(this.toJSON(), this.requester, this.origin);
        newTrack.userData = JSON.parse(JSON.stringify(this.userData));
        return newTrack;
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