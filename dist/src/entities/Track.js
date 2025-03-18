"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Track = void 0;
const Utils_1 = require("../Utils");
class Track {
    encoded;
    url;
    author;
    duration;
    title;
    position;
    identifier;
    isSeekable;
    isStream;
    artworkUrl;
    isrc;
    time = 0;
    sourceName;
    requestedBy;
    pluginInfo = {};
    isPartial = false;
    constructor(trackData, requester) {
        const manager = Utils_1.Structure.getManager();
        const partialTrackOptions = manager?.options?.partialTrack;
        this.encoded = trackData.encoded;
        this.title = trackData.info.title;
        this.author = trackData.info.author;
        if (trackData.pluginInfo) {
            this.pluginInfo = trackData.pluginInfo;
        }
        const trackProps = this.createPropertySetters(trackData.info);
        if (partialTrackOptions && Array.isArray(partialTrackOptions) && partialTrackOptions.length > 0) {
            this.isPartial = true;
            partialTrackOptions.forEach(prop => {
                if (prop in trackProps)
                    trackProps[prop]();
            });
        }
        else {
            Object.values(trackProps).forEach(setter => setter());
        }
        if (requester)
            this.requestedBy = requester;
        Object.keys(this).forEach(key => {
            if (this[key] === undefined) {
                delete this[key];
            }
        });
    }
    createPropertySetters(info) {
        return {
            url: () => info.uri && (this.url = info.uri),
            duration: () => info.length && (this.duration = info.length),
            position: () => info.position && (this.position = info.position),
            identifier: () => info.identifier && (this.identifier = info.identifier),
            isSeekable: () => (this.isSeekable = info.isSeekable),
            isStream: () => (this.isStream = info.isStream),
            artworkUrl: () => info.artworkUrl && (this.artworkUrl = info.artworkUrl),
            isrc: () => info.isrc && (this.isrc = info.isrc),
            sourceName: () => info.sourceName && (this.sourceName = info.sourceName)
        };
    }
    setRequester(requester) {
        this.requestedBy = requester;
    }
    resolveData() {
        this.isPartial = false;
        const info = (0, Utils_1.decodeTrack)(this.encoded).info;
        Object.values(this.createPropertySetters(info)).forEach(setter => setter());
        return this;
    }
    isPartialTrack() {
        return this.isPartial;
    }
    raw() {
        const track = (0, Utils_1.decodeTrack)(this.encoded);
        return track;
    }
    static async unresolvedTrack(options) {
        const manager = Utils_1.Structure.getManager();
        if (!manager)
            throw new Error("Manager is not initialized");
        const search = await manager.search({
            query: `${options.title} ${options.author}`,
            source: options.source || manager.options.defaultPlatformSearch
        });
        if (search.tracks.length) {
            if (search.tracks.length === 1)
                return search.tracks[0];
            if (options.duration) {
                return search.tracks.reduce((prev, curr) => Math.abs(curr.duration - options.duration) < Math.abs(prev.duration - options.duration) ? curr : prev);
            }
            return search.tracks[0];
        }
        return null;
    }
}
exports.Track = Track;
//# sourceMappingURL=Track.js.map