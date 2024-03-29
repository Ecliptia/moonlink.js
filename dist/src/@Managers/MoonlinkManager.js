"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkManager = void 0;
const node_events_1 = require("node:events");
const index_1 = require("../../index");
class MoonlinkManager extends node_events_1.EventEmitter {
    clientId;
    _nodes;
    _SPayload;
    players;
    nodes;
    version = require("../../index").version;
    options;
    initiated = false;
    constructor(nodes, options, SPayload) {
        super();
        this._nodes = nodes;
        this._SPayload = SPayload;
        this.players = new (index_1.Structure.get("PlayerManager"))();
        this.nodes = new (index_1.Structure.get("NodeManager"))();
        this.options = options;
        if (options.plugins) {
            options.plugins.forEach(plugin => {
                plugin.load(this);
            });
        }
        if (!this.options.clientName)
            this.options.clientName = `Moonlink/${this.version} (https://github.com/Ecliptia/moonlink.js)`;
    }
    async init(clientId) {
        if (this.initiated)
            return this;
        this.emit("debug", "@Moonlink - moonlink.js has started the initialization process, do not attempt to use functions until everything is initialized correctly ");
        if (!clientId && !this.options.clientId)
            throw new TypeError('@Moonlink(Manager): "clientId" option is required.');
        this.options.clientId = clientId;
        this.clientId = clientId;
        index_1.Structure.init(this);
        await index_1.Structure.db.fetch();
        this.nodes.init();
        this.players.init();
        this.initiated = true;
        return this;
    }
    async search(options) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!options) {
                    throw new Error("@Moonlink(Manager) - the search option has to be in string format or in an array");
                }
                let query;
                let source;
                let requester;
                let node;
                if (typeof options === "object") {
                    query = options.query;
                    source = options.source;
                    requester = options.requester;
                    node = options.node;
                }
                else {
                    query = options;
                }
                if (requester &&
                    typeof requester !== "string" &&
                    typeof requester !== "object") {
                    throw new Error('@Moonlink(Manager) - The "requester" option in the search function must be in string or array format');
                }
                if (source && typeof source !== "string") {
                    throw new Error("@Moonlink(Manager) - the source option has to be in string format");
                }
                if (typeof query !== "string" && typeof query !== "object") {
                    throw new Error("@Moonlink(Manager) - (search) the search option has to be in string or array format");
                }
                (node && (node = this.nodes.get(node))) ??
                    (node = this.nodes.sortByUsage("memory")[0]);
                const sources = {
                    youtube: "ytsearch",
                    youtubemusic: "ytmsearch",
                    soundcloud: "scsearch"
                };
                let searchIdentifier = query.startsWith("http://") || query.startsWith("https://")
                    ? query
                    : source
                        ? sources[source]
                            ? `${sources[source]}:${query}`
                            : `${source}:${query}`
                        : `ytsearch:${query}`;
                const params = new URLSearchParams({
                    identifier: searchIdentifier
                });
                const res = await node.request("loadtracks", params);
                if (["error", "empty"].includes(res.loadType)) {
                    this.emit("debug", "@Moonlink(Manager) - not found or there was an error loading the track");
                    return resolve(res);
                }
                if (["track"].includes(res.loadType)) {
                    res.data = [res.data];
                }
                if (["playlist"].includes(res.loadType)) {
                    res.playlistInfo = {
                        duration: res.data.tracks.reduce((acc, cur) => acc + cur.info.length, 0),
                        name: res.data.info.name,
                        selectedTrack: res.data.info.selectedTrack
                    };
                    res.pluginInfo = res.data.pluginInfo;
                    res.data = [...res.data.tracks];
                }
                const tracks = res.data.map(track => new (index_1.Structure.get("MoonlinkTrack"))(track, requester));
                resolve({
                    ...res,
                    tracks
                });
            }
            catch (error) {
                this.emit("debug", "@Moonlink(Manager) - An error occurred: " + error);
                reject(error);
            }
        });
    }
    packetUpdate(packet) {
        const { t, d } = packet;
        if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(t))
            return;
        const update = d;
        const guildId = update.guild_id;
        const player = this.players.get(guildId);
        if (!update.token && !update.session_id)
            return;
        if (t === "VOICE_SERVER_UPDATE") {
            this.players.handleVoiceServerUpdate(update, guildId);
        }
        if (t === "VOICE_STATE_UPDATE" && update.user_id === this.clientId) {
            if (!player)
                return;
            if (!update.channel_id) {
                this.players.handlePlayerDisconnect(guildId);
            }
            if (update.channel_id &&
                update.channel_id !== player.voiceChannel) {
                this.players.handlePlayerMove(update.channel_id, player.voiceChannel, guildId);
            }
            this.players.updateVoiceStates(guildId, update);
            this.players.attemptConnection(guildId);
        }
    }
}
exports.MoonlinkManager = MoonlinkManager;
