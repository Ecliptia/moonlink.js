"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manager = void 0;
const node_events_1 = require("node:events");
class Manager extends node_events_1.EventEmitter {
    clientId;
    options;
    sendPayload;
    version;
    constructor(data) {
        super();
        this.sendPayload = data?.sendPayload;
        this.options = {
            clientName: `Moonlink.js/${this.version} (https://github.com/Ecliptia/moonlink.js)`,
            defaultPlatformSearch: "youtube",
            ...data.options
        };
    }
}
exports.Manager = Manager;
