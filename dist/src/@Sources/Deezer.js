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
            loadType: "playlist",
            data: unresolvedPlaylistTracks,
            playlistInfo: playlist.title ? { name: playlist.title } : {},
        };
    }
    async fetchAlbum(id) {
        const album = await this.request(`/albums/${id}`);
        const unresolvedPlaylistTracks = await Promise.all(album.track.data.map((x) => this.buildUnresolved(x)));
        return {
            loadType: "playlist",
            data: unresolvedPlaylistTracks,
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
            loadType: "playlist",
            data: unresolvedPlaylistTracks,
            playlistInfo: artist.name ? { name: artist.name } : {},
        };
    }
    async fetchTrack(id) {
        const data = await this.request(`/tracks/${id}`);
        const unresolvedTrack = await this.buildUnresolved(data);
        return {
            loadType: "track",
            data: [unresolvedTrack],
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
            data: unresolvedTracks,
            playlistInfo: {},
        };
    }
    async buildUnresolved(track) {
        let res = await this.manager.search(`${track.artist ? track.artist.name : "Unknown"} ${track.title}`);
        return new MoonlinkTrack_1.MoonlinkTrack({
            encoded: res.data[0].encoded,
            info: {
                sourceName: "deezer",
                identifier: track.id,
                isSeekable: true,
                author: track.artist ? track.artist.name : "Unknown",
                artworkUrl: track.md5_image,
                length: res.data[0].duration,
                isStream: false,
                title: track.title,
                uri: track.link,
                position: 0,
                isrc: res.data[0].isrc,
            },
        });
    }
}
exports.Deezer = Deezer;
//# sourceMappingURL=Deezer.js.map