"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listen = void 0;
const events_1 = require("events");
const ws_1 = __importDefault(require("ws"));
class Listen {
    player;
    voiceReceiverWs;
    constructor(player) {
        this.player = player;
    }
    start() {
        if (this.player.node.info.isNodeLink)
            throw new Error("Moonlink.js > Listen#start - Node not is a NodeLink, switch to a NodeLink");
        this.voiceReceiverWs = new ws_1.default(`ws${this.player.node.secure ? "s" : ""}://${this.player.node.address}/connection/data`, {
            headers: {
                Authorization: this.player.node.password,
                "Client-Name": `Moonlink.js/${this.player.manager.version}`,
                "guild-id": this.player.guildId,
                "user-id": this.player.manager.options.clientId
            }
        });
        const listener = new events_1.EventEmitter();
        this.voiceReceiverWs.on("message", (data) => {
            const payload = JSON.parse(data);
            switch (payload?.type) {
                case "startSpeakingEvent": {
                    listener.emit("start", {
                        ...payload.data
                    });
                    break;
                }
                case "endSpeakingEvent": {
                    payload.data.data = Buffer.from(payload.data.data, "base64");
                    listener.emit("end", {
                        ...payload.data
                    });
                    break;
                }
                default: {
                    listener.emit("unknown", {
                        ...payload
                    });
                }
            }
        });
        this.voiceReceiverWs.on("close", () => {
            listener.emit("close");
        });
        this.voiceReceiverWs.on("error", error => {
            listener.emit("error", error);
        });
        return listener;
    }
    stop() {
        if (!this.voiceReceiverWs)
            return;
        this.voiceReceiverWs.close();
        this.voiceReceiverWs = null;
        return true;
    }
}
exports.Listen = Listen;
//# sourceMappingURL=Listen.js.map