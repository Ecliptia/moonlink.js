import type { Node } from '../entities/Node';
import type { Player } from '../entities/Player';
import type { Track } from '../entities/Track';
export declare class RecommendationResolver {
    static update(node: Node, player: Player, track: Track): Promise<void>;
}
