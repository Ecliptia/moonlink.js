/** A new intent cancels asynchronous work belonging to an older playback intent. */
export class PlaybackGuard {
    private generation = 0;
    private automaticGeneration = 0;

    public get ticket(): number { return this.generation; }
    public get automaticTicket(): number { return this.automaticGeneration; }
    public invalidate(): number { this.cancelAutoPlay(); return ++this.generation; }
    public isCurrent(ticket: number): boolean { return ticket === this.generation; }
    public cancelAutoPlay(): number { return ++this.automaticGeneration; }
    public isAutoCurrent(ticket: number): boolean { return ticket === this.automaticGeneration; }
}

const guards = new WeakMap<object, PlaybackGuard>();

export function playbackGuard(player: object): PlaybackGuard {
    let guard = guards.get(player);
    if (!guard) {
        guard = new PlaybackGuard();
        guards.set(player, guard);
    }
    return guard;
}
