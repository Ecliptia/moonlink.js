import { Track } from '../entities/Track';
import type { ITrack, ITrackInfo } from '../typings/Interfaces';
import type { BackendKind } from '../backends/BackendAdapter';
export type TrackSnapshot = ITrack & {
    requester?: any;
    origin?: string;
    backend?: BackendKind;
};
export declare class TrackCodec {
    static encode(info: ITrackInfo): string;
    static decode(encoded: string): ITrack;
    static serialize(track: Track): TrackSnapshot;
    static restore(data: Partial<TrackSnapshot> & {
        encoded: string;
        position?: number;
    }): Track;
}
