import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";
import { ILavaLyricsObject, ILavaLyricsLine, ITrack, IOptionsManager } from "../typings/Interfaces";
import { decodeTrack } from "../Utils";
import { Player } from "../entities/Player";

export class LyricsKtPlugin extends AbstractPlugin {
    public name: string = "lyrics";
    public readonly capabilities: string[] = ["lyrics"];
    public node: Node;
    private lyricsCallbacks: Map<string, (line: ILavaLyricsLine) => void> = new Map();
    private lyricsCache: Map<string, ILavaLyricsObject> = new Map();
    private searchCache: Map<string, any[]> = new Map();
    private liveLyricsTimeouts: Map<string, NodeJS.Timeout> = new Map();

    public load(node: Node): void {
        this.node = node;
        this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Loaded for node ${node.identifier}`);
    }

    public unload(node: Node): void {
        this.lyricsCallbacks.clear();
        this.lyricsCache.clear();
        this.searchCache.clear();
        for (const timeout of this.liveLyricsTimeouts.values()) {
            clearTimeout(timeout);
        }
        this.liveLyricsTimeouts.clear();
        this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Unloaded for node ${node.identifier}`);
    }

    public onTrackEnd(player: Player): void {
        this.unsubscribeFromLiveLyrics(player.guildId);
    }

    private mapLyricsKtResponse(data: any): ILavaLyricsObject | null {
        if (!data) return null;

        const lines: ILavaLyricsLine[] = data.lines?.map((line: any) => ({
            timestamp: line.range.start,
            duration: line.range.end - line.range.start,
            line: line.line,
            plugin: data.plugin || {}
        })) || [];

        return {
            type: data.type,
            track: data.track,
            source: data.source || "lyrics.kt",
            text: data.text,
            lines: lines,
            plugin: data.plugin || {}
        };
    }

    public async search(query: string): Promise<any[]> {
        if (this.searchCache.has(query)) {
            this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Cache hit for search query: ${query}`);
            return this.searchCache.get(query)!;
        }

        try {
            const response = await this.node.rest.get(`lyrics/search/${query}`);
            if (response && Array.isArray(response)) {
                this.searchCache.set(query, response);
                this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Search successful for query: ${query}`);
                return response;
            }
            return [];
        } catch (e: any) {
            this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Search failed for query ${query}: ${e.message}`);
            return [];
        }
    }

    public async getLyricsByVideoId(videoId: string): Promise<ILavaLyricsObject | null> {
        if (this.lyricsCache.has(videoId)) {
            this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Cache hit for videoId: ${videoId}`);
            return this.lyricsCache.get(videoId)!;
        }

        try {
            const response = await this.node.rest.get(`lyrics/${videoId}`);
            const mappedLyrics = this.mapLyricsKtResponse(response);
            if (mappedLyrics) {
                this.lyricsCache.set(videoId, mappedLyrics);
                this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Fetched lyrics by videoId: ${videoId}`);
            }
            return mappedLyrics;
        } catch (e: any) {
            this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Failed to get lyrics by videoId ${videoId}: ${e.message}`);
            return null;
        }
    }

    public async getLyricsForCurrentTrack(guildId: string): Promise<ILavaLyricsObject | null> {
        const player = this.node.manager.players.get(guildId);
        if (!player || !player.current) {
            this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > No player or current track for guild ${guildId}`);
            return null;
        }

        const cacheKey = `${guildId}-${player.current.encoded}`;
        if (this.lyricsCache.has(cacheKey)) {
            this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Cache hit for current track lyrics for guild: ${guildId}`);
            return this.lyricsCache.get(cacheKey)!;
        }

        try {
            const response = await this.node.rest.get(`sessions/${this.node.sessionId}/players/${guildId}/lyrics`);
            const mappedLyrics = this.mapLyricsKtResponse(response);
            if (mappedLyrics) {
                this.lyricsCache.set(cacheKey, mappedLyrics);
                this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Fetched lyrics for current track for guild: ${guildId}`);
            }
            return mappedLyrics;
        } catch (e: any) {
            this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Failed to get lyrics for current track for guild ${guildId}: ${e.message}`);
            return null;
        }
    }

    private cleanTrackTitle(title: string): string {
        let cleanedTitle = title.replace(/ *\([^)]*\) */g, "").replace(/ *\[[^\]]*\] */g, "");
        cleanedTitle = cleanedTitle.replace(/feat\./gi, "").replace(/ft\./gi, "");
        return cleanedTitle.trim();
    }

    public async getStaticLyricsForTrack(guildId: string): Promise<ILavaLyricsObject | null> {
        const player = this.node.manager.players.get(guildId);
        if (!player || !player.current) {
            this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > No player or current track for guild ${guildId}. Cannot search for static lyrics.`);
            return null;
        }

        const trackTitle = player.current.title;
        const cleanedTitle = this.cleanTrackTitle(trackTitle);

        if (!cleanedTitle) {
            this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Cleaned track title is empty for guild ${guildId}. Cannot search for static lyrics.`);
            return null;
        }

        let foundLyrics: ILavaLyricsObject | null = null;

        const searchResults = await this.search(cleanedTitle);
        if (searchResults && searchResults.length > 0) {
            for (const result of searchResults) {
                if (result && result.videoId) {
                    foundLyrics = await this.getLyricsByVideoId(result.videoId);
                    if (foundLyrics && (foundLyrics.text || (foundLyrics.lines && foundLyrics.lines.length > 0))) {
                        this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Found static lyrics via videoId search for guild ${guildId}`);
                        return foundLyrics;
                    }
                }
            }
        }

        this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > No static lyrics found via search for current track for guild ${guildId}`);
        return null;
    }

    public async subscribeToLiveLyrics(guildId: string): Promise<void> {
        const player = this.node.manager.players.get(guildId);
        if (!player || !player.current) {
            this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Cannot subscribe: No player or track for guild ${guildId}`);
            return;
        }

        if (this.liveLyricsTimeouts.has(guildId)) {
            this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Already subscribed for guild ${guildId}`);
            return;
        }

        let lyrics = await this.getLyricsForCurrentTrack(guildId);
        if (!lyrics || !lyrics.lines || lyrics.lines.length === 0) {
            lyrics = await this.getStaticLyricsForTrack(guildId);
        }

        if (!lyrics || !lyrics.lines || lyrics.lines.length === 0) {
            this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > No lyrics found for guild ${guildId}. Cannot subscribe.`);
            return;
        }

        this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Subscribed to live lyrics for guild ${guildId}. Player playing: ${player.playing}, paused: ${player.paused}`);
        
        const firstLineIndex = lyrics.lines.findIndex(l => l.timestamp >= (player.current?.position ?? 0));
        this.scheduleNextLine(player, lyrics, firstLineIndex === -1 ? 0 : firstLineIndex);
    }

    private scheduleNextLine(player: Player, lyrics: ILavaLyricsObject, lineIndex: number): void {
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

    public async unsubscribeFromLiveLyrics(guildId: string): Promise<void> {
        if (this.liveLyricsTimeouts.has(guildId)) {
            clearTimeout(this.liveLyricsTimeouts.get(guildId)!);
            this.liveLyricsTimeouts.delete(guildId);
        }
        if (this.lyricsCallbacks.has(guildId)) {
            this.lyricsCallbacks.delete(guildId);
            this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Unsubscribed from live lyrics for guild ${guildId}`);
        }
    }

    public registerLyricsCallback(guildId: string, callback: (line: ILavaLyricsLine) => void): void {
        this.lyricsCallbacks.set(guildId, callback);
        this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Registered lyrics callback for guild ${guildId}`);
    }

    public unregisterLyricsCallback(guildId: string): void {
        this.lyricsCallbacks.delete(guildId);
        this.node.manager.emit("debug", `Moonlink.js > LyricsKtPlugin > Unregistered lyrics callback for guild ${guildId}`);
    }
}