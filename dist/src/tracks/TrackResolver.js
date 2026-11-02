"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackResolver = exports.TrackResolutionError = void 0;
const Track_1 = require("../entities/Track");
class TrackResolutionError extends Error {
    code = 'TRACK_RESOLUTION_FAILED';
    constructor(message) { super(message); this.name = 'TrackResolutionError'; }
}
exports.TrackResolutionError = TrackResolutionError;
class TrackResolver {
    static async resolve(track, target, source) {
        const origin = track.backend ?? source?.backend?.kind;
        const destination = target.backend?.kind;
        const internal = track.pluginInfo?.needsStream === true;
        if (!internal && (origin === destination || !origin && !source))
            return track;
        if (!internal && source && !origin && !destination)
            return track;
        if (!destination)
            throw new TrackResolutionError('Destination backend identity is unknown');
        if (!track.uri || !/^https?:\/\//i.test(track.uri)) {
            throw new TrackResolutionError('A track URI is required to resolve it on another backend');
        }
        const loaded = await target.rest.loadTracks(track.uri, { timeoutMs: 10000 });
        if (loaded.loadType !== 'track' || !loaded.data || typeof loaded.data.encoded !== 'string' || !loaded.data.encoded || !loaded.data.info) {
            throw new TrackResolutionError('Destination could not load the requested track URI');
        }
        const info = loaded.data.info;
        const validDuration = Number.isFinite(info.length) && (info.length >= 0 || destination === 'nodelink' && info.length === -1);
        if (![info.title, info.author, info.identifier, info.sourceName].every(value => typeof value === 'string') || !validDuration) {
            throw new TrackResolutionError('Destination returned invalid track metadata');
        }
        const resolved = new Track_1.Track(loaded.data, track.requester, track.origin);
        resolved.userData = { ...track.userData };
        resolved.position = track.position;
        resolved.backend = destination;
        return resolved;
    }
}
exports.TrackResolver = TrackResolver;
//# sourceMappingURL=TrackResolver.js.map