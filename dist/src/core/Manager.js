"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manager = void 0;
const node_events_1 = require("node:events");
const types_1 = require("../typings/types");
const index_1 = require("../../index");
class Manager extends node_events_1.EventEmitter {
    initialize = false;
    options;
    sendPayload;
    nodes;
    players = new (index_1.Structure.get("PlayerManager"))(this);
    version = require("../../index").version;
    database;
    sources;
    constructor(config) {
        super();
        (0, index_1.validateProperty)(config, (value) => value !== undefined, "Moonlink.js > Manager > Config is required.");
        (0, index_1.validateProperty)(config.sendPayload, (value) => typeof value === "function", "Moonlink.js > Manager > sendPayload function is required in config.");
        (0, index_1.validateProperty)(config.nodes, (value) => Array.isArray(value) && value.length > 0, "Moonlink.js > Manager > At least one node is required in config.nodes.");
        this.sendPayload = config.sendPayload;
        this.options = {
            clientName: `Moonlink.js/${this.version} (https://github.com/Ecliptia/moonlink.js)`,
            defaultPlatformSearch: types_1.SearchSources.YouTube,
            NodeLinkFeatures: false,
            logFile: { path: undefined, log: false },
            movePlayersOnReconnect: false,
            sortPlayersByRegion: false,
            resume: false,
            autoResume: false,
            disableDatabase: false,
            ...config.options,
        };
        this.nodes = new (index_1.Structure.get("NodeManager"))(this, config.nodes);
        if (this.options.plugins) {
            this.options.plugins.forEach(plugin => {
                try {
                    if (plugin.minVersion && (0, index_1.compareVersions)(this.version, plugin.minVersion) < 0) {
                        this.emit("debug", `Moonlink.js > Plugin ${plugin.name || "unknown"} requires at least version ${plugin.minVersion}. Current version: ${this.version}`);
                        return;
                    }
                    plugin.load(this);
                }
                catch (e) {
                    this.emit("debug", `Moonlink.js > Failed to load plugin ${plugin.name || "unknown"}: ${e.message}`);
                }
            });
        }
    }
    async init(clientId) {
        if (this.initialize)
            return;
        try {
            if (this.options.logFile?.log) {
                (0, index_1.validateProperty)(this.options.logFile?.path, value => value !== undefined || typeof value !== "string", "Moonlink.js > Options > A path to save the log was not provided");
                this.on("debug", (message) => (0, index_1.Log)(message, this.options.logFile?.path));
            }
            index_1.Structure.manager = this;
            this.options.clientId = clientId;
            this.database = await (index_1.Structure.get("Database")).create(this);
            this.sources = new (index_1.Structure.get("SourceManager"))(this);
            this.nodes.init();
            this.initialize = true;
            this.emit("debug", "Moonlink.js > initialized with clientId(" + clientId + "), ready to go!");
            this.emit("debug", "Moonlink.js > Version: " + this.version);
            this.emit("debug", "Moonlink.js > environment: " + (typeof globalThis.Deno !== "undefined" ? "Deno" : typeof globalThis.bun !== "undefined" ? "Bun" : "Node.js") + "; version: " + (typeof globalThis.Deno !== "undefined" ? globalThis.Deno.version.deno : typeof globalThis.bun !== "undefined" ? globalThis.Bun.version : process.version));
        }
        catch (e) {
            this.emit("debug", `Moonlink.js > Failed to initialize: ${e.message}`);
        }
    }
    async search(options) {
        return new Promise(async (resolve, reject) => {
            (0, index_1.validateProperty)(options, value => value !== undefined, "(Moonlink.js) - Manager > Search > Options is required");
            (0, index_1.validateProperty)(options.query, value => typeof value === "string", "(Moonlink.js) - Manager > Search > Query is required");
            const query = options.query;
            const initialSource = options.source ?? this.options.defaultPlatformSearch;
            const sourcesToTry = this.options.enableSourceFallback ? [initialSource, ...(options.fallbackSources || [])] : [initialSource];
            for (const sourceName of sourcesToTry) {
                let result;
                try {
                    const [matched, sourceMatched] = this.sources.isLinkMatch(query, sourceName);
                    if (!this.options.disableNativeSources && matched) {
                        const nativeSource = this.sources.get(sourceMatched);
                        if (nativeSource) {
                            const data = await nativeSource.load(query, options);
                            result = new (index_1.Structure.get("SearchResult"))(data, options);
                        }
                    }
                    else if (!this.options.disableNativeSources &&
                        this.sources.has(sourceName)) {
                        const nativeSource = this.sources.get(sourceName);
                        const data = await nativeSource.search(query, options);
                        result = new (index_1.Structure.get("SearchResult"))(data, options);
                    }
                    else {
                        const available = [...this.nodes.cache.values()].filter(n => n.connected);
                        if (available.length === 0) {
                            throw new Error("No available nodes to search from.");
                        }
                        const node = options.node && this.nodes.cache.has(options.node)
                            ? this.nodes.get(options.node)
                            : this.nodes.best;
                        const data = await node.rest.loadTracks(sourceName, query);
                        result = new (index_1.Structure.get("SearchResult"))(data, options);
                    }
                    if (result && result.loadType !== "empty" && result.loadType !== "error") {
                        return resolve(result);
                    }
                }
                catch (e) {
                    this.emit("debug", `Moonlink.js > Search > Failed to search with source ${sourceName}: ${e.message}`);
                }
            }
            return resolve(new (index_1.Structure.get("SearchResult"))({ loadType: "empty", data: {} }, options));
        });
    }
    async packetUpdate(packet) {
        if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t))
            return;
        if (!packet.d.token && !packet.d.session_id)
            return;
        const player = this.players.get(packet.d.guild_id);
        if (!player)
            return;
        if (!player.voiceState)
            player.voiceState = {};
        if (packet.t === "VOICE_SERVER_UPDATE") {
            this._handleVoiceServerUpdate(packet, player);
        }
        else if (packet.t === "VOICE_STATE_UPDATE") {
            this._handleVoiceStateUpdate(packet, player);
        }
    }
    async _handleVoiceServerUpdate(packet, player) {
        player.voiceState.token = packet.d.token;
        player.voiceState.endpoint = packet.d.endpoint;
        if (packet.d.endpoint) {
            const match = packet.d.endpoint.match(/^([a-z-]+)[0-9]*\.discord\.media/i);
            if (match) {
                const region = match[1];
                player.region = region;
                this.emit("debug", `Moonlink.js > Updated region (${region}) for guild ${player.guildId}`);
                if (this.options.sortPlayersByRegion && !player.node.regions.includes(region)) {
                    let hasNode = [...this.nodes.cache.values()].some(node => node.regions.includes(region));
                    if (hasNode) {
                        let newNode = [...this.nodes.cache.values()].find(node => node.regions.includes(region));
                        this.emit("debug", `Moonlink.js > Moved player from ${player.node.uuid} to ${newNode.uuid}`);
                        player.node = newNode;
                    }
                }
            }
        }
        this.emit("debug", `Moonlink.js > Received voice server update for guild ${player.guildId}`);
        await this.attemptConnection(player.guildId);
        this.emit("playerReady", player);
    }
    _handleVoiceStateUpdate(packet, player) {
        if (packet.d.user_id !== this.options.clientId)
            return;
        if (!packet.d.channel_id) {
            player.connected = false;
            player.playing = false;
            player.voiceChannelId = null;
            player.voiceState = {};
            this.emit("playerDisconnected", player);
            this.emit("debug", "Moonlink.js > Is disconnected from guild " + player.guildId);
            return;
        }
        if (packet.d.channel_id !== player.voiceChannelId) {
            this.emit("playerMoved", player, player.voiceChannelId, packet.d.channel_id);
            this.emit("debug", `Moonlink.js > Moved to channel ${packet.d.channel_id} in guild ${player.guildId}`);
            player.voiceChannelId = packet.d.channel_id;
        }
        player.voiceState.sessionId = packet.d.session_id;
        this.emit("debug", `Moonlink.js > Received voice state update for guild ${player.guildId}`);
        this.attemptConnection(player.guildId);
        this.emit("playerReady", player);
    }
    async attemptConnection(guildId) {
        const player = this.players.get(guildId);
        if (!player)
            return;
        const voiceState = player.voiceState;
        if (!voiceState.token || !voiceState.sessionId || !voiceState.endpoint) {
            this.emit("debug", `Moonlink.js > Missing voice server data for guild ${guildId}, wait...`);
            return false;
        }
        let attempts = await player.node.rest.update({
            guildId,
            data: {
                voice: {
                    sessionId: voiceState.sessionId,
                    token: voiceState.token,
                    endpoint: voiceState.endpoint,
                },
            },
        });
        this.emit("playerConnecting", player);
        this.emit("debug", `Moonlink.js > Attempting to connect to ${player.node.identifier ?? player.node.host} for guild ${guildId}`);
        if (attempts)
            player.voiceState.attempt = true;
        return true;
    }
    createPlayer(config) {
        return this.players.create(config);
    }
    getPlayer(guildId) {
        return this.players.get(guildId);
    }
    hasPlayer(guildId) {
        return this.players.has(guildId);
    }
    deletePlayer(guildId) {
        this.players.delete(guildId);
        return true;
    }
    getAllPlayers() {
        return this.players.cache;
    }
}
exports.Manager = Manager;
//# sourceMappingURL=Manager.js.map