import type { Player } from '../entities/Player';
import type { Node } from '../entities/Node';
import type { Track } from '../entities/Track';
import { playbackGuard } from '../players/PlaybackGuard';

export class AutoPlayManager {
    public static async play(node: Node, player: Player, previous: Track): Promise<boolean> {
        if (!previous || player.destroyed || !player.autoPlay) return false;
        const guard = playbackGuard(player);
        const ticket = guard.ticket;
        const automaticTicket = guard.cancelAutoPlay();
        const active = () => guard.isCurrent(ticket) && guard.isAutoCurrent(automaticTicket) && player.autoPlay && !player.destroyed;

        if (!player.recommendations.length) {
            await node.updateRecommendations(player, previous);
        }
        if (!active() || player.queue.size > 0) return false;

        const candidates = player.recommendations.slice(0, 10);
        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        if (!selected) return false;

        const playing = player.playAutoPlay(selected, ticket, automaticTicket);
        const accepted = await playing;
        if (!accepted || !active()) {
            // A rejected recommendation must not become a later queued user request.
            const index = player.queue.tracks.indexOf(selected);
            if (index >= 0) player.queue.remove(index);
            return false;
        }

        player.recommendations = player.recommendations.filter(t => t.encoded !== selected.encoded);
        player.manager.emit('autoPlayed', player, selected, previous);
        return true;
    }
}
