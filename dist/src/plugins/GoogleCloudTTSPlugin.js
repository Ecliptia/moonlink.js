"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCloudTTSPlugin = void 0;
const AbstractPlugin_1 = require("./AbstractPlugin");
class GoogleCloudTTSPlugin extends AbstractPlugin_1.AbstractPlugin {
    name = "Google Cloud TTS";
    capabilities = ["search:tts"];
    load(node) { }
    unload(node) { }
}
exports.GoogleCloudTTSPlugin = GoogleCloudTTSPlugin;
//# sourceMappingURL=GoogleCloudTTSPlugin.js.map