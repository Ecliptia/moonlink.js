"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackCodec = void 0;
const Track_1 = require("../entities/Track");
const Util_1 = require("../Util");
class TrackCodec {
    static encode(info) { return (0, Util_1.encodeTrack)(info); }
    static decode(encoded) { return (0, Util_1.decodeTrack)(encoded); }
    static serialize(track) {
        return { ...track.toJSON(), requester: track.requester, origin: track.origin, backend: track.backend };
    }
    static restore(data) {
        if (!data || typeof data.encoded !== 'string' || !data.encoded)
            throw new TypeError('Stored track requires an encoding');
        const record = data.info ? data : (0, Util_1.decodeTrack)(data.encoded);
        const track = new Track_1.Track(record, data.requester, data.origin);
        if (data.position !== undefined)
            track.position = data.position;
        if (data.backend === 'lavalink' || data.backend === 'nodelink')
            track.backend = data.backend;
        return track;
    }
}
exports.TrackCodec = TrackCodec;
//# sourceMappingURL=TrackCodec.js.map