"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SponsorBlockPlugin = void 0;
const AbstractPlugin_1 = require("./AbstractPlugin");
class SponsorBlockPlugin extends AbstractPlugin_1.AbstractPlugin {
    name = "sponsorblock-plugin";
    capabilities = [];
    node;
    load(node) {
        this.node = node;
    }
    unload(node) { }
    async getCategories(guildId) {
        return this.node.rest.get(`sessions/${this.node.sessionId}/players/${guildId}/sponsorblock/categories`);
    }
    async setCategories(guildId, categories) {
        await this.node.rest.put(`sessions/${this.node.sessionId}/players/${guildId}/sponsorblock/categories`, categories);
    }
    async deleteCategories(guildId) {
        await this.node.rest.delete(`sessions/${this.node.sessionId}/players/${guildId}/sponsorblock/categories`);
    }
    handleEvent(node, payload) {
        if (!payload.guildId)
            return;
        const player = node.manager.players.get(payload.guildId);
        if (!player)
            return;
        switch (payload.type) {
            case "SegmentsLoaded":
                const segments = payload.segments;
                node.manager.emit("segmentsLoaded", player, segments);
                break;
            case "SegmentSkipped":
                const segment = payload.segment;
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
                const chapters = payload.chapters;
                if (player.current) {
                    player.current.chapters = chapters;
                    player.current.currentChapterIndex = chapters.length > 0 ? 0 : -1;
                }
                node.manager.emit("chaptersLoaded", player, chapters);
                break;
            case "ChapterStarted":
                const chapter = payload.chapter;
                node.manager.emit("chapterStarted", player, chapter);
                break;
        }
    }
}
exports.SponsorBlockPlugin = SponsorBlockPlugin;
//# sourceMappingURL=SponsorBlockPlugin.js.map