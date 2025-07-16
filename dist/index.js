"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = void 0;
exports.version = require("../package.json").version;
__exportStar(require("./src/typings/Interfaces"), exports);
__exportStar(require("./src/typings/types"), exports);
__exportStar(require("./src/Utils"), exports);
__exportStar(require("./src/core/Manager"), exports);
__exportStar(require("./src/management/NodeManager"), exports);
__exportStar(require("./src/management/PlayerManager"), exports);
__exportStar(require("./src/management/PluginManager"), exports);
__exportStar(require("./src/management/SourceManager"), exports);
__exportStar(require("./src/structures/SearchResult"), exports);
__exportStar(require("./src/management/DatabaseManager"), exports);
__exportStar(require("./src/database/AbstractDatabase"), exports);
__exportStar(require("./src/entities/Filters"), exports);
__exportStar(require("./src/entities/Player"), exports);
__exportStar(require("./src/entities/Node"), exports);
__exportStar(require("./src/entities/Rest"), exports);
__exportStar(require("./src/entities/Track"), exports);
__exportStar(require("./src/entities/Queue"), exports);
__exportStar(require("./src/entities/Listen"), exports);
__exportStar(require("./src/entities/Lyrics"), exports);
const Utils_1 = require("./src/Utils");
[["DatabaseManager", "./src/management/DatabaseManager"], ["NodeManager", "./src/management/NodeManager"], ["PlayerManager", "./src/management/PlayerManager"], ["PluginManager", "./src/management/PluginManager"], ["SearchResult", "./src/structures/SearchResult"],
    ["Player", "./src/entities/Player"], ["Queue", "./src/entities/Queue"], ["Node", "./src/entities/Node"],
    ["Rest", "./src/entities/Rest"], ["Filters", "./src/entities/Filters"], ["Track", "./src/entities/Track"],
    ["Lyrics", "./src/entities/Lyrics"], ["Listen", "./src/entities/Listen"], ["SourceManager", "./src/management/SourceManager"]].map(([n, p]) => Utils_1.structures[n] = require(p)[n]);
//# sourceMappingURL=index.js.map