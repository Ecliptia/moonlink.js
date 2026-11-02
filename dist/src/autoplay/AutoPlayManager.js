"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoPlayManager = void 0;
const PlaybackGuard_1 = require("../players/PlaybackGuard");
class AutoPlayManager {
    static async play(node, player, previous) {
        if (!previous || player.destroyed || !player.autoPlay)
            return false;
        const guard = (0, PlaybackGuard_1.playbackGuard)(player);
        const ticket = guard.ticket;
        const automaticTicket = guard.cancelAutoPlay();
        const active = () => guard.isCurrent(ticket) && guard.isAutoCurrent(automaticTicket) && player.autoPlay && !player.destroyed;
        if (!player.recommendations.length) {
            await node.updateRecommendations(player, previous);
        }
        if (!active() || player.queue.size > 0)
            return false;
        const candidates = player.recommendations.slice(0, 10);
        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        if (!selected)
            return false;
        const playing = player.playAutoPlay(selected, ticket, automaticTicket);
        const accepted = await playing;
        if (!accepted || !active()) {
            const index = player.queue.tracks.indexOf(selected);
            if (index >= 0)
                player.queue.remove(index);
            return false;
        }
        player.recommendations = player.recommendations.filter(t => t.encoded !== selected.encoded);
        player.manager.emit('autoPlayed', player, selected, previous);
        return true;
    }
}
exports.AutoPlayManager = AutoPlayManager;
//# sourceMappingURL=AutoPlayManager.js.map