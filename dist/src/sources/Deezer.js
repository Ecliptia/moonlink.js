"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const crypto_1 = require("crypto");
const index_1 = require("../../index");
class Deezer {
    name = 'Deezer';
    manager;
    licenseToken = null;
    checkForm = null;
    cookie = null;
    constructor(manager) {
        this.manager = manager;
        this.manager.emit('debug', 'Moonlink.js > Deezer > Source loaded');
        this.init();
    }
    match(query) {
        const shortLink = /^(?:https?:\/\/)?dzr\.page\.link\/[\w-]+$/;
        return (query.startsWith('dzsearch:') ||
            /(?:https?:\/\/)?(?:www\.)?deezer\.com\/(?:[a-z]{2}\/)?(track|album|playlist|artist)\/\d+/.test(query) ||
            shortLink.test(query));
    }
    async init() {
        if (this.licenseToken && this.checkForm)
            return;
        try {
            const token = (0, crypto_1.randomBytes)(12).toString('base64').replace(/[+/=]/g, '').slice(0, 16);
            const url = `https://www.deezer.com/ajax/gw-light.php?method=deezer.getUserData&input=3&api_version=1.0&api_token=${token}`;
            const resp = await fetch(url, { redirect: 'follow' });
            if (!resp.ok) {
                this.manager.emit('debug', `Deezer API request failed: ${resp.status}`);
                return;
            }
            const data = await resp.json();
            this.licenseToken = data.results.USER.OPTIONS.license_token;
            this.checkForm = data.results.checkForm;
            this.cookie = resp.headers.get('set-cookie');
        }
        catch (e) {
            this.manager.emit('debug', `Error initializing Deezer: ${e.message}`);
        }
    }
    async apiRequest(path) {
        await this.init();
        try {
            const url = path.startsWith('http') ? path : `https://api.deezer.com${path}`;
            const headers = this.cookie ? { Cookie: this.cookie } : {};
            const resp = await fetch(url, { headers, redirect: 'follow' });
            if (!resp.ok) {
                this.manager.emit('debug', `Deezer API request failed: ${resp.status}`);
                return null;
            }
            return resp.json();
        }
        catch (e) {
            this.manager.emit('debug', `Error in Deezer apiRequest: ${e.message}`);
            return null;
        }
    }
    async search(query, options) {
        const q = query.startsWith('dzsearch:') ? query.slice(9).trim() : query;
        const limit = options?.limit ?? this.manager.options.deezer?.maxSearchResults ?? 20;
        const params = new url_1.URLSearchParams({ q, limit: String(limit) });
        const data = await this.apiRequest(`/search?${params}`);
        if (!data?.data?.length)
            return { loadType: 'empty', data: {} };
        const tracks = data.data.map((t) => this.buildTrack(t));
        return { loadType: 'search', data: tracks };
    }
    async load(query, options) {
        const shortLink = /^(?:https?:\/\/)?dzr\.page\.link\/[\w-]+$/;
        if (shortLink.test(query)) {
            const urlToFetch = query.startsWith('http') ? query : `https://${query}`;
            const resp = await fetch(urlToFetch, { redirect: 'follow' });
            query = resp.url;
        }
        const m = /(?:https?:\/\/(?:www\.)?deezer\.com\/(?:[a-z]{2}\/)?(track|album|playlist|artist)\/(\d+))/.exec(query);
        if (!m)
            return { loadType: 'error', data: { message: 'Invalid Deezer URL' } };
        const [, type, id] = m;
        if (type === 'track') {
            const data = await this.apiRequest(`/track/${id}`);
            return { loadType: 'track', data: this.buildTrack(data) };
        }
        if (type === 'artist') {
            const artist = await this.apiRequest(`/artist/${id}`);
            const limit = options?.limit ?? this.manager.options.deezer?.maxArtistTracks ?? 20;
            const top = await this.apiRequest(`/artist/${id}/top?limit=${limit}`);
            const tracks = top.data.map((t) => this.buildTrack(t));
            return { loadType: 'playlist', data: { info: { name: artist.name, selectedTrack: 0 }, tracks } };
        }
        const path = type === 'album' ? `/album/${id}` : `/playlist/${id}`;
        const col = await this.apiRequest(path);
        const items = col.tracks.data;
        const limitKey = type === 'album' ? 'maxAlbumTracks' : 'maxPlaylistTracks';
        const limit = options?.limit ?? this.manager.options.deezer?.[limitKey] ?? this.manager.options.playlistLoadLimit;
        const slice = typeof limit === 'number'
            ? items.slice(0, limit)
            : items;
        const tracks = slice.map((t) => this.buildTrack(t));
        return { loadType: 'playlist', data: { info: { name: col.title, selectedTrack: 0 }, tracks } };
    }
    buildTrack(item) {
        const info = {
            identifier: String(item.id),
            uri: item.link,
            title: item.title,
            author: item.artist?.name,
            length: (item.duration ?? item.track?.duration) * 1000,
            isSeekable: true,
            isStream: false,
            isrc: item.isrc,
            artworkUrl: item.album?.cover_xl || item.album?.cover_big,
            sourceName: this.name,
            position: 0,
        };
        return { info, encoded: (0, index_1.encodeTrack)(info), pluginInfo: { MoonlinkInternal: true } };
    }
    resolve(query) {
        return this.load(query);
    }
}
exports.default = Deezer;
//# sourceMappingURL=Deezer.js.map