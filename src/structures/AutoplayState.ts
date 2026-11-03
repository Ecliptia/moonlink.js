// Keep cancellation state outside player data so it is never persisted.
const generations = new WeakMap<object, number>();

export function getAutoplayGeneration(player: object): number {
    return generations.get(player) ?? 0;
}

export function invalidateAutoplay(player: object): void {
    generations.set(player, getAutoplayGeneration(player) + 1);
}
