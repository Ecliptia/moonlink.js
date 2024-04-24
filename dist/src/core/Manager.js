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
    players = new index_1.PlayerManager();
    version = require("../../index").version;
    constructor(config) {
        super();
        this.sendPayload = config?.sendPayload;
        this.options = {
            clientName: `Moonlink.js/${this.version} (https://github.com/Ecliptia/moonlink.js)`,
            defaultPlatformSearch: "youtube",
            ...config.options
        };
        this.nodes = new index_1.NodeManager(config.nodes);
    }
    init(clientId) {
        if (this.initialize)
            return;
        this.options.clientId = clientId;
        index_1.Structure.setManager(this);
        this.nodes.init();
        this.initialize = true;
    }
    packetHandler(packet) {
        if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t))
            return;
        if (!packet.d.session_id && !packet.session_id)
            return;
        const player = this.players.get(packet.d.guild_id);
    }
    attemptConnection() {
    }
}
exports.Manager = Manager;
//# sourceMappingURL=Manager.js.map