"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manager = void 0;
const node_events_1 = require("node:events");
const types_1 = require("../typings/types");
const index_1 = require("../../index");
const LavaSrcPlugin_1 = require("../plugins/LavaSrcPlugin");
const YouTubePlugin_1 = require("../plugins/YouTubePlugin");
const GoogleCloudTTSPlugin_1 = require("../plugins/GoogleCloudTTSPlugin");
const SponsorBlockPlugin_1 = require("../plugins/SponsorBlockPlugin");
const LavaLyricsPlugin_1 = require("../plugins/LavaLyricsPlugin");
const LavaSearchPlugin_1 = require("../plugins/LavaSearchPlugin");
const SkybotPlugin_1 = require("../plugins/SkybotPlugin");
const LyricsKtPlugin_1 = require("../plugins/LyricsKtPlugin");
const JavaLyricsPlugin_1 = require("../plugins/JavaLyricsPlugin");
const JavaLavaLyricsPlugin_1 = require("../plugins/JavaLavaLyricsPlugin");
class Manager extends node_events_1.EventEmitter {
    initialize = false;
    options;
    sendPayload;
    nodes;
    players = new (index_1.Structure.get("PlayerManager"))(this);
    version = require("../../index").version;
    database;
    sources;
    pluginManager;
    lyricsResultCache = new Map();
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
        this.pluginManager = new (index_1.Structure.get("PluginManager"))(this);
        this.pluginManager.registerPlugin(LavaSrcPlugin_1.LavaSrcPlugin);
        this.pluginManager.registerPlugin(YouTubePlugin_1.YouTubePlugin);
        this.pluginManager.registerPlugin(GoogleCloudTTSPlugin_1.GoogleCloudTTSPlugin);
        this.pluginManager.registerPlugin(SponsorBlockPlugin_1.SponsorBlockPlugin);
        this.pluginManager.registerPlugin(LavaLyricsPlugin_1.LavaLyricsPlugin);
        this.pluginManager.registerPlugin(LavaSearchPlugin_1.LavaSearchPlugin);
        this.pluginManager.registerPlugin(SkybotPlugin_1.SkybotPlugin);
        this.pluginManager.registerPlugin(LyricsKtPlugin_1.LyricsKtPlugin);
        this.pluginManager.registerPlugin(JavaLyricsPlugin_1.JavaLyricsPlugin);
        this.pluginManager.registerPlugin(JavaLavaLyricsPlugin_1.JavaLavaLyricsPlugin);
    }
    async init(clientId) {
        if (this.initialize)
            return;
        try {
            if (this.options.logFile?.log) {
                (0, index_1.validateProperty)(this.options.logFile?.path, value => typeof value === "string", "Moonlink.js > Options > A path to save the log was not provided");
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
        (0, index_1.validateProperty)(options, (value) => value !== undefined, "(Moonlink.js) - Manager > Search > Options is required");
        (0, index_1.validateProperty)(options.query, (value) => typeof value === "string", "(Moonlink.js) - Manager > Search > Query is required");
        const { query, source, node: preferredNode, requester, fallbackSources } = options;
        const initialSource = source ?? this.options.defaultPlatformSearch;
        const sourcesToTry = this.options.enableSourceFallback ? [initialSource, ...(fallbackSources || [])] : [initialSource];
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
                else if (!this.options.disableNativeSources && this.sources.has(sourceName)) {
                    const nativeSource = this.sources.get(sourceName);
                    const data = await nativeSource.search(query, options);
                    result = new (index_1.Structure.get("SearchResult"))(data, options);
                }
                else {
                    const capability = `search:${sourceName}`;
                    let targetNode = preferredNode
                        ? this.nodes.get(preferredNode)
                        : this.nodes.getNodeWithCapability(capability);
                    if (!targetNode || !targetNode.connected) {
                        this.emit("debug", `Moonlink.js > Search > No connected node found with capability '${capability}'. Attempting to use any connected node.`);
                        targetNode = this.nodes.sortByUsage("players");
                        if (!targetNode || !targetNode.connected) {
                            this.emit("debug", `Moonlink.js > Search > No connected node available to handle the request.`);
                            continue;
                        }
                    }
                    const data = await targetNode.rest.loadTracks(sourceName, query);
                    result = new (index_1.Structure.get("SearchResult"))(data, { ...options, originNodeIdentifier: targetNode.identifier });
                }
                if (result && result.loadType !== "empty" && result.loadType !== "error") {
                    result.tracks = result.tracks.filter(track => !(0, index_1.isSourceBlacklisted)(this, track.sourceName));
                    if (result.tracks.length === 0) {
                        result.loadType = "empty";
                    }
                    return result;
                }
            }
            catch (e) {
                this.emit("debug", `Moonlink.js > Search > Failed to search with source ${sourceName}: ${e.message}`);
            }
        }
        return new (index_1.Structure.get("SearchResult"))({ loadType: "empty", data: {} }, options);
    }
    async lavaSearch(options) {
        (0, index_1.validateProperty)(options, (value) => value !== undefined, "(Moonlink.js) - Manager > LavaSearch > Options is required");
        (0, index_1.validateProperty)(options.query, (value) => typeof value === "string", "(Moonlink.js) - Manager > LavaSearch > Query is required");
        const { query, source, node: preferredNode, requester, types } = options;
        const initialSource = source ?? this.options.defaultPlatformSearch;
        const capability = `search:${initialSource}`;
        let targetNode = preferredNode
            ? this.nodes.get(preferredNode)
            : this.nodes.getNodeWithCapability(capability);
        if (!targetNode || !targetNode.connected) {
            this.emit("debug", `Moonlink.js > LavaSearch > No connected node found with capability '${capability}'. Attempting to use any connected node.`);
            targetNode = this.nodes.sortByUsage("players");
            if (!targetNode || !targetNode.connected) {
                this.emit("debug", `Moonlink.js > LavaSearch > No connected node available to handle the request.`);
                return new (index_1.Structure.get("SearchResult"))({ loadType: "empty", data: {} }, options);
            }
        }
        if (!targetNode.capabilities.has("lavasearch")) {
            this.emit("debug", `Moonlink.js > LavaSearch > Node ${targetNode.identifier} does not support LavaSearch. Falling back to standard search.`);
            return this.search(options);
        }
        try {
            const lavaSearchPlugin = targetNode.plugins.get("lavasearch-plugin");
            if (lavaSearchPlugin && lavaSearchPlugin.search) {
                const data = await lavaSearchPlugin.search(query, { source: initialSource, types });
                const result = new (index_1.Structure.get("SearchResult"))(data, { ...options, originNodeIdentifier: targetNode.identifier });
                result.tracks = result.tracks.filter(track => !(0, index_1.isSourceBlacklisted)(this, track.sourceName));
                if (result.tracks.length === 0) {
                    result.loadType = "empty";
                }
                return result;
            }
            else {
                this.emit("debug", `Moonlink.js > LavaSearch > LavaSearchPlugin not found or does not have a search method on node ${targetNode.identifier}. Falling back to standard search.`);
                return this.search(options);
            }
        }
        catch (e) {
            this.emit("debug", `Moonlink.js > LavaSearch > Failed to perform LavaSearch: ${e.message}. Falling back to standard search.`);
            return this.search(options);
        }
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
    async getLyrics(options) {
        (0, index_1.validateProperty)(options, (value) => value !== undefined, "(Moonlink.js) - Manager > getLyrics > Options is required");
        const { player, encodedTrack, videoId, skipTrackSource, provider } = options;
        let cacheKey;
        if (player && player.current) {
            cacheKey = `${player.guildId}-${player.current.encoded}`;
            if (this.lyricsResultCache.has(cacheKey)) {
                this.emit("debug", `Moonlink.js > getLyrics > Cache hit for guild ${player.guildId}`);
                return this.lyricsResultCache.get(cacheKey);
            }
        }
        let targetNode;
        let guildId;
        if (player) {
            targetNode = player.node;
            guildId = player.guildId;
        }
        else if (provider === 'lavalyrics') {
            targetNode = this.nodes.getNodeWithCapability("lavalyrics");
        }
        else if (provider === 'lyrics') {
            targetNode = this.nodes.getNodeWithCapability("lyrics");
        }
        else if (provider === 'java-lyrics-plugin') {
            targetNode = this.nodes.getNodeWithCapability("java-lyrics-plugin");
        }
        else if (encodedTrack) {
            targetNode = this.nodes.getNodeWithCapability("lavalyrics") || this.nodes.getNodeWithCapability("lyrics") || this.nodes.getNodeWithCapability("java-lyrics-plugin");
        }
        else if (videoId) {
            targetNode = this.nodes.getNodeWithCapability("lyrics") || this.nodes.getNodeWithCapability("java-lyrics-plugin");
        }
        const pluginsToTry = [];
        if (provider === 'lavalyrics') {
            pluginsToTry.push('lavalyrics-plugin');
        }
        else if (provider === 'lyrics') {
            pluginsToTry.push('lyrics');
        }
        else if (provider === 'java-lyrics-plugin') {
            pluginsToTry.push('java-lyrics-plugin');
        }
        else {
            pluginsToTry.push('java-lyrics-plugin', 'lavalyrics-plugin', 'lyrics');
        }
        for (const pluginName of pluginsToTry) {
            if (!targetNode || !targetNode.connected || !targetNode.capabilities.has(pluginName.replace('-plugin', ''))) {
                this.emit("debug", `Moonlink.js > getLyrics > No connected node with ${pluginName.replace('-plugin', '')} capability found.`);
                continue;
            }
            const lyricsPlugin = targetNode.plugins.get(pluginName);
            if (lyricsPlugin && (lyricsPlugin.getLyricsForCurrentTrack || lyricsPlugin.getLyricsForTrack || lyricsPlugin.getLyricsByVideoId)) {
                try {
                    let resultLyrics = null;
                    if (player && guildId) {
                        resultLyrics = await lyricsPlugin.getLyricsForCurrentTrack(guildId, skipTrackSource);
                        if ((!resultLyrics || !resultLyrics.lines || resultLyrics.lines.length === 0) && lyricsPlugin.getStaticLyricsForTrack) {
                            this.emit("debug", `Moonlink.js > getLyrics > No timed lyrics found for guild ${guildId} with ${pluginName}. Attempting static search.`);
                            resultLyrics = await lyricsPlugin.getStaticLyricsForTrack(guildId);
                        }
                    }
                    else if (pluginName === 'lavalyrics-plugin' && encodedTrack) {
                        resultLyrics = await lyricsPlugin.getLyricsForTrack(encodedTrack, skipTrackSource);
                    }
                    else if (videoId) {
                        resultLyrics = await lyricsPlugin.getLyricsByVideoId(videoId);
                    }
                    else if (encodedTrack) {
                        const trackInfo = (0, index_1.decodeTrack)(encodedTrack);
                        if (trackInfo && trackInfo.info.identifier && trackInfo.info.sourceName === 'youtube' && lyricsPlugin.getLyricsByVideoId) {
                            resultLyrics = await lyricsPlugin.getLyricsByVideoId(trackInfo.info.identifier);
                        }
                    }
                    if (resultLyrics && (resultLyrics.text || (resultLyrics.lines && resultLyrics.lines.length > 0))) {
                        if (cacheKey && resultLyrics) {
                            this.lyricsResultCache.set(cacheKey, resultLyrics);
                        }
                        return resultLyrics;
                    }
                }
                catch (e) {
                    this.emit("debug", `Moonlink.js > getLyrics > Failed to fetch lyrics with ${pluginName}: ${e.message}`);
                }
            }
        }
        return null;
    }
    async searchLyrics(options) {
        (0, index_1.validateProperty)(options, (value) => value !== undefined, "(Moonlink.js) - Manager > searchLyrics > Options is required");
        (0, index_1.validateProperty)(options.query, (value) => typeof value === "string", "(Moonlink.js) - Manager > searchLyrics > Query is required");
        const { query, provider, node: preferredNode, source } = options;
        const pluginsToTry = [];
        if (provider === 'lavalyrics') {
            pluginsToTry.push('lavalyrics-plugin');
        }
        else if (provider === 'lyrics') {
            pluginsToTry.push('lyrics');
        }
        else if (provider === 'java-lyrics-plugin') {
            pluginsToTry.push('java-lyrics-plugin');
        }
        else {
            pluginsToTry.push('lavalyrics-plugin', 'lyrics', 'java-lyrics-plugin');
        }
        for (const pluginName of pluginsToTry) {
            const capability = pluginName;
            let targetNode = preferredNode
                ? this.nodes.get(preferredNode)
                : this.nodes.getNodeWithCapability(capability);
            if (!targetNode || !targetNode.connected || !targetNode.capabilities.has(capability)) {
                this.emit("debug", `Moonlink.js > searchLyrics > No connected node found with capability '${capability}'.`);
                continue;
            }
            const lyricsPlugin = targetNode.plugins.get(pluginName);
            if (lyricsPlugin && lyricsPlugin.search) {
                try {
                    return await lyricsPlugin.search(query, source);
                }
                catch (e) {
                    this.emit("debug", `Moonlink.js > searchLyrics > Failed to search lyrics with ${pluginName}: ${e.message}`);
                }
            }
        }
        return null;
    }
    async subscribeLyrics(guildId, callback, skipTrackSource, provider) {
        (0, index_1.validateProperty)(guildId, (value) => typeof value === "string", "(Moonlink.js) - Manager > subscribeLyrics > guildId is required and must be a string.");
        (0, index_1.validateProperty)(callback, (value) => typeof value === "function", "(Moonlink.js) - Manager > subscribeLyrics > callback is required and must be a function.");
        const player = this.players.get(guildId);
        if (!player)
            return;
        const pluginsToTry = [];
        if (provider === 'lavalyrics') {
            pluginsToTry.push('lavalyrics-plugin');
        }
        else if (provider === 'lyrics') {
            pluginsToTry.push('lyrics');
        }
        else if (provider === 'java-lyrics-plugin') {
            pluginsToTry.push('java-lyrics-plugin');
        }
        else {
            pluginsToTry.push('lavalyrics-plugin', 'lyrics', 'java-lyrics-plugin');
        }
        for (const pluginName of pluginsToTry) {
            const capability = pluginName.replace('-plugin', '');
            const targetNode = player.node;
            if (!targetNode || !targetNode.connected || !targetNode.capabilities.has(capability)) {
                this.emit("debug", `Moonlink.js > subscribeLyrics > No connected node with ${capability} capability found for player ${guildId}.`);
                continue;
            }
            const lyricsPlugin = targetNode.plugins.get(pluginName);
            if (lyricsPlugin && lyricsPlugin.subscribeToLiveLyrics && lyricsPlugin.registerLyricsCallback) {
                try {
                    lyricsPlugin.registerLyricsCallback(guildId, callback);
                    await lyricsPlugin.subscribeToLiveLyrics(guildId, skipTrackSource);
                    this.emit("debug", `Moonlink.js > subscribeLyrics > Subscribed to live lyrics for guild ${guildId} using ${pluginName}.`);
                    return;
                }
                catch (e) {
                    this.emit("debug", `Moonlink.js > subscribeLyrics > Failed to subscribe with ${pluginName}: ${e.message}`);
                }
            }
        }
        this.emit("debug", `Moonlink.js > subscribeLyrics > No suitable plugin found to subscribe to live lyrics for guild ${guildId}.`);
    }
    async unsubscribeLyrics(guildId, provider) {
        (0, index_1.validateProperty)(guildId, (value) => typeof value === "string", "(Moonlink.js) - Manager > unsubscribeLyrics > guildId is required and must be a string.");
        const player = this.players.get(guildId);
        if (!player)
            return;
        const pluginsToTry = [];
        if (provider === 'lavalyrics') {
            pluginsToTry.push('lavalyrics-plugin');
        }
        else if (provider === 'lyrics') {
            pluginsToTry.push('lyrics');
        }
        else if (provider === 'java-lyrics-plugin') {
            pluginsToTry.push('java-lyrics-plugin');
        }
        else {
            pluginsToTry.push('lavalyrics-plugin', 'lyrics', 'java-lyrics-plugin');
        }
        for (const pluginName of pluginsToTry) {
            const capability = pluginName.replace('-plugin', '');
            const targetNode = player.node;
            if (!targetNode || !targetNode.connected || !targetNode.capabilities.has(capability)) {
                this.emit("debug", `Moonlink.js > unsubscribeLyrics > No connected node with ${capability} capability found for player ${guildId}.`);
                continue;
            }
            const lyricsPlugin = targetNode.plugins.get(pluginName);
            if (lyricsPlugin && lyricsPlugin.unsubscribeFromLiveLyrics && lyricsPlugin.unregisterLyricsCallback) {
                try {
                    lyricsPlugin.unregisterLyricsCallback(guildId);
                    await lyricsPlugin.unsubscribeFromLiveLyrics(guildId);
                    this.emit("debug", `Moonlink.js > unsubscribeLyrics > Unsubscribed from live lyrics for guild ${guildId} using ${pluginName}.`);
                    return;
                }
                catch (e) {
                    this.emit("debug", `Moonlink.js > unsubscribeLyrics > Failed to unsubscribe with ${pluginName}: ${e.message}`);
                }
            }
        }
        this.emit("debug", `Moonlink.js > unsubscribeLyrics > No suitable plugin found to unsubscribe from live lyrics for guild ${guildId}.`);
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