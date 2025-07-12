"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubePlugin = void 0;
const AbstractPlugin_1 = require("./AbstractPlugin");
class YouTubePlugin extends AbstractPlugin_1.AbstractPlugin {
    name = "youtube-plugin";
    capabilities = ["search:youtube"];
    load(node) {
        node.manager.emit("debug", `Moonlink.js > YouTubePlugin > Loaded for node: ${node.identifier}`);
    }
    unload(node) {
        node.manager.emit("debug", `Moonlink.js > YouTubePlugin > Unloaded for node: ${node.identifier}`);
    }
}
exports.YouTubePlugin = YouTubePlugin;
//# sourceMappingURL=YouTubePlugin.js.map