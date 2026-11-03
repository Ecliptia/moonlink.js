// Keep cancellation state outside player data so it is never persisted.
const generations = new WeakMap<object, number>();
const playbackGenerations = new WeakMap<object, number>();

export function getAutoplayGeneration(player: object): number {
    return generations.get(player) ?? 0;
}

export function invalidateAutoplay(player: object): number {
    const generation = getAutoplayGeneration(player) + 1;
    generations.set(player, generation);
    return generation;
}

export function getPlaybackGeneration(player: object): number {
    return playbackGenerations.get(player) ?? 0;
}

export function invalidatePlayback(player: object): number {
    invalidateAutoplay(player);
    const generation = getPlaybackGeneration(player) + 1;
    playbackGenerations.set(player, generation);
    return generation;
}
