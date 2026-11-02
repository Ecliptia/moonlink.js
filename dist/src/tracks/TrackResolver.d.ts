import { Track } from '../entities/Track';
import type { Node } from '../entities/Node';
export declare class TrackResolutionError extends Error {
    readonly code = "TRACK_RESOLUTION_FAILED";
    constructor(message: string);
}
export declare class TrackResolver {
    static resolve(track: Track, target: Node, source?: Node): Promise<Track>;
}
