import type { Player } from '../entities/Player';
import type { Node } from '../entities/Node';
import type { Track } from '../entities/Track';
export declare class AutoPlayManager {
    static play(node: Node, player: Player, previous: Track): Promise<boolean>;
}
