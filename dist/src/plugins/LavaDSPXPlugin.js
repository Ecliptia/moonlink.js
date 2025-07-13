"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LavaDSPXPlugin = void 0;
const AbstractPlugin_1 = require("./AbstractPlugin");
class LavaDSPXPlugin extends AbstractPlugin_1.AbstractPlugin {
    name = "lavadspx-plugin";
    capabilities = ["lavadspx"];
    load(node) {
        node.manager.emit("debug", `Moonlink.js > LavaDSPXPlugin > Loaded for node ${node.identifier}`);
    }
    unload(node) {
        node.manager.emit("debug", `Moonlink.js > LavaDSPXPlugin > Unloaded for node ${node.identifier}`);
    }
}
exports.LavaDSPXPlugin = LavaDSPXPlugin;
//# sourceMappingURL=LavaDSPXPlugin.js.map