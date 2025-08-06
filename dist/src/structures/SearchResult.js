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
    albums;
    artists;
    playlists;
    texts;
    lavasearchPluginInfo;
    isLavaSearchResult;
    constructor(req, options) {
        this.query = options.query;
        this.source = options.source || "unknown";
        if (req?.albums || req?.artists || req?.playlists || req?.texts) {
            this.isLavaSearchResult = true;
            this.loadType = "search";
            if (req.tracks) {
                this.tracks = req.tracks.map((data) => new index_1.Track(data, options.requester));
            }
            else {
                this.tracks = [];
            }
            this.albums = req.albums;
            this.artists = req.artists;
            this.playlists = req.playlists;
            this.texts = req.texts;
            this.lavasearchPluginInfo = req.plugin;
            if (this.tracks.length > 0 && !this.albums && !this.artists && !this.playlists && !this.texts) {
                this.loadType = "track";
            }
            else if (this.playlists && this.playlists.length > 0) {
                this.loadType = "playlist";
                this.playlistInfo = this.playlists[0].info;
            }
        }
        else {
            this.isLavaSearchResult = false;
            this.loadType = req.loadType;
            this.tracks = this.resolveTracks(req, options.requester);
        }
        if (req.loadType === "error" || req.loadType === "empty") {
            this.error = req.data;
        }
    }
    resolveTracks(req, requester) {
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
    getFirst() {
        return this.tracks[0];
    }
    getTotalDuration() {
        return this.tracks.reduce((acc, track) => acc + (track.duration || 0), 0);
    }
}
exports.SearchResult = SearchResult;
//# sourceMappingURL=SearchResult.js.map