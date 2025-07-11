"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeState = exports.SearchSources = void 0;
var SearchSources;
(function (SearchSources) {
    SearchSources["YouTube"] = "ytsearch";
    SearchSources["YouTubeMusic"] = "ytmsearch";
    SearchSources["SoundCloud"] = "scsearch";
    SearchSources["Local"] = "local";
})(SearchSources || (exports.SearchSources = SearchSources = {}));
var NodeState;
(function (NodeState) {
    NodeState["CONNECTING"] = "CONNECTING";
    NodeState["CONNECTED"] = "CONNECTED";
    NodeState["READY"] = "READY";
    NodeState["RESUMING"] = "RESUMING";
    NodeState["RESUMED"] = "RESUMED";
    NodeState["DISCONNECTED"] = "DISCONNECTED";
    NodeState["DESTROYED"] = "DESTROYED";
})(NodeState || (exports.NodeState = NodeState = {}));
//# sourceMappingURL=types.js.map