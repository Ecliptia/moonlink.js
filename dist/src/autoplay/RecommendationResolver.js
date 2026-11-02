"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationResolver = void 0;
const PlaybackGuard_1 = require("../players/PlaybackGuard");
const requests = new WeakMap();
class RecommendationResolver {
    static async update(node, player, track) {
        const request = {};
        requests.set(player, request);
        const guard = (0, PlaybackGuard_1.playbackGuard)(player);
        const ticket = guard.ticket;
        if (!track || !track.sourceName || !track.identifier)
            return;
        try {
            let uri = null;
            let searchSource = null;
            const source = track.sourceName.toLowerCase();
            const identifier = track.identifier;
            switch (source) {
                case "youtube":
                    uri = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
                    searchSource = "youtube";
                    break;
                case "youtubemusic":
                    uri = `https://music.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
                    searchSource = "youtubemusic";
                    break;
                case "spotify":
                    if (node.isNodeLink && node.capabilities.has("source:spotify")) {
                        uri = `seed_tracks=${identifier}`;
                        searchSource = "sprec";
                    }
                    break;
                case "deezer":
                    if (node.isNodeLink && node.capabilities.has("source:deezer")) {
                        uri = identifier;
                        searchSource = "dzrec";
                    }
                    break;
                case "soundcloud":
                    uri = `${track.author}`;
                    searchSource = "soundcloud";
                    break;
                case "applemusic":
                    if (node.isNodeLink && node.capabilities.has("source:applemusic")) {
                        uri = identifier;
                        searchSource = "amrec";
                    }
                    break;
            }
            if (!uri || !searchSource) {
                if (source !== "youtube") {
                    const res = await node.manager.search({ query: `${track.title} ${track.author}`, node: node.identifier });
                    if (res?.tracks?.length > 0) {
                        uri = `https://www.youtube.com/watch?v=${res.tracks[0].identifier}&list=RD${res.tracks[0].identifier}`;
                        searchSource = "youtube";
                    }
                    else {
                        return;
                    }
                }
                else {
                    return;
                }
            }
            if (!guard.isCurrent(ticket) || player.destroyed || requests.get(player) !== request)
                return;
            const res = await node.manager.search({
                node: node.identifier,
                query: uri,
                source: searchSource,
                requester: track.requester,
            });
            if (!res || !res.tracks || res.tracks.length === 0 || res.loadType === "error") {
                return;
            }
            const historyLimit = node.manager.options.queue?.historyLimit ?? player.historySize ?? 10;
            const recentHistory = Array.isArray(player.previous) ? player.previous.slice(-historyLimit) : [];
            const queuedTracks = Array.isArray(player.queue?.tracks) ? player.queue.tracks : [];
            const getTrackKey = (t) => {
                if (!t)
                    return null;
                const id = t.identifier ?? t.info?.identifier;
                const src = (t.sourceName ?? t.info?.sourceName ?? "unknown").toLowerCase();
                if (id)
                    return `${src}:${id}`;
                return t.encoded || null;
            };
            const blockedKeys = new Set();
            const addBlocked = (t) => {
                const key = getTrackKey(t);
                if (key)
                    blockedKeys.add(key);
            };
            addBlocked(track);
            recentHistory.forEach(addBlocked);
            queuedTracks.forEach(addBlocked);
            const seenKeys = new Set();
            const candidates = res.tracks.filter((t) => {
                const key = getTrackKey(t);
                if (!key || blockedKeys.has(key) || seenKeys.has(key))
                    return false;
                seenKeys.add(key);
                return true;
            });
            if (guard.isCurrent(ticket) && !player.destroyed && requests.get(player) === request)
                player.recommendations = candidates;
        }
        catch (error) {
            node.manager.emit("debug", `Moonlink.js > Node#updateRecommendations >> Error fetching recommendations: ${error.message}`);
        }
    }
}
exports.RecommendationResolver = RecommendationResolver;
//# sourceMappingURL=RecommendationResolver.js.map