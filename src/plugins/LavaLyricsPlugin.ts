import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";
import { ILavaLyricsObject, ILavaLyricsLine } from "../typings/Interfaces";

export class LavaLyricsPlugin extends AbstractPlugin {
    public name: string = "lavalyrics-plugin";
    public readonly capabilities: string[] = ["lavalyrics"];
    public node: Node;
    private lyricsCallbacks: Map<string, (line: ILavaLyricsLine) => void> = new Map();

    public load(node: Node): void {
        this.node = node;
    }

    public unload(node: Node): void {
        this.lyricsCallbacks.clear();
    }

    public async getLyricsForCurrentTrack(guildId: string, skipTrackSource?: boolean): Promise<ILavaLyricsObject | null> {
        const params = new URLSearchParams();
        if (skipTrackSource !== undefined) {
            params.append("skipTrackSource", String(skipTrackSource));
        }
        const response = await this.node.rest.get(`sessions/${this.node.sessionId}/players/${guildId}/track/lyrics?${params.toString()}`);
        return response as ILavaLyricsObject;
    }

    public async getLyricsForTrack(encodedTrack: string, skipTrackSource?: boolean): Promise<ILavaLyricsObject | null> {
        const params = new URLSearchParams({
            track: encodedTrack,
        });
        if (skipTrackSource !== undefined) {
            params.append("skipTrackSource", String(skipTrackSource));
        }
        const response = await this.node.rest.get(`lyrics?${params.toString()}`);
        return response as ILavaLyricsObject;
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
                // Handle LyricsFoundEvent if needed, e.g., emit to manager
                break;
            case "LyricsNotFoundEvent":
                // Handle LyricsNotFoundEvent if needed, e.g., emit to manager
                break;
        }
    }
}