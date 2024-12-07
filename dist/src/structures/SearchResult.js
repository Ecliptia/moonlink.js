"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchResult = void 0;
const index_1 = require("../../index");
class SearchResult {
    query;
    source;
    tracks;
    loadType;
    playlistInfo;
    error;
    constructor(req, options) {
        this.query = options.query;
        this.source = options.source || "unknown";
        this.loadType = req.loadType;
        this.tracks = this.resolveTracks(req, options.requester);
    }
    resolveTracks(req, requester) {
        if (req.loadType === "error" || req.loadType === "empty") {
            this.error = req.data;
            return [];
        }
        let rawTracks = [];
        switch (req.loadType) {
            case "track":
            case "short":
                rawTracks = [req.data];
                break;
            case "search":
                rawTracks = req.data;
                break;
            case "playlist":
                rawTracks = req.data.tracks;
                this.playlistInfo = {
                    duration: req.data.tracks.reduce((acc, cur) => acc + cur.info.length, 0),
                    name: req.data.info.name,
                    selectedTrack: req.data.info.selectedTrack,
                };
                break;
        }
        return rawTracks.map((data) => new index_1.Track(data, requester));
    }
}
exports.SearchResult = SearchResult;
//# sourceMappingURL=SearchResult.js.map