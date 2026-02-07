"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifySource = void 0;
const Util_1 = require("../Util");
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
const TOKEN_REFRESH_MARGIN = 60_000;
class SpotifySource {
    name = "Spotify";
    manager;
    accessToken = null;
    accessTokenExpiresAt = null;
    tokenInitialized = false;
    constructor(manager) {
        this.manager = manager;
        this.manager.options.spotify = this.manager.options?.spotify ?? {};
        this.manager.emit("debug", "Moonlink.js > Spotify > Source loaded");
    }
    get options() {
        return this.manager.options.spotify ?? {};
    }
    match(query) {
        return (query.includes("spotify.com") ||
            query.startsWith("spotify:") ||
            query.startsWith("spsearch:") ||
            query.startsWith("sprec:"));
    }
    isTokenValid(token, expiresAt) {
        if (!token)
            return false;
        if (!expiresAt)
            return true;
        return Date.now() < expiresAt - TOKEN_REFRESH_MARGIN;
    }
    setAccessToken(token, expiresInMs) {
        this.accessToken = token;
        if (expiresInMs) {
            this.accessTokenExpiresAt = Date.now() + expiresInMs;
        }
    }
    getActiveToken() {
        if (this.isTokenValid(this.accessToken, this.accessTokenExpiresAt)) {
            return this.accessToken;
        }
        return null;
    }
    async fetchOfficialToken() {
        const { clientId, clientSecret } = this.options;
        if (!clientId || !clientSecret)
            return false;
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
        const tokenData = await (0, Util_1.makeRequest)("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });
        if (!tokenData?.access_token) {
            this.manager.emit("debug", "Moonlink.js > Spotify > Failed to refresh official token.");
            return false;
        }
        this.setAccessToken(tokenData.access_token, tokenData.expires_in * 1000);
        return true;
    }
    async ensureTokens() {
        if (this.tokenInitialized && this.getActiveToken())
            return true;
        if (this.options.accessToken) {
            this.setAccessToken(this.options.accessToken, this.options.accessTokenExpiresAt ?? null);
            this.tokenInitialized = true;
            return true;
        }
        const success = await this.fetchOfficialToken();
        this.tokenInitialized = success;
        return success;
    }
    async apiRequest(path) {
        const ok = await this.ensureTokens();
        if (!ok) {
            this.manager.emit("debug", "Moonlink.js > Spotify > Tokens not available.");
            return null;
        }
        const token = this.getActiveToken();
        if (!token)
            return null;
        const url = path.startsWith("http") ? path : `${SPOTIFY_API_BASE_URL}${path}`;
        const res = await (0, Util_1.makeRequest)(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
        if (!res) {
            this.tokenInitialized = false;
            return null;
        }
        return res;
    }
    buildTrack(item, uri) {
        const trackUri = uri ?? item.uri ?? `https://open.spotify.com/track/${item.id}`;
        const info = {
            identifier: item.id ?? "local",
            uri: trackUri,
            title: item.name ?? "Unknown Title",
            author: item.artists?.map((a) => a.name).join(", ") ?? "Unknown Artist",
            length: item.duration_ms ?? 0,
            isSeekable: true,
            isStream: false,
            artworkUrl: item.album?.images?.[0]?.url ?? null,
            sourceName: "spotify",
            position: 0,
            isrc: item.external_ids?.isrc ?? null,
        };
        return {
            info,
            encoded: (0, Util_1.encodeTrack)(info),
            pluginInfo: { MoonlinkInternal: true, needsStream: true },
            userData: {},
        };
    }
    async search(query, options) {
        const limit = options?.limit ?? this.options.limitLoadSearch ?? 20;
        const data = await this.apiRequest(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=${this.options.market ?? "US"}`);
        if (!data || data.error) {
            this.manager.emit("debug", `Moonlink.js > Spotify > Search failed.`);
            return { loadType: "error", data: { message: "Search failed on Spotify." } };
        }
        if (!data.tracks?.items?.length) {
            return { loadType: "empty", data: {} };
        }
        return {
            loadType: "search",
            data: data.tracks.items.map((t) => this.buildTrack(t)),
        };
    }
    async load(rawUrl, options) {
        const normalized = rawUrl
            .replace(/open\.spotify\.com\/intl-[^/]+\//, "open.spotify.com/")
            .split("?")[0];
        if (normalized.startsWith("spsearch:")) {
            return this.search(normalized.slice(9).trim());
        }
        if (normalized.startsWith("sprec:")) {
            return { loadType: "error", data: { message: "Spotify recommendations are disabled." } };
        }
        const link = this.getLinkType(normalized);
        if (!link) {
            return { loadType: "error", data: { message: "Invalid Spotify URL" } };
        }
        switch (link.type) {
            case "track": {
                const data = await this.apiRequest(`/tracks/${link.id}`);
                if (!data || data.error) {
                    return { loadType: "error", data: { message: "Track not found." } };
                }
                return { loadType: "track", data: this.buildTrack(data, normalized) };
            }
            case "artist": {
                const artistInfo = await this.apiRequest(`/artists/${link.id}`);
                const topTracks = await this.apiRequest(`/artists/${link.id}/top-tracks?market=${this.options.market ?? "US"}`);
                if (!artistInfo || !topTracks?.tracks) {
                    return { loadType: "error", data: { message: "Artist not found." } };
                }
                let tracks = topTracks.tracks.map((t) => this.buildTrack(t));
                const max = options?.limit ?? this.options.limitLoadArtist;
                if (max != null)
                    tracks = tracks.slice(0, max);
                return {
                    loadType: "playlist",
                    data: {
                        info: { name: `${artistInfo.name}'s Top Tracks`, selectedTrack: 0 },
                        tracks,
                    },
                };
            }
            case "album":
            case "playlist": {
                const base = link.type === "album" ? "albums" : "playlists";
                const pageLimit = link.type === "playlist"
                    ? this.options.limitLoadPlaylistPage ?? 100
                    : this.options.limitLoadAlbumPage ?? 50;
                const data = await this.apiRequest(`/${base}/${link.id}?limit=${pageLimit}`);
                if (!data || data.error) {
                    return { loadType: "error", data: { message: `${link.type} not found.` } };
                }
                let items = link.type === "playlist"
                    ? data.tracks.items.map((i) => i.track)
                    : data.tracks.items;
                items = items.filter(Boolean);
                let next = data.tracks.next;
                const max = options?.limit ??
                    (link.type === "playlist"
                        ? this.options.limitLoadPlaylist ?? this.manager.options.search?.playlistLoadLimit
                        : this.options.limitLoadAlbum ?? this.manager.options.search?.playlistLoadLimit);
                while (next && (!max || items.length < max)) {
                    const nextPage = await this.apiRequest(next);
                    if (!nextPage || nextPage.error)
                        break;
                    const newItems = link.type === "playlist"
                        ? nextPage.items.map((i) => i.track)
                        : nextPage.items;
                    items.push(...newItems.filter(Boolean));
                    next = nextPage.next;
                }
                if (max != null)
                    items = items.slice(0, max);
                const tracks = items.map((item) => this.buildTrack(item, item.external_urls?.spotify));
                return {
                    loadType: "playlist",
                    data: { info: { name: data.name, selectedTrack: 0 }, tracks },
                };
            }
            default:
                return { loadType: "error", data: { message: "Unsupported Spotify URL type" } };
        }
    }
    getLinkType(url) {
        const regex = {
            track: /(?:open\.spotify\.com\/(?:intl-[^/]+\/)?track\/|spotify:track:)(\w+)/,
            album: /(?:open\.spotify\.com\/(?:intl-[^/]+\/)?album\/|spotify:album:)(\w+)/,
            playlist: /(?:open\.spotify\.com\/(?:intl-[^/]+\/)?playlist\/|spotify:playlist:)(\w+)/,
            artist: /(?:open\.spotify\.com\/(?:intl-[^/]+\/)?artist\/|spotify:artist:)(\w+)/,
        };
        for (const type in regex) {
            const match = url.match(regex[type]);
            if (match) {
                return { type, id: match[1] };
            }
        }
        return null;
    }
    resolve(url) {
        return this.load(url);
    }
}
exports.SpotifySource = SpotifySource;
//# sourceMappingURL=spotify.js.map