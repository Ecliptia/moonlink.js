"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LavaLyricsPlugin = void 0;
const AbstractPlugin_1 = require("./AbstractPlugin");
class LavaLyricsPlugin extends AbstractPlugin_1.AbstractPlugin {
    name = "lavalyrics-plugin";
    capabilities = ["lavalyrics"];
    node;
    lyricsCallbacks = new Map();
    load(node) {
        this.node = node;
    }
    unload(node) {
        this.lyricsCallbacks.clear();
    }
    async getLyricsForCurrentTrack(guildId, skipTrackSource) {
        const params = new URLSearchParams();
        if (skipTrackSource !== undefined) {
            params.append("skipTrackSource", String(skipTrackSource));
        }
        const response = await this.node.rest.get(`sessions/${this.node.sessionId}/players/${guildId}/track/lyrics?${params.toString()}`);
        return response;
    }
    async getLyricsForTrack(encodedTrack, skipTrackSource) {
        const params = new URLSearchParams({
            track: encodedTrack,
        });
        if (skipTrackSource !== undefined) {
            params.append("skipTrackSource", String(skipTrackSource));
        }
        const response = await this.node.rest.get(`lyrics?${params.toString()}`);
        return response;
    }
    async subscribeToLiveLyrics(guildId, skipTrackSource) {
        const params = new URLSearchParams();
        if (skipTrackSource !== undefined) {
            params.append("skipTrackSource", String(skipTrackSource));
        }
        await this.node.rest.post(`sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe?${params.toString()}`);
    }
    async unsubscribeFromLiveLyrics(guildId) {
        await this.node.rest.delete(`sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe`);
    }
    registerLyricsCallback(guildId, callback) {
        this.lyricsCallbacks.set(guildId, callback);
    }
    unregisterLyricsCallback(guildId) {
        this.lyricsCallbacks.delete(guildId);
    }
    handleEvent(node, payload) {
        if (!payload.guildId)
            return;
        const player = node.manager.players.get(payload.guildId);
        if (!player)
            return;
        switch (payload.type) {
            case "LyricsLineEvent":
                const callback = this.lyricsCallbacks.get(payload.guildId);
                if (callback) {
                    callback(payload.line);
                }
                break;
            case "LyricsFoundEvent":
                break;
            case "LyricsNotFoundEvent":
                break;
        }
    }
}
exports.LavaLyricsPlugin = LavaLyricsPlugin;
//# sourceMappingURL=LavaLyricsPlugin.js.map