import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";
import { ILavaLyricsObject, ILavaLyricsLine } from "../typings/Interfaces";

export class LavaLyricsPlugin extends AbstractPlugin {
    public name: string = "lavalyrics-plugin";
    public readonly capabilities: string[] = ["lavalyrics", "lavalyrics-plugin"];
    public node: Node;
    private lyricsCallbacks: Map<string, (line: ILavaLyricsLine) => void> = new Map();

    public load(node: Node): void {
        this.node = node;
    }

    public unload(node: Node): void {
        this.lyricsCallbacks.clear();
    }

    private mapLavaLyricsResponse(data: any, player?: any): ILavaLyricsObject | null {
        if (!data || !data.data) return null;

        const lines: ILavaLyricsLine[] = data.data.data?.map((line: any) => ({
            timestamp: line.startTime,
            duration: line.endTime - line.startTime,
            line: line.text,
            plugin: data.plugin || {}
        })) || [];

        let type: "timed" | "text" = "text";
        if (data.data.synced && lines.length > 0) {
            type = "timed";
        }

        const trackInfo = player?.current ? {
            title: player.current.title,
            author: player.current.author,
        } : undefined;

        return {
            type: type,
            track: trackInfo,
            source: "LavaLyrics",
            text: data.data.text || (type === "text" ? lines.map(l => l.line).join("\n") : undefined),
            lines: lines,
            plugin: data.plugin || {}
        };
    }

    public async getLyricsForCurrentTrack(guildId: string, skipTrackSource?: boolean): Promise<ILavaLyricsObject | null> {
        const player = this.node.manager.players.get(guildId);
        const params = new URLSearchParams();
        if (skipTrackSource !== undefined) {
            params.append("skipTrackSource", String(skipTrackSource));
        }
        const response = await this.node.rest.get(`sessions/${this.node.sessionId}/players/${guildId}/track/lyrics?${params.toString()}`);
        return this.mapLavaLyricsResponse(response, player);
    }

    public async getLyricsForTrack(encodedTrack: string, skipTrackSource?: boolean): Promise<ILavaLyricsObject | null> {
        const params = new URLSearchParams({
            track: encodedTrack,
        });
        if (skipTrackSource !== undefined) {
            params.append("skipTrackSource", String(skipTrackSource));
        }
        const response = await this.node.rest.get(`lyrics?${params.toString()}`);
        return this.mapLavaLyricsResponse(response);
    }

    public async subscribeToLiveLyrics(guildId: string, skipTrackSource?: boolean): Promise<void> {
        const params = new URLSearchParams();
        if (skipTrackSource !== undefined) {
            params.append("skipTrackSource", String(skipTrackSource));
        }
        await this.node.rest.post(`sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe?${params.toString()}`);
    }

    public async unsubscribeFromLiveLyrics(guildId: string): Promise<void> {
        await this.node.rest.delete(`sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe`);
    }

    public registerLyricsCallback(guildId: string, callback: (line: ILavaLyricsLine) => void): void {
        this.lyricsCallbacks.set(guildId, callback);
    }

    public unregisterLyricsCallback(guildId: string): void {
        this.lyricsCallbacks.delete(guildId);
    }

    public handleEvent(node: Node, payload: any): void {
        if (!payload.guildId) return;

        const player = node.manager.players.get(payload.guildId);
        if (!player) return;

        switch (payload.type) {
            case "LyricsLineEvent":
                const callback = this.lyricsCallbacks.get(payload.guildId);
                if (callback) {
                    callback(payload.line as ILavaLyricsLine);
                }
                break;
            case "LyricsFoundEvent":
                break;
            case "LyricsNotFoundEvent":
                break;
        }
    }
}