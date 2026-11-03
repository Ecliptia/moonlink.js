"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAutoplayGeneration = getAutoplayGeneration;
exports.invalidateAutoplay = invalidateAutoplay;
const generations = new WeakMap();
function getAutoplayGeneration(player) {
    return generations.get(player) ?? 0;
}
function invalidateAutoplay(player) {
    generations.set(player, getAutoplayGeneration(player) + 1);
}
//# sourceMappingURL=AutoplayState.js.map