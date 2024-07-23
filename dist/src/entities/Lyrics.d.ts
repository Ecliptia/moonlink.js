import { Player } from './Player';
import { IRESTGetLyrics } from '../typings/Interfaces';
export declare class Lyrics {
    player: Player;
    constructor(player: any);
    getLyrics(): Promise<IRESTGetLyrics>;
}
