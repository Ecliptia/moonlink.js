"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkNode = void 0;
const __1 = require("../..");
class MoonlinkNode {
    _manager;
    reconnectTimeout;
    reconnectAttempts = 1;
    retryAmount;
    retryDelay;
    host;
    identifier;
    password;
    port;
    secure;
    http;
    restFul;
    connected;
    resume;
    resumed;
    sessionId;
    socket;
    stats;
    calls;
    constructor(node) {
        this.check(node);
        this._manager = __1.Structure.manager;
        this.host = node.host;
        this.identifier = node.identifier || null;
        this.password = node.password || "youshallnotpass";
        this.port = node.port
            ? node.port
            : node.secure
                ? node.secure == true
                    ? 443
                    : 80
                : null;
        this.secure = node.secure || false;
        this.http = `http${node.secure ? "s" : ""}://${this.address}/v4/`;
        this.stats = {
            players: 0,
            playingPlayers: 0,
            uptime: 0,
            memory: {
                free: 0,
                used: 0,
                allocated: 0,
                reservable: 0
            },
            cpu: {
                cores: 0,
                systemLoad: 0,
                lavalinkLoad: 0
            },
            frameStats: {
                sent: 0,
                nulled: 0,
                deficit: 0
            }
        };
        this.restFul = new __1.MoonlinkRestFul(this);
    }
    init() {
        this.connect();
    }
    get address() {
        return `${this.host}:${this.port}`;
    }
    check(node) {
        if (typeof node.host !== "string" && typeof node.host !== "undefined")
            throw new Error('[ @Moonlink/Node ]: "host" option is not configured correctly');
        if (typeof node.password !== "string" &&
            typeof node.password !== "undefined")
            throw new Error('[ @Moonlink/Node ]: the option "password" is not set correctly');
        if ((node.port && typeof node.port !== "number") ||
            node.port > 65535 ||
            node.port < 0)
            throw new Error('[ @Moonlink/Node ]: the "port" option is not set correctly');
        if (typeof node.retryAmount !== "undefined" &&
            typeof node.retryAmount !== "number")
            throw new Error('[ @Moonlink/Node ]: the "retryAmount" option is not set correctly');
        if (typeof node.retryDelay !== "undefined" &&
            typeof node.retryDelay !== "number")
            throw new Error('[ @Moonlink/Node ]: the "retryDelay" option is not set correctly');
    }
    request(endpoint, params) {
        this.calls++;
        return this.rest.get(`${endpoint}?${params}`);
    }
    async connect() {
        if (this.connected)
            return;
        let headers = {
            Authorization: this.password,
            "User-Id": this._manager.options.clientId,
            "Client-Name": this._manager.options.clientName
        };
        this.socket = new __1.WebSocket(`ws${this.secure ? "s" : ""}://${address}/v4/websocket`);
        this.socket.on("open", this.open.bind(this));
        this.socket.on("close", this.close.bind(this));
        this.socket.on("message", this.message.bind(this));
        this.socket.on("error", this.error.bind(this));
    }
    open() {
        if (this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
        this.connect = true;
    }
    reconnect() {
        if (this.reconnectAttempts >= this.retryAmount) {
            this.socket.close(1000, "destroy");
            this.socket.removeAllListeners();
        }
        else {
            this.reconnectTimeout = setTimeout(() => {
                this.socket.removeAllListeners();
                this.socket = null;
                this.connected = false;
                this.connect();
                this.reconnectAttempts++;
            }, this.retryTime);
        }
    }
    close(code, reason) {
        if (code !== 1000 || reason !== "destroy")
            this.reconnect();
        this.connected = false;
    }
}
exports.MoonlinkNode = MoonlinkNode;
//# sourceMappingURL=MoonlinkNode.js.map