"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manager = void 0;
const Util_1 = require("../Util");
const DatabaseManager_1 = require("../managers/DatabaseManager");
const __1 = require("../..");
const spotify_1 = require("../sources/spotify");
const deezer_1 = require("../sources/deezer");
class Manager extends Util_1.EventEmitter {
    initialized = false;
    options;
    send;
    clientId;
    nodes;
    players;
    database;
    idleCheckInterval;
    spotifySource;
    deezerSource;
    get readyNodes() {
        return this.nodes.ready;
    }
    get hasReadyNodes() {
        return this.nodes.hasReady;
    }
    constructor(config) {
        super();
        (0, Util_1.validate)(config, (value) => value != null, "Manager constructor requires a config object.");
        (0, Util_1.validate)(config.nodes, (value) => Array.isArray(value) && value.length > 0, "Manager config requires a non-empty nodes array.");
        (0, Util_1.validate)(config.options, (value) => value == null || (typeof value === "object" && !Array.isArray(value)), "Manager config 'options' must be a plain object if provided.");
        this.send = config.send || null;
        this.options = {
            clientName: `Moonlink.js/${__1.version} (https://github.com/Ecliptia/moonlink.js)`,
            userAgent: `Moonlink.js/${__1.version} (Onsra/10.01.2026)`,
            noReplace: false,
            resume: true,
            resumeTimeout: 60000,
            customFilters: {},
            defaultPlayer: {
                volume: 100,
                autoPlay: false,
                autoLeave: false,
                selfDeaf: true,
                selfMute: false,
                loop: "off",
                historySize: 10
            },
            voiceConnection: {
                timeout: 15000,
                maxReconnectAttempts: 3,
                reconnectDelay: 5000,
                autoReconnect: true
            },
            node: {
                selectionStrategy: "leastLoad",
                retryDelay: 30000,
                retryAmount: 5,
                avoidUnhealthyNodes: false,
                maxCpuLoad: 80,
                maxMemoryUsage: 90
            },
            search: {
                defaultPlatform: "youtube",
                resultLimit: 10,
                playlistLoadLimit: 100
            },
            queue: {
                maxSize: 1000,
                allowDuplicates: true,
                historyLimit: 10
            },
            sources: {
                disabledSources: []
            },
            spotify: {
                enabled: false
            },
            deezer: {
                enabled: false
            },
            playerDestruction: {
                autoDestroyOnIdle: false,
                idleTimeout: 300000
            },
            trackHandling: {
                autoSkipOnError: false,
                skipStuckTracks: false,
                trackStuckThreshold: 10000,
                retryFailedTracks: false,
                maxRetryAttempts: 3
            },
            playerHealth: {
                checkInterval: 30000,
                silenceTimeout: 120000,
                maxStuckCount: 3,
                maxSilentCount: 2,
                autoRecover: true,
                resumeDebounce: 1000
            },
            database: {
                type: "local"
            },
            ...config.options
        };
        Util_1.Structure.setManager(this);
        this.nodes = new (Util_1.Structure.get("NodeManager"))(this, config.nodes);
        this.players = new (Util_1.Structure.get("PlayerManager"))(this);
    }
    use(connector, client) {
        connector.setManager(this);
        if (!this.send)
            this.send = connector.send.bind(connector);
        connector.listen(client);
        return this;
    }
    async init(clientId) {
        if (this.initialized)
            return this;
        (0, Util_1.validate)(clientId, (id) => typeof id === "string" && /^\d{17,20}$/.test(id), "init requires a valid clientId (a string of 17-20 digits).");
        this.clientId = clientId;
        this.database = new DatabaseManager_1.DatabaseManager(this);
        await this.database.initialize();
        this.nodes.init();
        if (this.options.playerDestruction?.autoDestroyOnIdle) {
            this.startIdleMonitoring();
        }
        this.initialized = true;
        this.emit("debug", `Moonlink.js > Manager >> Initialized. ClientId: ${this.clientId}`);
        return this;
    }
    startIdleMonitoring() {
        const idleTimeout = this.options.playerDestruction?.idleTimeout ?? 300000;
        this.idleCheckInterval = setInterval(async () => {
            const now = Date.now();
            for (const player of this.players.all) {
                if ((!player.playing || player.paused) && now - player.lastActivityTime >= idleTimeout) {
                    this.emit("debug", `Moonlink.js > Manager >> Player ${player.guildId} has been idle for ${idleTimeout}ms. Auto-destroying...`);
                    await player.destroy("Idle timeout");
                }
            }
        }, 60000);
    }
    isSpotifyEnabled() {
        const config = this.options.spotify;
        if (!config)
            return false;
        if (config.enabled !== undefined)
            return config.enabled;
        return Boolean(config.clientId || config.clientSecret || config.accessToken);
    }
    isDeezerEnabled() {
        const config = this.options.deezer;
        if (!config)
            return false;
        if (config.enabled !== undefined)
            return config.enabled;
        return true;
    }
    getSpotifySource() {
        if (!this.isSpotifyEnabled())
            return null;
        if (!this.spotifySource) {
            this.spotifySource = new spotify_1.SpotifySource(this);
        }
        return this.spotifySource;
    }
    getDeezerSource() {
        if (!this.isDeezerEnabled())
            return null;
        if (!this.deezerSource) {
            this.deezerSource = new deezer_1.DeezerSource(this);
        }
        return this.deezerSource;
    }
    async resolveNativeSource(options) {
        let query = options.query;
        const source = options.source?.toLowerCase();
        if (source === "spotify") {
            query = `spsearch:${options.query}`;
        }
        else if (source === "spsearch" || source === "sprec") {
            query = `${source}:${options.query}`;
        }
        else if (source === "deezer") {
            query = `dzsearch:${options.query}`;
        }
        else if (source === "dzsearch") {
            query = `dzsearch:${options.query}`;
        }
        const spotify = this.getSpotifySource();
        if (spotify && spotify.match(query)) {
            return spotify.load(query);
        }
        const deezer = this.getDeezerSource();
        if (deezer && deezer.match(query)) {
            return deezer.load(query);
        }
        return null;
    }
    async search(options) {
        (0, Util_1.validate)(options, (o) => typeof o === "object", "Search > Search options must be an object.");
        (0, Util_1.validate)(options.query, (q) => typeof q === "string" && q.length > 0, "Search > 'query' must be a non-empty string.");
        const nativeResult = await this.resolveNativeSource(options);
        if (nativeResult) {
            this.emit("debug", `Moonlink.js > Manager <- Native source result for query \"${options.query}\". LoadType: ${nativeResult.loadType}`);
            return new (Util_1.Structure.get("SearchResult"))(nativeResult, options.requester, this.options.search?.playlistLoadLimit);
        }
        const node = options.node ? this.nodes.nodes.get(options.node) : this.nodes.findNode();
        if (!node) {
            throw new Error("Moonlink.js > Search > No available nodes for searching.");
        }
        let identifier;
        const URL_REGEX = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
        if (URL_REGEX.test(options.query)) {
            identifier = options.query;
        }
        else {
            let source;
            if (options.source) {
                if (Util_1.nodeLinkSources.has(options.source) && !node.isNodeLink) {
                    throw (0, Util_1.nodeLinkOnlyError)(`search:${options.source}`);
                }
                source = Util_1.sources[options.source] || options.source;
            }
            else {
                const defaultPlatform = this.options.search?.defaultPlatform || "youtube";
                if (Util_1.nodeLinkSources.has(defaultPlatform) && !node.isNodeLink) {
                    throw (0, Util_1.nodeLinkOnlyError)(`search:${defaultPlatform}`);
                }
                source = Util_1.sources[defaultPlatform] || "ytsearch";
            }
            identifier = `${source}:${options.query}`;
        }
        const res = await node.rest.loadTracks(identifier);
        this.emit("debug", `Moonlink.js > Manager <- Search result for query "${options.query}". LoadType: ${res.loadType}`);
        const result = new (Util_1.Structure.get("SearchResult"))(res, options.requester, this.options.search?.playlistLoadLimit);
        if (result.loadType === "search") {
            result.tracks = result.tracks.slice(0, this.options.search?.resultLimit ?? 10);
        }
        if (this.options.sources?.disabledSources && this.options.sources.disabledSources.length > 0) {
            result.tracks = result.tracks.filter(track => {
                const isDisabled = this.options.sources.disabledSources.includes(track.sourceName);
                if (isDisabled) {
                    this.emit("debug", `Moonlink.js > Manager >> Filtered out track from disabled source: ${track.sourceName} - ${track.title}`);
                }
                return !isDisabled;
            });
        }
        return result;
    }
    async packetUpdate(packet) {
        if (!this.initialized || !packet.t || !["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t))
            return;
        const voicePacket = packet;
        const player = this.players.get(voicePacket.d.guild_id);
        if (!player) {
            this.emit("debug", `Moonlink.js > Manager <- Received packet for non-existent player. GuildId: ${voicePacket.d.guild_id}, Packet Type: ${voicePacket.t}`);
            return;
        }
        switch (voicePacket.t) {
            case "VOICE_STATE_UPDATE":
                if (voicePacket.d.user_id !== this.clientId)
                    return;
                this.emit("debug", `Moonlink.js > Manager <- Received VOICE_STATE_UPDATE. Guild: ${voicePacket.d.guild_id}, Data: ${JSON.stringify(voicePacket.d)}`);
                player.voice.handleStateUpdate(voicePacket.d);
                break;
            case "VOICE_SERVER_UPDATE":
                this.emit("debug", `Moonlink.js > Manager <- Received VOICE_SERVER_UPDATE. Guild: ${voicePacket.d.guild_id}, Data: ${JSON.stringify(voicePacket.d)}`);
                player.voice.handleServerUpdate(voicePacket.d);
                break;
        }
    }
    decodeTrack(encoded) {
        (0, Util_1.validate)(encoded, (v) => typeof v === "string", "Manager#decodeTrack > Encoded string must be a string.");
        return (0, Util_1.decodeTrack)(encoded);
    }
    encodeTrack(track) {
        (0, Util_1.validate)(track, (v) => typeof v === "object", "Manager#encodeTrack > Track info must be an object.");
        return (0, Util_1.encodeTrack)(track);
    }
}
exports.Manager = Manager;
//# sourceMappingURL=Manager.js.map