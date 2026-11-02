"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const Util_1 = require("../Util");
class SearchService {
    manager;
    native;
    cache = new Map();
    pending = new Set();
    constructor(manager, native) {
        this.manager = manager;
        this.native = native;
    }
    close() {
        this.cache.clear();
        for (const operation of this.pending)
            operation.abort(new Error('Manager is shut down'));
        this.pending.clear();
    }
    async wait(operation, signal) {
        return new Promise((resolve, reject) => {
            const aborted = () => { cleanup(); reject(signal.reason ?? new Error('Search aborted')); };
            const cleanup = () => signal.removeEventListener('abort', aborted);
            signal.addEventListener('abort', aborted, { once: true });
            operation.then(value => { cleanup(); resolve(value); }, error => { cleanup(); reject(error); });
            if (signal.aborted)
                aborted();
        });
    }
    validate(result) {
        if (!result || typeof result !== 'object' || !['track', 'search', 'playlist', 'empty', 'error'].includes(result.loadType))
            throw new TypeError('Invalid search response');
        const track = (value) => value && typeof value.encoded === 'string' && value.encoded.length > 0 && value.info && typeof value.info === 'object';
        if (result.loadType === 'track' && !track(result.data) ||
            result.loadType === 'search' && (!Array.isArray(result.data) || !result.data.every(track)) ||
            result.loadType === 'playlist' && (!result.data?.info || !Array.isArray(result.data.tracks) || !result.data.tracks.every(track))) {
            throw new TypeError('Invalid search response payload');
        }
    }
    present(response, query, node) {
        this.validate(response);
        const result = new (Util_1.Structure.get('SearchResult'))(response, query.requester, this.manager.options.search?.playlistLoadLimit);
        if (result.loadType === 'search')
            result.tracks = result.tracks.slice(0, this.manager.options.search?.resultLimit ?? 10);
        const disabled = this.manager.options.sources?.disabledSources ?? [];
        result.tracks = result.tracks.filter(track => !disabled.includes(track.sourceName));
        for (const track of result.tracks)
            track.backend = node?.backend?.kind;
        return result;
    }
    async search(query) {
        if (this.manager.destroyed)
            throw new Error('Manager is shut down');
        if (!query || typeof query !== 'object' || Array.isArray(query))
            throw new TypeError('Search options must be an object');
        if (typeof query.query !== 'string' || !query.query.trim())
            throw new TypeError('Search query must be a non-empty string');
        if (query.source !== undefined && typeof query.source !== 'string')
            throw new TypeError('Search source must be a string');
        const controller = new AbortController();
        const signal = query.signal ? AbortSignal.any([controller.signal, query.signal]) : controller.signal;
        signal.throwIfAborted();
        this.pending.add(controller);
        try {
            const native = await this.wait(this.native({ ...query, signal }), signal);
            if (native) {
                const result = this.present(native, query);
                this.manager.emit('debug', `Moonlink.js > Manager <- Native source result for query "${query.query}". LoadType: ${native.loadType}`);
                return result;
            }
            const node = query.node ? this.manager.nodes.nodes.get(query.node) : this.manager.nodes.findNode();
            if (!node || node.destroyed || !node.connected)
                throw new Error('No available nodes for searching');
            const options = this.manager.options.search ?? {};
            const timeoutMs = options.timeoutMs ?? 10000;
            if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000)
                throw new TypeError('Search timeoutMs must be 1..120000');
            const fallback = options.fallbackPlatforms ?? [];
            if (!Array.isArray(fallback) || fallback.length > 3 || fallback.some(source => typeof source !== 'string' || !source))
                throw new TypeError('Search fallbackPlatforms requires at most three source names');
            let isUrl = false;
            try {
                const url = new URL(query.query);
                isUrl = url.protocol === 'http:' || url.protocol === 'https:';
            }
            catch { }
            const platforms = isUrl ? [''] : [...new Set([query.source ?? options.defaultPlatform ?? 'youtube', ...fallback])];
            const settings = options.cache;
            const ttl = settings?.ttlMs ?? 0;
            const capacity = settings?.maxEntries ?? 100;
            if (settings && (!Number.isFinite(ttl) || ttl <= 0 || ttl > 3600000 || !Number.isInteger(capacity) || capacity < 1 || capacity > 1000))
                throw new TypeError('Search cache requires ttlMs 1..3600000 and maxEntries 1..1000');
            const key = JSON.stringify([node.uuid, node.sessionId, node.backend?.kind, node.backend?.version, query.query, platforms]);
            const cached = this.cache.get(key);
            if (ttl && !options.resolver && cached && cached.expires > Date.now()) {
                this.cache.delete(key);
                this.cache.set(key, cached);
                return this.present(structuredClone(cached.value), query, node);
            }
            this.cache.delete(key);
            let response = { loadType: 'empty', data: {} };
            const custom = options.resolver ? await this.wait(Promise.resolve().then(() => options.resolver({ ...query, signal }, node)), signal) : null;
            if (custom)
                response = custom;
            else
                for (const platform of platforms) {
                    signal.throwIfAborted();
                    if (Util_1.nodeLinkSources.has(platform))
                        node.assertFeature(`search:${platform}`);
                    const identifier = isUrl ? query.query : `${Util_1.sources[platform] ?? platform}:${query.query}`;
                    response = await this.wait(node.rest.loadTracks(identifier, { timeoutMs, signal }), signal);
                    this.validate(response);
                    if (!['empty', 'error'].includes(response.loadType) && !(response.loadType === 'search' && response.data.length === 0))
                        break;
                }
            signal.throwIfAborted();
            this.validate(response);
            if (ttl && !options.resolver && !['empty', 'error'].includes(response.loadType)) {
                try {
                    const value = structuredClone(response);
                    const tracks = value.loadType === 'track' ? [value.data] : value.loadType === 'search' ? value.data : value.data.tracks;
                    for (const track of tracks ?? [])
                        if (track.userData)
                            delete track.userData.requester;
                    for (const [entry, cached] of this.cache)
                        if (cached.expires <= Date.now())
                            this.cache.delete(entry);
                    while (this.cache.size >= capacity)
                        this.cache.delete(this.cache.keys().next().value);
                    this.cache.set(key, { expires: Date.now() + ttl, value });
                }
                catch { }
            }
            this.manager.emit('debug', `Moonlink.js > Manager <- Search result for query "${query.query}". LoadType: ${response.loadType}`);
            return this.present(response, query, node);
        }
        finally {
            this.pending.delete(controller);
        }
    }
}
exports.SearchService = SearchService;
//# sourceMappingURL=SearchService.js.map