"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkybotPlugin = void 0;
const AbstractPlugin_1 = require("./AbstractPlugin");
class SkybotPlugin extends AbstractPlugin_1.AbstractPlugin {
    name = "DuncteBot-plugin";
    capabilities = [
        "search:pornhub",
        "search:speak",
        "direct:mixcloud",
        "direct:ocremix",
        "direct:clypit",
        "direct:reddit",
        "direct:getyarn",
        "direct:tiktok",
        "direct:soundgasm",
        "direct:pixeldrain",
        "direct:streamdeck"
    ];
    load(node) { }
    unload(node) { }
}
exports.SkybotPlugin = SkybotPlugin;
//# sourceMappingURL=SkybotPlugin.js.map