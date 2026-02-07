import http from "node:http";
import https from "node:https";
import { URL, URLSearchParams } from "node:url";
import { Manager } from "../core/Manager";
import { encodeTrack, makeRequest } from "../Util";
import type { ITrack, ITrackInfo, IDeezerOptions } from "../typings/Interfaces";

export class DeezerSource {
    public name = "Deezer";
    private readonly manager: Manager;

    constructor(manager: Manager) {
        this.manager = manager;
        this.manager.options.deezer = this.manager.options?.deezer ?? {};
        this.manager.emit("debug", "Moonlink.js > Deezer > Source loaded");
    }

    private get options(): IDeezerOptions {
        return this.manager.options.deezer ?? {};
    }

    public match(query: string): boolean {
        const shortLink = /^(?:https?:\/\/)?dzr\.page\.link\/[\w-]+$/;
        return (
            query.startsWith("dzsearch:") ||
            /(?:https?:\/\/)?(?:www\.)?deezer\.com\/(?:[a-z]{2}\/)?(track|album|playlist|artist)\/\d+/.test(
                query
            ) ||
            shortLink.test(query)
        );
    }

    private async resolveShortLink(url: string): Promise<string | null> {
        let current = url.startsWith("http") ? url : `https://${url}`;
        for (let i = 0; i < 5; i++) {
            const target = new URL(current);
            const transport = target.protocol === "https:" ? https : http;
            const next = await new Promise<string | null>((resolve, reject) => {
                const req = transport.request(
                    {
                        method: "GET",
                        hostname: target.hostname,
                        port: target.port || (target.protocol === "https:" ? 443 : 80),
                        path: target.pathname + target.search,
                        headers: { "User-Agent": "Moonlink.js" },
                    },
                    (res) => {
                        const statusCode = res.statusCode ?? 0;
                        const location = res.headers.location;
                        res.resume();
                        if (statusCode >= 300 && statusCode < 400 && location) {
                            resolve(new URL(location, current).href);
                            return;
                        }
                        resolve(current);
                    }
                );
                req.on("error", reject);
                req.end();
            }).catch((error) => {
                this.manager.emit(
                    "debug",
                    `Moonlink.js > Deezer > Short link resolve failed: ${(error as Error).message}`
                );
                return null;
            });

            if (!next) return null;
            if (next === current) return current;
            current = next;
        }
        return current;
    }

    private async apiRequest(path: string): Promise<any> {
        const url = path.startsWith("http") ? path : `https://api.deezer.com${path}`;
        const res = await makeRequest<any>(url, { method: "GET" });
        if (!res) {
            this.manager.emit("debug", "Moonlink.js > Deezer > API request failed.");
            return null;
        }
        return res;
    }

    public async search(query: string, options?: { limit?: number }): Promise<any> {
        const q = query.startsWith("dzsearch:") ? query.slice(9).trim() : query;
        const limit = options?.limit ?? this.options.maxSearchResults ?? 20;
        const params = new URLSearchParams({ q, limit: String(limit) });
        const data = await this.apiRequest(`/search?${params}`);
        if (!data?.data?.length) return { loadType: "empty", data: {} };
        const tracks = data.data.map((t: any) => this.buildTrack(t));
        return { loadType: "search", data: tracks };
    }

    public async load(query: string, options?: { limit?: number }): Promise<any> {
        const shortLink = /^(?:https?:\/\/)?dzr\.page\.link\/[\w-]+$/;
        if (shortLink.test(query)) {
            const resolved = await this.resolveShortLink(query);
            if (resolved) query = resolved;
        }

        const m = /(?:https?:\/\/(?:www\.)?deezer\.com\/(?:[a-z]{2}\/)?(track|album|playlist|artist)\/(\d+))/.exec(
            query
        );
        if (!m) return { loadType: "error", data: { message: "Invalid Deezer URL" } };
        const [, type, id] = m;

        if (type === "track") {
            const data = await this.apiRequest(`/track/${id}`);
            if (!data) return { loadType: "error", data: { message: "Track not found." } };
            return { loadType: "track", data: this.buildTrack(data) };
        }

        if (type === "artist") {
            const artist = await this.apiRequest(`/artist/${id}`);
            const limit = options?.limit ?? this.options.maxArtistTracks ?? 20;
            const top = await this.apiRequest(`/artist/${id}/top?limit=${limit}`);
            if (!artist || !top?.data) {
                return { loadType: "error", data: { message: "Artist not found." } };
            }
            const tracks = top.data.map((t: any) => this.buildTrack(t));
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
        const limit =
            options?.limit ??
            this.options[limitKey] ??
            this.manager.options.search?.playlistLoadLimit;
        const slice = typeof limit === "number" ? items.slice(0, limit) : items;
        const tracks = slice.map((t: any) => this.buildTrack(t));
        return { loadType: "playlist", data: { info: { name: col.title, selectedTrack: 0 }, tracks } };
    }

    private buildTrack(item: any): ITrack {
        const info: ITrackInfo = {
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
            encoded: encodeTrack(info),
            pluginInfo: { MoonlinkInternal: true, needsStream: true },
            userData: {},
        };
    }

    public resolve(query: string): Promise<any> {
        return this.load(query);
    }
}
