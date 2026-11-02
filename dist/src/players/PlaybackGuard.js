"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaybackGuard = void 0;
exports.playbackGuard = playbackGuard;
class PlaybackGuard {
    generation = 0;
    get ticket() { return this.generation; }
    invalidate() { return ++this.generation; }
    isCurrent(ticket) { return ticket === this.generation; }
}
exports.PlaybackGuard = PlaybackGuard;
const guards = new WeakMap();
function playbackGuard(player) {
    let guard = guards.get(player);
    if (!guard) {
        guard = new PlaybackGuard();
        guards.set(player, guard);
    }
    return guard;
}
//# sourceMappingURL=PlaybackGuard.js.map