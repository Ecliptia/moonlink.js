"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lyrics = void 0;
class Lyrics {
    player;
    constructor(player) {
        this.player = player;
    }
    async getLyrics() {
        if (!this.player.node.info.isNodeLink)
            return null;
        if (!this.player.current)
            return;
        const lyrics = await this.player.node.rest.getLyrics({
            encoded: this.player.current.encoded,
        });
        return lyrics;
    }
}
exports.Lyrics = Lyrics;
//# sourceMappingURL=Lyrics.js.map