"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deezer = void 0;
const MoonlinkTrack_1 = require("../@Rest/MoonlinkTrack");
const MakeRequest_1 = require("../@Rest/MakeRequest");
class Deezer {
    manager;
    constructor(options, others) {
        this.manager = options;
    }
    check(uri) {
        return /^(?:https?:\/\/|)?(?:www\.)?deezer\.com\/(?:\w{2}\/)?(track|album|playlist|artist)\/(\d+)/.test(uri);
    }
    async request(endpoint) {
        let res = await (0, MakeRequest_1.makeRequest)(`http://api.deezer.com${/^\//.test(endpoint) ? endpoint : `/${endpoint}`}`, {
            method: "GET",
            headers: {
                "User-Agent": "MoonQuest/Requester",
            },
        }).catch((err) => {
            this.manager.emit("debug", "[ @Moonlink/Deezer ]: unable to request Deezer " + err);
        });
        return res;
    }
    async resolve(url) {
        const [, type, id] = /^(?:https?:\/\/|)?(?:www\.)?deezer\.com\/(?:\w{2}\/)?(track|album|playlist|artist)\/(\d+)/.exec(url) ?? [];
        switch (type) {
            case "playlist": {
                return this.fetchPlaylist(id);
            }
            case "track": {
                return this.fetchTrack(id);
            }
            case "album": {
                return this.fetchAlbum(id);
            }
            case "artist": {
                return this.fetchArtist(id);
            }
        }
    }
    async fetchPlaylist(id) {
        const playlist = await this.request(`/playlist/${id}`);
        const unresolvedPlaylistTracks = await Promise.all(playlist.tracks.data.map((x) => this.buildUnresolved(x)));
        return {
            loadType: "PLAYLIST_LOADED",
            tracks: unresolvedPlaylistTracks,
            playlistInfo: playlist.title ? { name: playlist.title } : {},
        };
    }
    async fetchAlbum(id) {
        const album = await this.request(`/albums/${id}`);
        const unresolvedPlaylistTracks = await Promise.all(album.track.data.map((x) => this.buildUnresolved(x)));
        return {
            loadType: "PLAYLIST_LOADED",
            tracks: unresolvedPlaylistTracks,
            playlistInfo: album.name ? { name: album.name } : {},
        };
    }
    async fetchArtist(id) {
        const artist = await this.request(`/artist/${id}/top`);
        let nextPage = artist.next;
        let pageLoaded = 1;
        while (nextPage) {
            if (!nextPage)
                break;
            const req = await (0, MakeRequest_1.makeRequest)(nextPage, { method: "GET" });
            artist.data.push(...req.data);
            nextPage = req.next;
            pageLoaded++;
        }
        const unresolvedPlaylistTracks = await Promise.all(artist.data.map((x) => this.buildUnresolved(x)));
        return {
            loadType: "PLAYLIST_LOADED",
            tracks: unresolvedPlaylistTracks,
            playlistInfo: artist.name ? { name: artist.name } : {},
        };
    }
    async fetchTrack(id) {
        const data = await this.request(`/tracks/${id}`);
        const unresolvedTrack = await this.buildUnresolved(data);
        return {
            loadType: "TRACK_LOADED",
            tracks: [unresolvedTrack],
            playlistInfo: {},
        };
    }
    async fetch(query) {
        if (this.check(query))
            return this.resolve(query);
        const data = await this.request(`/search?q="${query}"`);
        const unresolvedTracks = await Promise.all(data.tracks.items.map((x) => this.buildUnresolved(x)));
        return {
            loadType: "TRACK_LOADED",
            tracks: unresolvedTracks,
            playlistInfo: {},
        };
    }
    async buildUnresolved(track) {
        let res = await this.manager.search(`${track.artist ? track.artist.name : "Unknown"} ${track.title}`);
        let enTrack;
        res.tracks[0].encodedTrack
            ? (enTrack = res.tracks[0].encodedTrack)
            : res.tracks[0].encoded
                ? (enTrack = res.tracks[0].encoded)
                : (enTrack = res.tracks[0].track);
        return new MoonlinkTrack_1.MoonlinkTrack({
            track: enTrack,
            encoded: null,
            trackEncoded: null,
            info: {
                sourceName: "deezer",
                identifier: track.id,
                isSeekable: true,
                author: track.artist ? track.artist.name : "Unknown",
                length: res.tracks[0].duration,
                isStream: false,
                title: track.title,
                uri: track.link,
                position: 0,
            },
        });
    }
}
exports.Deezer = Deezer;
//# sourceMappingURL=Deezer.js.map