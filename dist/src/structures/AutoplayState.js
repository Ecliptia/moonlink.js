"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAutoplayGeneration = getAutoplayGeneration;
exports.invalidateAutoplay = invalidateAutoplay;
exports.getPlaybackGeneration = getPlaybackGeneration;
exports.invalidatePlayback = invalidatePlayback;
const generations = new WeakMap();
const playbackGenerations = new WeakMap();
function getAutoplayGeneration(player) {
    return generations.get(player) ?? 0;
}
function invalidateAutoplay(player) {
    const generation = getAutoplayGeneration(player) + 1;
    generations.set(player, generation);
    return generation;
}
function getPlaybackGeneration(player) {
    return playbackGenerations.get(player) ?? 0;
}
function invalidatePlayback(player) {
    invalidateAutoplay(player);
    const generation = getPlaybackGeneration(player) + 1;
    playbackGenerations.set(player, generation);
    return generation;
}
//# sourceMappingURL=AutoplayState.js.map