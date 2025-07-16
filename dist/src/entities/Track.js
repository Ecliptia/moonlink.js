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
    origin;
    requestedBy;
    pluginInfo = {};
    chapters = [];
    currentChapterIndex = -1;
    isPartial = false;
    constructor(trackData, requester) {
        const manager = Utils_1.Structure.getManager();
        const partialTrackOptions = manager?.options?.partialTrack;
        this.encoded = trackData.encoded;
        this.title = trackData.info.title;
        this.author = trackData.info.author;
        this.pluginInfo = trackData.pluginInfo ?? {};
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
        this.origin = trackData.origin;
        if (requester)
            this.requestedBy = typeof requester === 'string' ? { id: requester } : requester;
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
    setPosition(position) {
        this.position = position;
    }
    setTime(time) {
        this.time = time;
    }
    setChapters(chapters) {
        this.chapters = chapters;
    }
    setRequester(requester) {
        this.requestedBy = typeof requester === 'string' ? { id: requester } : requester;
    }
    async resolve() {
        if (this.pluginInfo.MoonlinkInternal) {
            let track = await Utils_1.Structure.getManager().search({
                query: `${this.title} ${this.author}`,
                source: Utils_1.Structure.getManager().options.defaultPlatformSearch
            });
            if (track.loadType === "empty" || track.loadType === "error")
                return false;
            this.encoded = track.tracks[0].encoded;
            return track.tracks.length > 0;
        }
        else
            return false;
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
    getThumbnailUrl(quality = "default") {
        if (this.sourceName === "youtube" && this.identifier) {
            const validQualities = ["default", "hqdefault", "mqdefault", "sddefault", "maxresdefault"];
            const selectedQuality = validQualities.includes(quality) ? quality : "maxresdefault";
            return `https://img.youtube.com/vi/${this.identifier}/${selectedQuality}.jpg`;
        }
        return this.artworkUrl;
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