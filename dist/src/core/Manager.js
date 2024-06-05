"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manager = void 0;
const node_events_1 = require("node:events");
const index_1 = require("../../index");
class Manager extends node_events_1.EventEmitter {
    initialize = false;
    options;
    sendPayload;
    nodes;
    players = new index_1.PlayerManager(this);
    version = require("../../index").version;
    constructor(config) {
        super();
        this.sendPayload = config?.sendPayload;
        this.options = {
            clientName: `Moonlink.js/${this.version} (https://github.com/Ecliptia/moonlink.js)`,
            defaultPlatformSearch: "youtube",
            ...config.options
        };
        this.nodes = new index_1.NodeManager(this, config.nodes);
    }
    init(clientId) {
        if (this.initialize)
            return;
        this.options.clientId = clientId;
        this.nodes.init();
        this.initialize = true;
    }
    async search(options) {
        (0, index_1.validateProperty)(options, (value) => value !== undefined, '(Moonlink.js) - Manager > Search > Options is required');
        (0, index_1.validateProperty)(options.query, (value) => value !== undefined || value !== "string", '(Moonlink.js) - Manager > Search > Query is required');
        let query = options.query;
        let source = options.source || this.options.defaultPlatformSearch;
        let requester = options.requester || null;
        if (![...this.nodes.cache.values()].filter(node => node.connected))
            throw new Error("No available nodes to search from.");
        let node = this.nodes.get(options?.node) ?? this.nodes.best;
        let req = await node.rest.loadTracks(source, query);
    }
    packetUpdate(packet) {
        if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t))
            return;
        if (!packet.d.token && !packet.d.session_id)
            return;
        console.log(packet);
        const player = this.players.get(packet.d.guild_id);
        if (!player)
            return;
        if (packet.t === "VOICE_SERVER_UPDATE") {
            let voiceState = player.get("voiceState") || {};
            voiceState.token = packet.d.token;
            voiceState.endpoint = packet.d.endpoint;
            player.set("voiceState", voiceState);
            this.attemptConnection(player.guildId);
        }
        else if (packet.t === "VOICE_STATE_UPDATE") {
            if (packet.d.user_id !== this.options.clientId)
                return;
            if (!packet.d.channel_id) {
                player.connected = false;
                player.playing = false;
                player.voiceChannelId = null;
                player.set("voiceState", {});
                return;
            }
            if (packet.d.channel_id !== player.voiceChannelId) {
                player.voiceChannelId = packet.d.channel_id;
            }
            let voiceState = player.get("voiceState") || {};
            voiceState.session_id = packet.d.session_id;
            player.set("voiceState", voiceState);
            this.attemptConnection(player.guildId);
        }
    }
    async attemptConnection(guildId) {
        const player = this.players.get(guildId);
        const voiceState = player.get("voiceState");
        if (!voiceState.token || !voiceState.session_id || !voiceState.endpoint)
            return;
        console.log(voiceState);
        await player.node.rest.update({
            guildId, data: {
                voice: {
                    session_id: voiceState.session_id,
                    token: voiceState.token,
                    endpoint: voiceState.endpoint
                }
            }
        });
        return true;
    }
    createPlayer(config) {
        return this.players.create(config);
    }
    getPlayer(guildId) {
        return this.players.get(guildId);
    }
}
exports.Manager = Manager;
//# sourceMappingURL=Manager.js.map