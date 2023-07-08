"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkManager = void 0;
const node_events_1 = require("node:events");
const MoonlinkNodes_1 = require("./MoonlinkNodes");
const MoonlinkPlayers_1 = require("./MoonlinkPlayers");
const MoonlinkTrack_1 = require("../@Rest/MoonlinkTrack");
const Plugin_1 = require("../@Rest/Plugin");
const Spotify_1 = require("../@Sources/Spotify");
const Deezer_1 = require("../@Sources/Deezer");
/**
 * Creates a new MoonlinkManager instance.
 * @param {Nodes[]} nodes - An array of objects containing information about the Lavalink nodes.
 * @param {Options} options - An object containing options for the MoonlinkManager.
 * @param {Function} sPayload - A function to send payloads to the Lavalink nodes.
 * @returns {MoonlinkManager} - The new MoonlinkManager instance.
 * @throws {Error} - If the nodes parameter is empty or not an array.
 * @throws {Error} - If there are no parameters with node information in the nodes object.
 * @throws {Error} - If the clientName option is not set correctly.
 * @throws {RangeError} - If a plugin is not compatible.
 */
class MoonlinkManager extends node_events_1.EventEmitter {
    _nodes;
    _sPayload;
    initiated;
    options;
    nodes;
    spotify;
    deezer;
    sendWs;
    clientId;
    version;
    map = new Map();
    constructor(nodes, options, sPayload) {
        super();
        if (!nodes)
            throw new Error('[ @Moonlink/Manager ]: "nodes" option is empty');
        if (nodes && !Array.isArray(nodes))
            throw new Error('[ @Moonlink/Manager ]: the "nodes" option has to be in an array');
        if (nodes && nodes.length == 0)
            throw new Error('[ @Moonlink/Manager ]: there are no parameters with "node(s)" information in the object');
        if (options &&
            typeof options.clientName !== "string" &&
            typeof options.clientName !== "undefined")
            throw new Error('[ @Moonlink/Manager ]: clientName option of the "options" parameter must be in string format');
        if (!options.custom)
            options.custom = {};
        if (options.plugins) {
            options.plugins.forEach(plugin => {
                if (!(plugin instanceof Plugin_1.Plugin))
                    throw new RangeError(`[ @Moonlink/Manager ]: this plugin is not compatible`);
                plugin.load(this);
            });
        }
        this._nodes = nodes;
        this._sPayload = sPayload;
        this.options = options;
        this.nodes = new Map();
        this.spotify = new Spotify_1.Spotify(this, options);
        this.deezer = new Deezer_1.Deezer(this, options);
        this.sendWs;
        this.version = require("../../index").version;
    }
    /**
    * Initializes the MoonlinkManager by connecting to the Lavalink nodes.
    * @param {string} clientId - The ID of the Discord client.
    * @returns {MoonlinkManager} - The MoonlinkManager instance.
    * @throws {TypeError} - If the clientId option is empty.
    */
    init(clientId) {
        if (this.initiated)
            return this;
        if (!clientId)
            throw new TypeError('[ @Moonlink/Manager ]: "clientId" option is required.');
        this.clientId = clientId;
        this._nodes.forEach((node) => this.addNode(node));
        this.initiated = true;
        return this;
    }
    /**
 * Adds a new Lavalink node to the MoonlinkManager.
 * @param {Node} node - An object containing information about the Lavalink node.
 * @returns {Node} - The added node.
 * @throws {Error} - If the host option is not configured correctly.
 * @throws {Error} - If the password option is not set correctly.
 * @throws {Error} - If the port option is not set correctly.
 */
    addNode(node) {
        const new_node = new MoonlinkNodes_1.MoonlinkNode(this, node, this.map);
        if (node.identifier)
            this.nodes.set(node.identifier, new_node);
        else
            this.nodes.set(node.host, new_node);
        new_node.init();
        return new_node;
    }
    /**
     * Removes a Lavalink node from the MoonlinkManager.
     * @param {string} name - The name or identifier of the node to remove.
     * @returns {boolean} - True if the node is removed, false otherwise.
     * @throws {Error} - If the name option is empty.
     */
    removeNode(name) {
        if (!name)
            throw new Error('[ @Moonlink/Manager ]: option "name" is empty');
        let node = this.nodes.get(name);
        if (!node)
            return false;
        this.nodes.delete(name);
        return true;
    }
    get leastUsedNodes() {
        return [...this.nodes.values()]
            .filter((node) => node.isConnected)
            .sort((a, b) => b.calls - a.calls)[0];
    }
    packetUpdate(packet) {
        if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t))
            return;
        const update = packet.d;
        let player = this.players.get(update.guild_id);
        if (!update || (!("token" in update) && !("session_id" in update)))
            return;
        if ("t" in packet && "VOICE_SERVER_UPDATE".includes(packet.t)) {
            let voiceServer = {};
            voiceServer[update.guild_id] = {
                event: update,
            };
            this.map.set("voiceServer", voiceServer);
            return this.attemptConnection(update.guild_id);
        }
        if ("t" in packet && "VOICE_STATE_UPDATE".includes(packet.t)) {
            if (update.user_id !== this.clientId)
                return;
            if (!player)
                return;
            if (!update.channel_id) {
                this.emit('playerDisconnect', player);
                let players = this.map.get('players') || {};
                players[update.guild_id] = {
                    ...players[update.guild_id],
                    connected: false,
                    voiceChannel: null,
                    playing: false
                };
                player.connected = false;
                player.voiceChannel = null;
                player.playing = false;
                player.stop();
            }
            if (update.channel_id !== player.voiceChannel) {
                this.emit('playerMove', player, update.channel_id, player.voiceChannel);
                let players = this.map.get('players') || {};
                players[update.guild_id] = {
                    ...players[update.guild_id],
                    voiceChannel: update.channel_id
                };
                this.map.set('players', players);
                player.voiceChannel = update.channel_id;
            }
            let voiceStates = {};
            voiceStates[update.guild_id] = update;
            this.map.set("voiceStates", voiceStates);
            return this.attemptConnection(update.guild_id);
        }
    }
    /**
 * Searches for tracks using the specified query and source.
 * @param {string | SearchQuery} options - The search query or an object containing the search options.
 * @returns {Promise<SearchResult>} - A promise that resolves with the search result.
 * @throws {Error} - If the search option is empty or not in the correct format.
 */
    async search(options) {
        return new Promise(async (resolve) => {
            if (!options)
                throw new Error("[ @Moonlink/Manager ]: the search option has to be in string format or in an array");
            let query;
            let source;
            if (typeof options == "object") {
                query = options.query ? options.query : undefined;
                source = options.source ? options.source : undefined;
            }
            else {
                query = options;
            }
            if (source && typeof source !== "string")
                throw new Error("[ @Moonlink/Manager ]: the source option has to be in string format");
            if (typeof query !== "string" && typeof query !== "object")
                throw new Error("[ @Moonlink/Manager ]: (search) the search option has to be in string or array format");
            let sources = {
                youtube: "ytsearch",
                youtubemusic: "ytmsearch",
                soundcloud: "scsearch",
                spotify: "spotify",
                deezer: "deezer",
            };
            if (this.spotify.check(query)) {
                return resolve(await this.spotify.resolve(query));
            }
            if (this.deezer.check(query)) {
                return resolve(await this.deezer.resolve(query));
            }
            let opts;
            if (query &&
                !query.startsWith("http://") &&
                !query.startsWith("https://")) {
                if (source && !sources[source]) {
                    this.emit("debug", "[ Moonlink/Manager]: no default found, changing to custom source");
                    opts = `${source}:${query}`;
                }
                else {
                    opts = sources[source] || `ytsearch:${query}`;
                }
                if (source == "spotify") {
                    return resolve(this.spotify.fetch(query));
                }
                if (source == "deezer") {
                    return resolve(this.deezer.fetch(query));
                }
            }
            else
                opts = query;
            let params = new URLSearchParams({ identifier: opts });
            let res = await this.leastUsedNodes.request("loadtracks", params);
            if (res.loadType === "error" || res.loadType === "empty") {
                this.emit("debug", "[ @Moonlink/Manager ]: not found or there was an error loading the track");
                return resolve(res);
            }
            else {
                if (res.loadType === "track") {
                    res.data = [res.data];
                }
                if (res.loadType === "playlist") {
                    res.playlistInfo = {};
                    res.playlistInfo.duration = res.data.tracks.reduce((acc, cur) => acc + cur.length, 0);
                    res.playlistInfo.name = res.data.name;
                    res.playlistInfo.selectedTrack = res.data.selectedTrack;
                    res.pluginInfo = res.data.pluginInfo;
                    res.data = [...res.data.tracks];
                }
                const tracks = res.data.map((x) => new MoonlinkTrack_1.MoonlinkTrack(x));
                return resolve({
                    ...res,
                    tracks,
                });
            }
        });
    }
    async attemptConnection(guildId) {
        let voiceServer = this.map.get("voiceServer") || {};
        let voiceStates = this.map.get("voiceStates") || {};
        let players = this.map.get("players") || {};
        if (!players[guildId])
            return false;
        if (!voiceServer[guildId])
            return false;
        this.emit("debug", `[ @Moonlink/Manager ]: sending to lavalink, player data from server (${guildId})`);
        await this.leastUsedNodes.rest.update({
            guildId,
            data: {
                voice: {
                    sessionId: voiceStates[guildId].session_id,
                    endpoint: voiceServer[guildId].event.endpoint,
                    token: voiceServer[guildId].event.token,
                },
            },
        });
        return true;
    }
    get players() {
        let has = (guildId) => {
            let players = this.map.get("players") || {};
            if (players[guildId])
                players = true;
            else
                players = false;
            return players;
        };
        let get = (guildId) => {
            if (!guildId && typeof guildId !== "string")
                throw new Error('[ @Moonlink/Manager ]: "guildId" option in parameter to get player is empty or type is different from string');
            if (!has(guildId))
                return null;
            if (this.options.custom.player) {
                this.emit('debug', '[ @Moonlink/Custom ]: the player is customized');
                return new this.options.custom.player(this.map.get("players")[guildId], this, this.map, this.leastUsedNodes.rest);
            }
            return new MoonlinkPlayers_1.MoonlinkPlayer(this.map.get("players")[guildId], this, this.map, this.leastUsedNodes.rest);
        };
        /**
         * Creates a new MoonlinkPlayer instance or gets an existing player for the specified guild.
         * @param {createOptions} data - The options for creating the player.
         * @returns {MoonlinkPlayer | null} - The MoonlinkPlayer instance or null if the guild does not have a player.
         * @throws {Error} - If the data parameter is not an object.
         * @throws {Error} - If the guildId option is empty or not a string.
         * @throws {Error} - If the textChannel option is empty or not a string.
         * @throws {Error} - If the voiceChannel option is empty or not a string.
         * @throws {TypeError} - If the autoPlay option is not a boolean.
         */
        let create = (data) => {
            if (typeof data !== "object")
                throw new Error('[ @Moonlink/Manager ]: parameter "data" is not an object');
            if (!data.guildId && typeof data.guildId !== "string")
                throw new Error('[ @Moonlink/Manager ]: "guildId" parameter in player creation is empty or not string type');
            if (!data.textChannel && typeof data.textChannel !== "string")
                throw new Error('[ @Moonlink/Manager ]: "textChannel" parameter in player creation is empty or not string type');
            if (!data.voiceChannel && typeof data.voiceChannel !== "string")
                throw new Error('[ @Moonlink/Manager ]: "voiceChannel" parameter in player creation is empty or not string type');
            if ("autoPlay" in data && typeof data.autoPlay !== "boolean")
                throw new Error("[ @Moonlink/Manager ]: autoPlay parameter of player creation has to be boolean type");
            if (has(data.guildId))
                return get(data.guildId);
            let players_map = this.map.get("players") || {};
            players_map[data.guildId] = {
                guildId: data.guildId,
                textChannel: data.textChannel,
                voiceChannel: data.voiceChannel,
                playing: false,
                connected: false,
                paused: false,
                loop: null,
                autoPlay: false,
                node: this.leastUsedNodes
            };
            this.map.set("players", players_map);
            if (this.options.custom.player) {
                this.emit('debug', '[ @Moonlink/Custom ]: the player is customized');
                return new this.options.custom.player(players_map[data.guildId], this, this.map, this.leastUsedNodes.rest);
            }
            return new MoonlinkPlayers_1.MoonlinkPlayer(players_map[data.guildId], this, this.map, this.leastUsedNodes.rest);
        };
        let all = this.map.get('players') ? this.map.get('players') : null;
        return {
            create: create.bind(this),
            get: get.bind(this),
            has: has.bind(this),
            all
        };
    }
}
exports.MoonlinkManager = MoonlinkManager;
//# sourceMappingURL=MoonlinkManager.js.map