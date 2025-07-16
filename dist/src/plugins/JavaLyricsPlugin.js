"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaLyricsPlugin = void 0;
const AbstractPlugin_1 = require("./AbstractPlugin");
class JavaLyricsPlugin extends AbstractPlugin_1.AbstractPlugin {
    name = "java-lyrics-plugin";
    capabilities = ["java-lyrics", 'java-lyrics-plugin'];
    node;
    lyricsCallbacks = new Map();
    lyricsCache = new Map();
    searchCache = new Map();
    liveLyricsTimeouts = new Map();
    load(node) {
        this.node = node;
        this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Loaded for node ${node.identifier}`);
    }
    unload(node) {
        this.lyricsCallbacks.clear();
        this.lyricsCache.clear();
        this.searchCache.clear();
        for (const timeout of this.liveLyricsTimeouts.values()) {
            clearTimeout(timeout);
        }
        this.liveLyricsTimeouts.clear();
        this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Unloaded for node ${node.identifier}`);
    }
    onTrackEnd(player) {
        this.unsubscribeFromLiveLyrics(player.guildId);
    }
    mapLyricsResponse(data) {
        if (!data)
            return null;
        const lines = data.lines?.map((line) => ({
            timestamp: line.range.start,
            duration: line.range.end - line.range.start,
            line: line.line,
            plugin: data.plugin || {}
        })) || [];
        return {
            type: data.type,
            track: data.track,
            source: data.source || "java-lyrics-plugin",
            text: data.text,
            lines: lines,
            plugin: data.plugin || {}
        };
    }
    async search(query, source) {
        const cacheKey = source ? `${query}-${source}` : query;
        if (this.searchCache.has(cacheKey)) {
            this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Cache hit for search query: ${query}`);
            return this.searchCache.get(cacheKey);
        }
        try {
            const params = new URLSearchParams({ query });
            if (source) {
                params.append("source", source);
            }
            const response = await this.node.rest.get(`lyrics/search?${params.toString()}`);
            if (response && Array.isArray(response)) {
                this.searchCache.set(cacheKey, response);
                this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Search successful for query: ${query}`);
                return response;
            }
            return [];
        }
        catch (e) {
            this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Search failed for query ${query}: ${e.message}`);
            return [];
        }
    }
    async getLyricsByVideoId(videoId) {
        if (this.lyricsCache.has(videoId)) {
            this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Cache hit for videoId: ${videoId}`);
            return this.lyricsCache.get(videoId);
        }
        try {
            const response = await this.node.rest.get(`lyrics/${videoId}`);
            const mappedLyrics = this.mapLyricsResponse(response);
            if (mappedLyrics) {
                this.lyricsCache.set(videoId, mappedLyrics);
                this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Fetched lyrics by videoId: ${videoId}`);
            }
            return mappedLyrics;
        }
        catch (e) {
            this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Failed to get lyrics by videoId ${videoId}: ${e.message}`);
            return null;
        }
    }
    async getLyricsForCurrentTrack(guildId) {
        const player = this.node.manager.players.get(guildId);
        if (!player || !player.current) {
            this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > No player or current track for guild ${guildId}`);
            return null;
        }
        const cacheKey = `${guildId}-${player.current.encoded}`;
        if (this.lyricsCache.has(cacheKey)) {
            this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Cache hit for current track lyrics for guild: ${guildId}`);
            return this.lyricsCache.get(cacheKey);
        }
        try {
            const response = await this.node.rest.get(`sessions/${this.node.sessionId}/players/${guildId}/lyrics`);
            const mappedLyrics = this.mapLyricsResponse(response);
            if (mappedLyrics) {
                this.lyricsCache.set(cacheKey, mappedLyrics);
                this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Fetched lyrics for current track for guild: ${guildId}`);
            }
            return mappedLyrics;
        }
        catch (e) {
            this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Failed to get lyrics for current track for guild ${guildId}: ${e.message}`);
            return null;
        }
    }
    cleanTrackTitle(title) {
        let cleanedTitle = title.replace(/ *\([^)]*\) */g, "").replace(/ *\[[^\]]*\] */g, "");
        cleanedTitle = cleanedTitle.replace(/feat\./gi, "").replace(/ft\./gi, "");
        return cleanedTitle.trim();
    }
    async getStaticLyricsForTrack(guildId) {
        const player = this.node.manager.players.get(guildId);
        if (!player || !player.current) {
            this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > No player or current track for guild ${guildId}. Cannot search for static lyrics.`);
            return null;
        }
        const trackTitle = player.current.title;
        const cleanedTitle = this.cleanTrackTitle(trackTitle);
        if (!cleanedTitle) {
            this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Cleaned track title is empty for guild ${guildId}. Cannot search for static lyrics.`);
            return null;
        }
        let foundLyrics = null;
        const searchResults = await this.search(cleanedTitle);
        if (searchResults && searchResults.length > 0) {
            for (const result of searchResults) {
                if (result && result.videoId) {
                    foundLyrics = await this.getLyricsByVideoId(result.videoId);
                    if (foundLyrics && (foundLyrics.text || (foundLyrics.lines && foundLyrics.lines.length > 0))) {
                        this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Found static lyrics via videoId search for guild ${guildId}`);
                        return foundLyrics;
                    }
                }
            }
        }
        this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > No static lyrics found via search for current track for guild ${guildId}`);
        return null;
    }
    async subscribeToLiveLyrics(guildId) {
        const player = this.node.manager.players.get(guildId);
        if (!player || !player.current) {
            this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Cannot subscribe: No player or track for guild ${guildId}`);
            return;
        }
        if (this.liveLyricsTimeouts.has(guildId)) {
            this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Already subscribed for guild ${guildId}`);
            return;
        }
        let lyrics = await this.getLyricsForCurrentTrack(guildId);
        if (!lyrics || !lyrics.lines || lyrics.lines.length === 0) {
            lyrics = await this.getStaticLyricsForTrack(guildId);
        }
        if (!lyrics || !lyrics.lines || lyrics.lines.length === 0) {
            this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > No lyrics found for guild ${guildId}. Cannot subscribe.`);
            return;
        }
        this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Subscribed to live lyrics for guild ${guildId}. Player playing: ${player.playing}, paused: ${player.paused}`);
        const firstLineIndex = lyrics.lines.findIndex(l => l.timestamp >= (player.current?.position ?? 0));
        this.scheduleNextLine(player, lyrics, firstLineIndex === -1 ? 0 : firstLineIndex);
    }
    scheduleNextLine(player, lyrics, lineIndex) {
        if (!player.playing || player.paused) {
            this.unsubscribeFromLiveLyrics(player.guildId);
            return;
        }
        if (lineIndex >= lyrics.lines.length) {
            this.unsubscribeFromLiveLyrics(player.guildId);
            return;
        }
        const currentLine = lyrics.lines[lineIndex];
        const currentTime = player.current?.position ?? 0;
        const pollingInterval = 50;
        if (currentTime >= currentLine.timestamp) {
            const callback = this.lyricsCallbacks.get(player.guildId);
            if (callback && player.playing && !player.paused) {
                callback(currentLine);
            }
            this.scheduleNextLine(player, lyrics, lineIndex + 1);
            return;
        }
        const delay = currentLine.timestamp - currentTime;
        const timeoutDuration = Math.min(delay, pollingInterval);
        const timeout = setTimeout(() => {
            this.scheduleNextLine(player, lyrics, lineIndex);
        }, timeoutDuration);
        this.liveLyricsTimeouts.set(player.guildId, timeout);
    }
    async unsubscribeFromLiveLyrics(guildId) {
        if (this.liveLyricsTimeouts.has(guildId)) {
            clearTimeout(this.liveLyricsTimeouts.get(guildId));
            this.liveLyricsTimeouts.delete(guildId);
        }
        if (this.lyricsCallbacks.has(guildId)) {
            this.lyricsCallbacks.delete(guildId);
            this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Unsubscribed from live lyrics for guild ${guildId}`);
        }
    }
    registerLyricsCallback(guildId, callback) {
        this.lyricsCallbacks.set(guildId, callback);
        this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Registered lyrics callback for guild ${guildId}`);
    }
    unregisterLyricsCallback(guildId) {
        this.lyricsCallbacks.delete(guildId);
        this.node.manager.emit("debug", `Moonlink.js > JavaLyricsPlugin > Unregistered lyrics callback for guild ${guildId}`);
    }
}
exports.JavaLyricsPlugin = JavaLyricsPlugin;
//# sourceMappingURL=JavaLyricsPlugin.js.map