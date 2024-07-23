import { Player } from './Player';
import { IRESTGetLyrics } from '../typings/Interfaces';
export class Lyrics {
    public player: Player;
    constructor(player) {
        this.player = player;
    }
    public async getLyrics(): Promise<IRESTGetLyrics> {
        if (!this.player.node.info.isNodeLink) return null;
        if (!this.player.current) return;
        
        const lyrics: any = await this.player.node.rest.getLyrics({
            encoded: this.player.current.encoded,
        });  
        return lyrics;
    }
}