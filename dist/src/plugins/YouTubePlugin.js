"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubePlugin = void 0;
const AbstractPlugin_1 = require("./AbstractPlugin");
class YouTubePlugin extends AbstractPlugin_1.AbstractPlugin {
    name = "youtube-plugin";
    capabilities = ["search:youtube", "search:ytsearch", "search:ytmsearch"];
    load(node) { }
    unload(node) { }
}
exports.YouTubePlugin = YouTubePlugin;
//# sourceMappingURL=YouTubePlugin.js.map