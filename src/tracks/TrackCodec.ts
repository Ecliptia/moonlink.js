import { Track } from '../entities/Track';
import { decodeTrack, encodeTrack } from '../Util';
import type { ITrack, ITrackInfo } from '../typings/Interfaces';
import type { BackendKind } from '../backends/BackendAdapter';

export type TrackSnapshot = ITrack & { requester?: any; origin?: string; backend?: BackendKind };

/** Encodings belong to their server. Snapshots retain metadata instead of decoding opaque plugin bytes. */
export class TrackCodec {
    public static encode(info: ITrackInfo): string { return encodeTrack(info); }
    public static decode(encoded: string): ITrack { return decodeTrack(encoded); }
    public static serialize(track: Track): TrackSnapshot {
        return { ...track.toJSON(), requester: track.requester, origin: track.origin, backend: track.backend };
    }
    public static restore(data: Partial<TrackSnapshot> & { encoded: string; position?: number }): Track {
        if (!data || typeof data.encoded !== 'string' || !data.encoded) throw new TypeError('Stored track requires an encoding');
        const record = data.info ? data as ITrack : decodeTrack(data.encoded);
        const track = new Track(record, data.requester, data.origin);
        if (data.position !== undefined) track.position = data.position;
        if (data.backend === 'lavalink' || data.backend === 'nodelink') track.backend = data.backend;
        return track;
    }
}
