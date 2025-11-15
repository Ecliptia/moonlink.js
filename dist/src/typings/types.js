"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadType = exports.NodeState = void 0;
var NodeState;
(function (NodeState) {
    NodeState[NodeState["CONNECTING"] = 0] = "CONNECTING";
    NodeState[NodeState["CONNECTED"] = 1] = "CONNECTED";
    NodeState[NodeState["DISCONNECTED"] = 2] = "DISCONNECTED";
    NodeState[NodeState["DESTROYED"] = 3] = "DESTROYED";
    NodeState[NodeState["READY"] = 4] = "READY";
    NodeState[NodeState["RESUMING"] = 5] = "RESUMING";
})(NodeState || (exports.NodeState = NodeState = {}));
var LoadType;
(function (LoadType) {
    LoadType["TRACK"] = "track";
    LoadType["PLAYLIST"] = "playlist";
    LoadType["SEARCH"] = "search";
    LoadType["EMPTY"] = "empty";
    LoadType["ERROR"] = "error";
})(LoadType || (exports.LoadType = LoadType = {}));
//# sourceMappingURL=types.js.map