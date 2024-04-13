"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manager = void 0;
const node_events_1 = require("node:events");
const index_1 = require("index");
class Manager extends node_events_1.EventEmitter {
    clientId;
    options;
    sendPayload;
    nodes;
    version;
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
}
exports.Manager = Manager;
