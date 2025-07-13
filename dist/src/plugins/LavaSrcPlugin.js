"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LavaSrcPlugin = void 0;
const AbstractPlugin_1 = require("./AbstractPlugin");
class LavaSrcPlugin extends AbstractPlugin_1.AbstractPlugin {
    name = "lavasrc-plugin";
    capabilities = [
        "search:spotify",
        "search:sprec",
        "search:applemusic",
        "search:deezer",
        "search:dzrec",
        "search:yandexmusic",
        "search:ymrec",
        "search:flowerytts",
        "search:ytseach",
        "search:vkmusic",
        "search:vkrec",
        "search:tidal",
        "search:tdrec",
        "search:qobuz",
        "search:qbrec",
        "search:ytdlp",
    ];
    load(node) { }
    unload(node) { }
    onNodeInfoUpdate(node) {
        node.manager.emit("debug", `Moonlink.js > LavaSrcPlugin > Node info updated for node: ${node.identifier}`);
    }
}
exports.LavaSrcPlugin = LavaSrcPlugin;
//# sourceMappingURL=LavaSrcPlugin.js.map