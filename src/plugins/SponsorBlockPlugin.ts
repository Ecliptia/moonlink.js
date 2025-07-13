import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";
import { IChapter, ISegment } from "../typings/Interfaces";

export class SponsorBlockPlugin extends AbstractPlugin {
    public name: string = "sponsorblock-plugin";
    public capabilities: string[] = []
    public node: Node;

    public load(node: Node): void {
        this.node = node;
    }

    public unload(node: Node): void {}

    public async getCategories(guildId: string): Promise<string[]> {
        return this.node.rest.get(`sessions/${this.node.sessionId}/players/${guildId}/sponsorblock/categories`) as Promise<string[]>;
    }

    public async setCategories(guildId: string, categories: string[]): Promise<void> {
        await this.node.rest.put(`sessions/${this.node.sessionId}/players/${guildId}/sponsorblock/categories`, categories);
    }

    public async deleteCategories(guildId: string): Promise<void> {
        await this.node.rest.delete(`sessions/${this.node.sessionId}/players/${guildId}/sponsorblock/categories`);
    }

    public handleEvent(node: Node, payload: any): void {
        if (!payload.guildId) return;

        const player = node.manager.players.get(payload.guildId);
        if (!player) return;

        switch (payload.type) {
            case "SegmentsLoaded":
                const segments = payload.segments as ISegment[];
                node.manager.emit("segmentsLoaded", player, segments);
                break;
            case "SegmentSkipped":
                const segment = payload.segment as ISegment;
                node.manager.emit("segmentSkipped", player, segment);

                const defaultCategories = node.manager.options.defaultSponsorBlockCategories;

                if (defaultCategories && Array.isArray(defaultCategories) && !defaultCategories.includes(segment.category)) {
                    if (player && player.current && player.current.position < segment.end) {
                        player.seek(segment.end);
                        node.manager.emit("debug", `Moonlink.js > SponsorBlockPlugin > Client-side seek to ${segment.end}ms for segment category ${segment.category} (not in default categories).`);
                    }
                }
                break;
            case "ChaptersLoaded":
                const chapters = payload.chapters as IChapter[];
                if (player.current) {
                    player.current.chapters = chapters;
                    player.current.currentChapterIndex = chapters.length > 0 ? 0 : -1;
                }
                node.manager.emit("chaptersLoaded", player, chapters);
                break;
            case "ChapterStarted":
                const chapter = payload.chapter as IChapter;
                node.manager.emit("chapterStarted", player, chapter);
                break;
        }
    }
}
