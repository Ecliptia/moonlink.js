"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deezer = void 0;
const index_1 = require("../../index");
class Deezer {
    manager;
    constructor(options) {
        this.manager = options;
    }
    check(uri) {
        const deezerRegex = /^(?:https?:\/\/|)?(?:www\.)?deezer\.com\/(?:\w{2}\/)?(track|album|playlist|artist)\/(\d+)/;
        return deezerRegex.test(uri);
    }
    async request(endpoint) {
        try {
            const url = `https://api.deezer.com${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
            const headers = {
                method: "GET",
                headers: {
                    "User-Agent": "Moonlink/2.0",
                },
            };
            const res = await (0, index_1.makeRequest)(url, headers);
            return res;
        }
        catch (err) {
            this.manager.emit("debug", "[ @Moonlink/Deezer ]: unable to request Deezer " + err);
            throw err;
        }
    }
    async resolve(url) {
        const [, type, id] = url.match(/(?:https?:\/\/|)?(?:www\.)?deezer\.com\/(?:\w{2}\/)?(track|album|playlist|artist)\/(\d+)/) || [];
        switch (type) {
            case "playlist":
                return await this.fetchPlaylist(id);
            case "track":
                return this.fetchTrack(id);
            case "album":
                return this.fetchAlbum(id);
            case "artist":
                return this.fetchArtist(id);
        }
    }
    async fetchPlaylist(id) {
        const playlist = await this.request(`/playlist/${id}`);
        const unresolvedPlaylistTracks = await Promise.all(playlist.tracks.data.map((x) => this.buildUnresolved(x)));
        return {
            loadType: "playlist",
            tracks: unresolvedPlaylistTracks,
            playlistInfo: playlist.title ? { name: playlist.title } : {},
        };
    }
    async fetchAlbum(id) {
        const album = await this.request(`/album/${id}`);
        const unresolvedAlbumTracks = await Promise.all(album.tracks.data.map((x) => this.buildUnresolved(x)));
        return {
            loadType: "playlist",
            tracks: unresolvedAlbumTracks,
            playlistInfo: album.title ? { name: album.title } : {},
        };
    }
    async fetchArtist(id) {
        const artist = await this.request(`/artist/${id}/top?limit=50`);
        let nextPage = artist.next;
        let pageLoaded = 1;
        while (nextPage) {
            if (!nextPage)
                break;
            const req = await (0, index_1.makeRequest)(nextPage, { method: "GET" });
            artist.data.push(...req.data);
            nextPage = req.next;
            pageLoaded++;
        }
        const unresolvedArtistTracks = await Promise.all(artist.data.map((x) => this.buildUnresolved(x)));
        return {
            loadType: "playlist",
            tracks: unresolvedArtistTracks,
            playlistInfo: artist.name ? { name: artist.name } : {},
        };
    }
    async fetchTrack(id) {
        const data = await this.request(`/track/${id}`);
        const unresolvedTrack = await this.buildUnresolved(data);
        return {
            loadType: "track",
            tracks: [unresolvedTrack],
            playlistInfo: {},
        };
    }
    async fetch(query) {
        if (this.check(query))
            return this.resolve(query);
        const data = await this.request(`/search?q="${query}"`);
        const unresolvedTracks = await Promise.all(data.data.map((x) => this.buildUnresolved(x)));
        return {
            loadType: "track",
            tracks: [unresolvedTracks],
            playlistInfo: {},
        };
    }
    async buildUnresolved(track) {
        let res = await this.manager.search(`${track.artist ? track.artist.name : "Unknown"} ${track.title}`);
        return new index_1.MoonlinkTrack({
            encoded: res.tracks[0].encoded,
            info: {
                sourceName: "deezer",
                identifier: track.id,
                isSeekable: true,
                author: track.artist ? track.artist.name : "Unknown",
                artworkUrl: res.tracks[0].artworkUrl,
                length: res.tracks[0].duration,
                isStream: false,
                title: track.title,
                uri: track.link,
                position: 0,
                isrc: track.isrc,
            },
        });
    }
}
exports.Deezer = Deezer;
//# sourceMappingURL=Deezer.js.map