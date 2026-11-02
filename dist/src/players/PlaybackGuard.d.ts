export declare class PlaybackGuard {
    private generation;
    get ticket(): number;
    invalidate(): number;
    isCurrent(ticket: number): boolean;
}
export declare function playbackGuard(player: object): PlaybackGuard;
