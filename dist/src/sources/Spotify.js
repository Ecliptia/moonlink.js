"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const index_1 = require("../../index");
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
const TOKEN_URL = 'https://open.spotify.com/api/token';
const CLIENT_TOKEN_URL = 'https://clienttoken.spotify.com/v1/clienttoken';
const OPEN_SPOTIFY_URL = 'https://open.spotify.com';
class Spotify {
    name = 'Spotify';
    manager;
    accessToken = null;
    clientToken = null;
    clientId = null;
    userAgent = null;
    tokenInitialized = false;
    constructor(manager) {
        this.manager = manager;
        this.manager.options.spotify = this.manager.options?.spotify ?? {};
        this.manager.emit('debug', 'Moonlink.js > Spotify > source loaded');
    }
    match(url) {
        return (url.includes('spotify.com') ||
            url.startsWith('spotify:') ||
            url.startsWith('spsearch:') ||
            url.startsWith('sprec:'));
    }
    async fetchServerTime() {
        try {
            const res = await fetch(`${OPEN_SPOTIFY_URL}/`, {
                headers: { 'Accept': 'application/json' },
            });
            if (!res.ok) {
                return Date.now();
            }
            const dateHeader = res.headers.get('date');
            return dateHeader ? new Date(dateHeader).getTime() : Date.now();
        }
        catch {
            return Date.now();
        }
    }
    generateTotp(serverTimeMs) {
        const TOTP_SECRET = Uint8Array.from([
            53, 53, 48, 55, 49, 52, 53, 56, 53, 51, 52, 56, 55, 52, 57, 57,
            53, 57, 50, 50, 52, 56, 54, 51, 48, 51, 50, 57, 51, 52, 55,
        ]);
        const counter = Math.floor(serverTimeMs / 1000 / 30);
        const ts = counter * 30000;
        const buffer = Buffer.alloc(8);
        buffer.writeBigUInt64BE(BigInt(counter));
        const hmac = crypto_1.default
            .createHmac('sha1', Buffer.from(TOTP_SECRET))
            .update(buffer)
            .digest();
        const offset = hmac[hmac.length - 1] & 0x0f;
        const codeInt = ((hmac[offset] & 0x7f) << 24) |
            ((hmac[offset + 1] & 0xff) << 16) |
            ((hmac[offset + 2] & 0xff) << 8) |
            (hmac[offset + 3] & 0xff);
        const totp = (codeInt % 1e6).toString().padStart(6, '0');
        return [totp, ts];
    }
    async initTokens() {
        if (this.tokenInitialized)
            return;
        this.userAgent =
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 ' +
                '(KHTML, like Gecko) Version/17.0 Safari/605.1.15';
        const serverTimeMs = await this.fetchServerTime();
        const [totp, ts] = this.generateTotp(serverTimeMs);
        const params = new URLSearchParams({
            reason: 'init',
            productType: 'web-player',
            totp,
            totpVer: '5',
            sTime: Math.floor(serverTimeMs / 1000).toString(),
            cTime: Date.now().toString(),
            ts: ts.toString(),
        });
        const tokenResponse = await fetch(`${TOKEN_URL}?${params.toString()}`, {
            headers: {
                'User-Agent': this.userAgent,
                Accept: 'application/json',
                'App-Platform': 'WebPlayer',
                Referer: `${OPEN_SPOTIFY_URL}/`,
            },
        });
        if (!tokenResponse.ok) {
            const errorBody = await tokenResponse.text();
            this.manager.emit('debug', `Moonlink.js > Spotify > Error initializing token: ${tokenResponse.status} - ${errorBody}`);
            return;
        }
        const { accessToken, clientId } = (await tokenResponse.json());
        this.accessToken = accessToken;
        this.clientId = clientId;
        const clientResponse = await fetch(CLIENT_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                client_data: {
                    client_version: '1.2.9.2269',
                    client_id: this.clientId,
                    js_sdk_data: { device_type: 'computer' },
                },
            }),
        });
        if (!clientResponse.ok) {
            this.manager.emit('debug', `Moonlink.js > Spotify > Error initializing client token: ${clientResponse.status}`);
            return;
        }
        const clientJson = (await clientResponse.json());
        if (clientJson.response_type !== 'RESPONSE_GRANTED_TOKEN_RESPONSE') {
            this.manager.emit('debug', `Moonlink.js > Spotify > Client token error: ${clientJson.error}`);
            return;
        }
        this.clientToken = clientJson.granted_token.token;
        this.tokenInitialized = true;
        this.manager.emit('debug', 'Moonlink.js > Spotify > Tokens initialized successfully');
    }
    async apiRequest(path) {
        await this.initTokens();
        if (!this.accessToken || !this.clientId || !this.userAgent) {
            this.manager.emit('debug', 'Moonlink.js > Spotify > API request failed: Tokens not available');
            return null;
        }
        const url = path.startsWith('http') ? path : `${SPOTIFY_API_BASE_URL}${path}`;
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                'Client-Id': this.clientId,
                'User-Agent': this.userAgent,
                Accept: 'application/json',
            },
        });
        if (res.status === 401) {
            this.tokenInitialized = false;
            return this.apiRequest(path);
        }
        if (!res.ok) {
            this.manager.emit('debug', `Moonlink.js > Spotify > API error: ${res.status} ${res.statusText}`);
            return null;
        }
        return res.json();
    }
    buildTrack(item, uri) {
        const trackUri = uri ?? item.uri ?? `${OPEN_SPOTIFY_URL}/track/${item.id}`;
        const info = {
            identifier: item.id ?? 'local',
            uri: trackUri,
            title: item.name ?? 'Unknown Title',
            author: item.artists?.map((a) => a.name).join(', ') ?? 'Unknown Artist',
            length: item.duration_ms ?? 0,
            isSeekable: true,
            isStream: false,
            artworkUrl: item.album?.images?.[0]?.url,
            sourceName: this.name,
            position: 0,
            isrc: item.external_ids?.isrc,
        };
        return {
            info,
            encoded: (0, index_1.encodeTrack)(info),
            pluginInfo: { MoonlinkInternal: true, needsStream: true },
        };
    }
    async search(query) {
        const limit = this.manager.options.spotify?.limitLoadSearch ?? 20;
        const data = await this.apiRequest(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
        if (!data || data.error) {
            this.manager.emit('debug', `Moonlink.js > Spotify > Search failed: ${data?.error?.message}`);
            return { loadType: 'error', data: { message: 'Search failed on Spotify.' } };
        }
        if (!data.tracks?.items?.length) {
            return { loadType: 'empty', data: {} };
        }
        return {
            loadType: 'search',
            data: data.tracks.items.map((t) => this.buildTrack(t)),
        };
    }
    async recommendations(params) {
        const limit = this.manager.options.spotify?.limitLoadRecommendations ?? 20;
        const queryString = `${params}&limit=${limit}`;
        const data = await this.apiRequest(`/recommendations?${queryString}`);
        if (!data || data.error) {
            this.manager.emit('debug', `Moonlink.js > Spotify > Recommendations failed: ${data?.error?.message}`);
            return { loadType: 'error', data: { message: 'Failed to load recommendations.' } };
        }
        if (!data.tracks?.length) {
            return { loadType: 'empty', data: {} };
        }
        return {
            loadType: 'playlist',
            data: {
                info: { name: 'Spotify Recommendations', selectedTrack: 0 },
                tracks: data.tracks.map((t) => this.buildTrack(t)),
            },
        };
    }
    async load(rawUrl) {
        const normalized = rawUrl
            .replace(/open\.spotify\.com\/intl-[^/]+\//, 'open.spotify.com/')
            .split('?')[0];
        if (normalized.startsWith('spsearch:')) {
            return this.search(normalized.slice(9).trim());
        }
        if (normalized.startsWith('sprec:')) {
            return this.recommendations(normalized.slice(6));
        }
        const link = this.getLinkType(normalized);
        if (!link) {
            return { loadType: 'error', data: { message: 'Invalid Spotify URL' } };
        }
        switch (link.type) {
            case 'track': {
                const data = await this.apiRequest(`/tracks/${link.id}`);
                if (!data || data.error) {
                    return { loadType: 'error', data: { message: 'Track not found.' } };
                }
                return { loadType: 'track', data: this.buildTrack(data, normalized) };
            }
            case 'artist': {
                const artistInfo = await this.apiRequest(`/artists/${link.id}`);
                const topTracks = await this.apiRequest(`/artists/${link.id}/top-tracks?market=US`);
                if (!artistInfo || !topTracks?.tracks) {
                    return { loadType: 'error', data: { message: 'Artist not found.' } };
                }
                let tracks = topTracks.tracks.map((t) => this.buildTrack(t));
                const max = this.manager.options.spotify?.limitLoadArtist;
                if (max != null)
                    tracks = tracks.slice(0, max);
                return {
                    loadType: 'playlist',
                    data: { info: { name: `${artistInfo.name}'s Top Tracks`, selectedTrack: 0 }, tracks },
                };
            }
            case 'album':
            case 'playlist': {
                const base = link.type === 'album' ? 'albums' : 'playlists';
                const data = await this.apiRequest(`/${base}/${link.id}`);
                if (!data || data.error) {
                    return { loadType: 'error', data: { message: `${link.type} not found.` } };
                }
                let items = link.type === 'playlist'
                    ? data.tracks.items.map((i) => i.track)
                    : data.tracks.items;
                items = items.filter(Boolean);
                const max = link.type === 'playlist'
                    ? this.manager.options.spotify?.limitLoadPlaylist
                    : this.manager.options.spotify?.limitLoadAlbum;
                if (max != null)
                    items = items.slice(0, max);
                const tracks = items.map((item) => this.buildTrack(item, item.external_urls.spotify));
                return { loadType: 'playlist', data: { info: { name: data.name, selectedTrack: 0 }, tracks } };
            }
            default:
                return { loadType: 'error', data: { message: 'Unsupported Spotify URL type' } };
        }
    }
    getLinkType(url) {
        const regex = {
            track: /open\.spotify\.com\/(?:intl-[^/]+\/)?track\/(\w+)/,
            album: /open\.spotify\.com\/(?:intl-[^/]+\/)?album\/(\w+)/,
            playlist: /open\.spotify\.com\/(?:intl-[^/]+\/)?playlist\/(\w+)/,
            artist: /open\.spotify\.com\/(?:intl-[^/]+\/)?artist\/(\w+)/,
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
exports.default = Spotify;
//# sourceMappingURL=Spotify.js.map