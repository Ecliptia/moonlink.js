"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeezerSource = void 0;
const node_http_1 = __importDefault(require("node:http"));
const node_https_1 = __importDefault(require("node:https"));
const node_url_1 = require("node:url");
const Util_1 = require("../Util");
class DeezerSource {
    name = "Deezer";
    manager;
    constructor(manager) {
        this.manager = manager;
        this.manager.options.deezer = this.manager.options?.deezer ?? {};
        this.manager.emit("debug", "Moonlink.js > Deezer > Source loaded");
    }
    get options() {
        return this.manager.options.deezer ?? {};
    }
    match(query) {
        const shortLink = /^(?:https?:\/\/)?dzr\.page\.link\/[\w-]+$/;
        return (query.startsWith("dzsearch:") ||
            /(?:https?:\/\/)?(?:www\.)?deezer\.com\/(?:[a-z]{2}\/)?(track|album|playlist|artist)\/\d+/.test(query) ||
            shortLink.test(query));
    }
    async resolveShortLink(url) {
        let current = url.startsWith("http") ? url : `https://${url}`;
        for (let i = 0; i < 5; i++) {
            const target = new node_url_1.URL(current);
            const transport = target.protocol === "https:" ? node_https_1.default : node_http_1.default;
            const next = await new Promise((resolve, reject) => {
                const req = transport.request({
                    method: "GET",
                    hostname: target.hostname,
                    port: target.port || (target.protocol === "https:" ? 443 : 80),
                    path: target.pathname + target.search,
                    headers: { "User-Agent": "Moonlink.js" },
                }, (res) => {
                    const statusCode = res.statusCode ?? 0;
                    const location = res.headers.location;
                    res.resume();
                    if (statusCode >= 300 && statusCode < 400 && location) {
                        resolve(new node_url_1.URL(location, current).href);
                        return;
                    }
                    resolve(current);
                });
                req.on("error", reject);
                req.end();
            }).catch((error) => {
                this.manager.emit("debug", `Moonlink.js > Deezer > Short link resolve failed: ${error.message}`);
                return null;
            });
            if (!next)
                return null;
            if (next === current)
                return current;
            current = next;
        }
        return current;
    }
    async apiRequest(path) {
        const url = path.startsWith("http") ? path : `https://api.deezer.com${path}`;
        const res = await (0, Util_1.makeRequest)(url, { method: "GET" });
        if (!res) {
            this.manager.emit("debug", "Moonlink.js > Deezer > API request failed.");
            return null;
        }
        return res;
    }
    async search(query, options) {
        const q = query.startsWith("dzsearch:") ? query.slice(9).trim() : query;
        const limit = options?.limit ?? this.options.maxSearchResults ?? 20;
        const params = new node_url_1.URLSearchParams({ q, limit: String(limit) });
        const data = await this.apiRequest(`/search?${params}`);
        if (!data?.data?.length)
            return { loadType: "empty", data: {} };
        const tracks = data.data.map((t) => this.buildTrack(t));
        return { loadType: "search", data: tracks };
    }
    async load(query, options) {
        const shortLink = /^(?:https?:\/\/)?dzr\.page\.link\/[\w-]+$/;
        if (shortLink.test(query)) {
            const resolved = await this.resolveShortLink(query);
            if (resolved)
                query = resolved;
        }
        const m = /(?:https?:\/\/(?:www\.)?deezer\.com\/(?:[a-z]{2}\/)?(track|album|playlist|artist)\/(\d+))/.exec(query);
        if (!m)
            return { loadType: "error", data: { message: "Invalid Deezer URL" } };
        const [, type, id] = m;
        if (type === "track") {
            const data = await this.apiRequest(`/track/${id}`);
            if (!data)
                return { loadType: "error", data: { message: "Track not found." } };
            return { loadType: "track", data: this.buildTrack(data) };
        }
        if (type === "artist") {
            const artist = await this.apiRequest(`/artist/${id}`);
            const limit = options?.limit ?? this.options.maxArtistTracks ?? 20;
            const top = await this.apiRequest(`/artist/${id}/top?limit=${limit}`);
            if (!artist || !top?.data) {
                return { loadType: "error", data: { message: "Artist not found." } };
            }
            const tracks = top.data.map((t) => this.buildTrack(t));
            return {
                loadType: "playlist",
                data: { info: { name: artist.name, selectedTrack: 0 }, tracks },
            };
        }
        const path = type === "album" ? `/album/${id}` : `/playlist/${id}`;
        const col = await this.apiRequest(path);
        if (!col?.tracks?.data) {
            return { loadType: "error", data: { message: `${type} not found.` } };
        }
        const items = col.tracks.data;
        const limitKey = type === "album" ? "maxAlbumTracks" : "maxPlaylistTracks";
        const limit = options?.limit ??
            this.options[limitKey] ??
            this.manager.options.search?.playlistLoadLimit;
        const slice = typeof limit === "number" ? items.slice(0, limit) : items;
        const tracks = slice.map((t) => this.buildTrack(t));
        return { loadType: "playlist", data: { info: { name: col.title, selectedTrack: 0 }, tracks } };
    }
    buildTrack(item) {
        const info = {
            identifier: String(item.id),
            uri: item.link,
            title: item.title,
            author: item.artist?.name ?? "Unknown",
            length: (item.duration ?? item.track?.duration ?? 0) * 1000,
            isSeekable: true,
            isStream: false,
            isrc: item.isrc ?? null,
            artworkUrl: item.album?.cover_xl || item.album?.cover_big || null,
            sourceName: "deezer",
            position: 0,
        };
        return {
            info,
            encoded: (0, Util_1.encodeTrack)(info),
            pluginInfo: { MoonlinkInternal: true, needsStream: true },
            userData: {},
        };
    }
    resolve(query) {
        return this.load(query);
    }
}
exports.DeezerSource = DeezerSource;
//# sourceMappingURL=deezer.js.map