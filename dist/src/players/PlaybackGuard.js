"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaybackGuard = void 0;
exports.playbackGuard = playbackGuard;
class PlaybackGuard {
    generation = 0;
    automaticGeneration = 0;
    get ticket() { return this.generation; }
    get automaticTicket() { return this.automaticGeneration; }
    invalidate() { this.cancelAutoPlay(); return ++this.generation; }
    isCurrent(ticket) { return ticket === this.generation; }
    cancelAutoPlay() { return ++this.automaticGeneration; }
    isAutoCurrent(ticket) { return ticket === this.automaticGeneration; }
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