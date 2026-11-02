import { Track } from '../entities/Track';
import type { Node } from '../entities/Node';

export class TrackResolutionError extends Error {
    public readonly code = 'TRACK_RESOLUTION_FAILED';
    constructor(message: string) { super(message); this.name = 'TrackResolutionError'; }
}

export class TrackResolver {
    public static async resolve(track: Track, target: Node, source?: Node): Promise<Track> {
        const origin = track.backend ?? source?.backend?.kind;
        const destination = target.backend?.kind;
        const internal = track.pluginInfo?.needsStream === true;
        if (!internal && (origin === destination || !origin && !source)) return track;
        if (!internal && source && !origin && !destination) return track;
        if (!destination) throw new TrackResolutionError('Destination backend identity is unknown');
        if (!track.uri || !/^https?:\/\//i.test(track.uri)) {
            throw new TrackResolutionError('A track URI is required to resolve it on another backend');
        }
        // Resolve against the destination itself, never through Manager.search/native-source shortcuts.
        // v4 loading contract: https://lavalink.dev/api/rest#track-loading
        const loaded = await target.rest.loadTracks(track.uri, { timeoutMs: 10000 });
        if (loaded.loadType !== 'track' || !loaded.data || typeof loaded.data.encoded !== 'string' || !loaded.data.encoded || !loaded.data.info) {
            throw new TrackResolutionError('Destination could not load the requested track URI');
        }
        const info = loaded.data.info;
        // NodeLink HTTP uses -1 for unknown duration; retain the observed value.
        // https://github.com/PerformanC/NodeLink/blob/804e0d6d0f1af30384e0a2d12ddbc8d79e85cf35/src/sources/http.ts#L403
        const validDuration = Number.isFinite(info.length) && (info.length >= 0 || destination === 'nodelink' && info.length === -1);
        if (![info.title, info.author, info.identifier, info.sourceName].every(value => typeof value === 'string') || !validDuration) {
            throw new TrackResolutionError('Destination returned invalid track metadata');
        }
        const resolved = new Track(loaded.data, track.requester, track.origin);
        resolved.userData = { ...track.userData };
        resolved.position = track.position;
        resolved.backend = destination;
        return resolved;
    }
}
