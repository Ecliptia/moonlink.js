"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
const ws_1 = __importDefault(require("ws"));
const index_1 = require("../../index");
class Node {
    manager;
    host;
    port;
    identifier;
    password;
    connected = false;
    destroyed = false;
    reconnectTimeout;
    reconnectAttempts = 0;
    retryAmount;
    retryDelay = 60000;
    regions;
    secure;
    sessionId;
    socket;
    stats;
    url;
    rest;
    constructor(manager, config) {
        this.manager = manager;
        this.host = config.host;
        this.port = config.port;
        this.identifier = config.identifier;
        this.password = config.password;
        this.regions = config.regions;
        this.retryDelay = config.retryDelay || 30000;
        this.retryAmount = config.retryAmount || 5;
        this.secure = config.secure;
        this.sessionId = config.sessionId;
        this.url = `${this.secure ? "https" : "http"}://${this.address}/v4/`;
        this.rest = new index_1.Rest(this);
    }
    get address() {
        return `${this.host}:${this.port}`;
    }
    connect() {
        let headers = {
            Authorization: this.password,
            "User-Id": this.manager.options.clientId,
            "Client-Name": this.manager.options.clientName,
        };
        this.socket = new ws_1.default(`ws${this.secure ? "s" : ""}://${this.address}/v4/websocket`, { headers });
        this.socket.on("open", this.open.bind(this));
        this.socket.on("close", this.close.bind(this));
        this.socket.on("message", this.message.bind(this));
        this.socket.on("error", this.error.bind(this));
    }
    reconnect() {
        console.log("Reconnecting to the Node");
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, this.retryDelay);
    }
    open() {
        console.log("Connected to the Node");
        if (this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
        this.connected = true;
    }
    close() {
        console.log("Disconnected from the Node");
        if (this.connected)
            this.connected = false;
        this.socket.removeAllListeners();
        this.socket.close();
        if (this.retryAmount > this.reconnectAttempts) {
            this.reconnect();
        }
        else {
            this.socket = null;
            this.destroyed = true;
        }
    }
    async message(data) {
        if (Array.isArray(data))
            data = Buffer.concat(data);
        else if (data instanceof ArrayBuffer)
            data = Buffer.from(data);
        let payload = JSON.parse(data.toString("utf8"));
        switch (payload.op) {
            case "ready":
                this.sessionId = payload.sessionId;
                break;
            case "stats":
                delete payload.op;
                this.stats = payload;
                break;
            case "playerUpdate":
                const player = this.manager.getPlayer(payload.guildId);
                if (!player)
                    return;
                if (!player.current)
                    return;
                if (player.connected !== payload.state.connected)
                    player.connected = payload.state.connected;
                player.current.position = payload.state.position;
                player.current.time = payload.state.time;
                player.ping = payload.state.ping;
                break;
            case "event": {
                let player = this.manager.getPlayer(payload.guildId);
                if (!player)
                    return;
                switch (payload.type) {
                    case "TrackStartEvent":
                        player.playing = true;
                        player.paused = false;
                        this.manager.emit("trackStart", player, player.current);
                        break;
                    case "TrackEndEvent":
                        player.playing = false;
                        player.paused = false;
                        this.manager.emit("trackEnd", player, player.current, payload.reason, payload);
                        if (["loadFailed", "cleanup"].includes(payload.reason)) {
                            if (player.queue.size) {
                                player.play();
                            }
                            else {
                                player.queue.clear();
                            }
                            return;
                        }
                        if (payload.reason === "replaced") {
                            return;
                        }
                        if (player.loop === "track") {
                            await this.rest.update({
                                guildId: player.guildId,
                                data: {
                                    track: {
                                        encoded: player.current.encoded,
                                    },
                                },
                            });
                            return;
                        }
                        else if (player.loop === "queue") {
                            player.current.position = 0;
                            player.current.time = 0;
                            player.queue.add(player.current);
                            player.play();
                            return;
                        }
                        if (player.queue.size) {
                            player.play();
                            return;
                        }
                        if (player.autoPlay === true) {
                            let uri = `https://www.youtube.com/watch?v=${player.current.identifier}&list=RD${player.current.identifier}`;
                            let res = await this.manager.search({
                                query: uri,
                            });
                            if (!res ||
                                !res.tracks ||
                                ["loadFailed", "cleanup"].includes(res.loadType))
                                return;
                            let randomTrack = res.tracks[Math.floor(Math.random() * res.tracks.length)];
                            player.queue.add(randomTrack);
                            player.play();
                            return;
                        }
                        break;
                }
                break;
            }
        }
    }
    error() { }
    destroy() {
        this.socket.close();
        this.destroyed = true;
    }
}
exports.Node = Node;
//# sourceMappingURL=Node.js.map