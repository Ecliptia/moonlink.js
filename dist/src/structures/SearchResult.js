"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchResult = void 0;
const types_1 = require("../typings/types");
const Track_1 = require("../entities/Track");
class SearchResult {
    loadType;
    tracks;
    playlistInfo;
    exception;
    constructor(response, requester, playlistLoadLimit) {
        switch (response.loadType) {
            case "track":
                this.loadType = types_1.LoadType.TRACK;
                this.tracks = [new Track_1.Track(response.data, requester)];
                break;
            case "playlist":
                this.loadType = types_1.LoadType.PLAYLIST;
                this.tracks = response.data.tracks
                    .slice(0, playlistLoadLimit)
                    .map(track => new Track_1.Track(track, requester));
                this.playlistInfo = {
                    duration: response.data.tracks.reduce((acc, cur) => acc + (cur.info.length || 0), 0),
                    name: response.data.info.name,
                    selectedTrack: response.data.info.selectedTrack
                };
                break;
            case "search":
                this.loadType = types_1.LoadType.SEARCH;
                this.tracks = response.data.map(track => new Track_1.Track(track, requester));
                break;
            case "empty":
                this.loadType = types_1.LoadType.EMPTY;
                this.tracks = [];
                break;
            case "error":
                this.loadType = types_1.LoadType.ERROR;
                this.tracks = [];
                this.exception = response.data;
                break;
            default:
                this.loadType = types_1.LoadType.EMPTY;
                this.tracks = [];
                break;
        }
    }
    get isPlaylist() {
        return this.loadType === types_1.LoadType.PLAYLIST;
    }
    get isTrack() {
        return this.loadType === types_1.LoadType.TRACK;
    }
    get isSearch() {
        return this.loadType === types_1.LoadType.SEARCH;
    }
    get isEmpty() {
        return this.loadType === types_1.LoadType.EMPTY;
    }
    get isError() {
        return this.loadType === types_1.LoadType.ERROR;
    }
}
exports.SearchResult = SearchResult;
//# sourceMappingURL=SearchResult.js.map