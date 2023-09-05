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
exports.version = "2.10.91";
__exportStar(require("./src/@Moonlink/MoonlinkManager"), exports);
__exportStar(require("./src/@Moonlink/MoonlinkWebsocket"), exports);
__exportStar(require("./src/@Moonlink/MoonlinkPlayers"), exports);
__exportStar(require("./src/@Moonlink/MoonlinkNodes"), exports);
__exportStar(require("./src/@Moonlink/MoonlinkRest"), exports);
__exportStar(require("./src/@Rest/MoonlinkQueue"), exports);
__exportStar(require("./src/@Rest/MoonlinkFilters"), exports);
__exportStar(require("./src/@Rest/MoonlinkTrack"), exports);
__exportStar(require("./src/@Rest/MoonlinkDatabase"), exports);
__exportStar(require("./src/@Rest/MakeRequest"), exports);
__exportStar(require("./src/@Rest/Plugin"), exports);
__exportStar(require("./src/@Sources/Spotify"), exports);
__exportStar(require("./src/@Sources/Deezer"), exports);
//# sourceMappingURL=index.js.map