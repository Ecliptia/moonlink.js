export declare class PlaybackGuard {
    private generation;
    private automaticGeneration;
    get ticket(): number;
    get automaticTicket(): number;
    invalidate(): number;
    isCurrent(ticket: number): boolean;
    cancelAutoPlay(): number;
    isAutoCurrent(ticket: number): boolean;
}
export declare function playbackGuard(player: object): PlaybackGuard;
