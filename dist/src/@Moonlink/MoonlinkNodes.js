"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkNode = void 0;
const ws_1 = __importDefault(require("ws"));
const MoonlinkPlayers_1 = require("./MoonlinkPlayers");
const MoonlinkDatabase_1 = require("../@Rest/MoonlinkDatabase");
const MoonlinkRest_1 = require("./MoonlinkRest");
const MakeRequest_1 = require("../@Rest/MakeRequest");
class MoonlinkNode {
    manager;
    host;
    port;
    password;
    identifier;
    secure;
    version;
    options;
    sPayload;
    socketUri;
    restUri;
    rest;
    resumed;
    sessionId;
    isConnected;
    ws;
    stats;
    retryTime;
    reconnectAtattempts;
    reconnectTimeout;
    resumeKey;
    resumeTimeout;
    calls;
    retryAmount;
    sendWs;
    node;
    map;
    db;
    constructor(manager, node, map) {
        this.manager = manager;
        this.map = map;
        this.node = node;
        this.host = node.host;
        this.port = node.port || null;
        this.secure = node.secure || null;
        this.options = this.manager.options;
        this.identifier = node.identifier || null;
        this.password = node.password || "youshallnotpass";
        this.calls = 0;
        this.resumeKey = manager.options.resumeKey || null;
        this.resumeTimeout = manager.options.resumeTimeout || 30000;
        this.retryTime = this.manager.options.retryTime || 30000;
        this.reconnectAtattempts = this.manager.options.reconnectAtattemps || 0;
        this.retryAmount = this.manager.options.retryAmount || 5;
        this.db = new MoonlinkDatabase_1.MoonlinkDatabase();
        this.rest = new MoonlinkRest_1.MoonlinkRest(this.manager, this);
        this.stats = {
            players: 0,
            playingPlayers: 0,
            uptime: 0,
            memory: {
                free: 0,
                used: 0,
                allocated: 0,
                reservable: 0,
            },
            cpu: {
                cores: 0,
                systemLoad: 0,
                lavalinkLoad: 0,
            },
            frameStats: {
                sent: 0,
                nulled: 0,
                deficit: 0,
            },
        };
        this.sendWs = (data) => {
            return new Promise((resolve, reject) => {
                if (!this.isConnected)
                    return resolve(false);
                if (!data || !JSON.stringify(data).startsWith("{")) {
                    return reject(false);
                }
                this.ws.send(JSON.stringify(data), (error) => {
                    if (error)
                        reject(error);
                    else
                        resolve(true);
                });
            });
        };
    }
    request(endpoint, params) {
        this.calls++;
        return this.rest.get(`${endpoint}?${params}`);
    }
    init() {
        this.manager.emit("debug", "[ @Moonlink/Node ]: starting server connection process");
        if (!this.manager.initiated)
            this.db.delete('queue');
        this.connect();
    }
    async connect() {
        if (typeof this.host !== "string" && typeof this.host !== "undefined")
            throw new Error('[ @Moonlink/Node ]: "host" option is not configured correctly');
        if (typeof this.password !== "string" && typeof this.password !== "undefined")
            throw new Error('[ @Moonlink/Node ]: the option "password" is not set correctly');
        if ((this.port && typeof this.port !== "number") ||
            this.port > 65535 ||
            this.port < 0)
            throw new Error('[ @Moonlink/Node ]: the "port" option is not set correctly');
        this.options.clientName
            ? this.options.clientName
            : (this.options.clientName = `Moonlink/${this.manager.version}`);
        this.version = await (0, MakeRequest_1.makeRequest)(`http${this.secure ? `s` : ``}://${this.host}${this.port ? `:${this.port}` : ``}/version`, {
            method: "GET",
            headers: {
                Authorization: this.password,
            },
        });
        if (this.version.replace(/\./g, '') < '400') {
            console.log('[ @Moonlink ]: Dear programmer, from new versions of moonlink.js it will only support versions above (4.0.0) please upgrade lavalink');
            return;
        }
        let headers = {
            Authorization: this.password,
            "User-Id": this.manager.clientId,
            "Client-Name": this.options.clientName,
        };
        if (this.resumeKey)
            headers["Session-Id"] = this.resumeKey;
        this.socketUri = `ws${this.secure ? "s" : ""}://${this.host ? this.host : "localhost"}${this.port ? `:${this.port}` : ":443"}/v4/websocket`;
        this.restUri = `http${this.secure ? "s" : ""}://${this.host ? this.host : "localhost"}${this.port ? `:${this.port}` : ":443"}/v4/`;
        this.ws = new ws_1.default(this.socketUri, { headers });
        this.ws.on("open", this.open.bind(this));
        this.ws.on("close", this.close.bind(this));
        this.ws.on("message", this.message.bind(this));
        this.ws.on("error", this.error.bind(this));
    }
    async open() {
        if (this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
        this.manager.emit("debug", '[ @Moonlink/Nodes ]: a new node said "hello world!"');
        this.manager.emit("nodeCreate", this);
        this.isConnected = true;
        this.rest.url = this.restUri;
    }
    reconnect() {
        if (this.reconnectAtattempts >= this.retryAmount) {
            this.manager.emit("debug", "[ @Moonlink/Node ]: a node was destroyed due to inactivity");
            this.manager.emit("nodeDestroy", this);
            this.ws.close(1000, "destroy");
            this.ws.removeAllListeners();
            this.manager.nodes.delete(this.identifier || this.host);
        }
        else {
            this.reconnectTimeout = setTimeout(() => {
                this.ws.removeAllListeners();
                this.ws = null;
                this.isConnected = false;
                this.manager.emit("nodeReconnect", this);
                this.connect();
                this.manager.emit("debug", "[ @Moonlink/Node ]: Trying to reconnect node, attempted number " +
                    this.reconnectAtattempts);
                this.reconnectAtattempts++;
            }, this.retryTime);
        }
    }
    close(code, reason) {
        if (code !== 1000 || reason !== "destroy")
            this.reconnect();
        this.manager.emit("debug", "[ @Moonlink/Nodes ]: connection was disconnected from a node");
        this.manager.emit("nodeClose", this, code, reason);
        this.isConnected = false;
    }
    async message(data) {
        if (Array.isArray(data))
            data = Buffer.concat(data);
        else if (data instanceof ArrayBuffer)
            data = Buffer.from(data);
        let payload = JSON.parse(data.toString());
        if (!payload.op)
            return;
        this.manager.emit("nodeRaw", this, payload);
        switch (payload.op) {
            case "ready":
                this.sessionId = payload.sessionId;
                this.resumed = payload.resumed;
                this.rest.setSessionId(this.sessionId);
                this.manager.emit("debug", `[ @Moonlink/Node ]:${this.resumed ? ` session was resumed, ` : ``} session is currently ${this.sessionId}`);
                if (this.manager.options.resumeKey) {
                    this.rest.patch(`sessions/${this.sessionId}`, { resumingKey: this.resumeKey, timeout: this.resumeTimeout });
                    this.manager.emit("debug", `[ @Moonlink/Node ]: Resuming configured on Lavalink`);
                }
                if (this.manager.options.autoResume) {
                    let obj = this.manager.map.get('players') || [];
                    const players = Object.keys(obj);
                    for (const player of players) {
                        if (obj[player].node === this) {
                            await this.manager.attemptConnection(obj[player].guildId);
                            this.manager.emit('playerResume', this.manager.players.get(obj[player].guildId));
                            this.manager.players.get(obj[player].guildId).restart();
                        }
                    }
                }
                break;
            case "stats":
                delete payload.op;
                this.stats = { ...payload };
                break;
            case "playerUpdate":
                let current = this.map.get(`current`) || {};
                current[payload.guildId] = {
                    ...current[payload.guildId],
                    position: payload.state.position,
                    time: payload.state.time,
                    thumbnail: `https://img.youtube.com/vi/${current[payload.guildId] ? current[payload.guildId].identifier : null}/sddefault.jpg`,
                    ping: payload.state.ping,
                };
                this.map.set("current", current);
                break;
            case "event":
                this.handleEvent(payload);
                break;
            default:
                this.manager.emit("nodeError", this, new Error(`[ @Moonlink/Nodes ]: Unexpected op "${payload.op}" with data: ${payload}`));
        }
    }
    error(err) {
        if (!err)
            return;
        this.manager.emit("nodeError", this, err);
        this.manager.emit("debug", "[ @Moonlink/Nodes ]: An error occurred in one of the lavalink(s) server connection(s)");
    }
    async handleEvent(payload) {
        if (!payload)
            return;
        if (!payload.guildId)
            return;
        if (!this.map.get("players")[payload.guildId])
            return;
        let player = new MoonlinkPlayers_1.MoonlinkPlayer(this.map.get("players")[payload.guildId], this.manager, this.map, this.rest);
        let players = this.map.get("players") || {};
        console.log(payload);
        switch (payload.type) {
            case "TrackStartEvent": {
                let current = null;
                let currents = this.map.get("current") || {};
                current = currents[payload.guildId] || null;
                if (!current)
                    return;
                players[payload.guildId] = {
                    ...players[payload.guildId],
                    playing: true,
                    paused: false,
                };
                this.map.set("players", players);
                this.manager.emit("trackStart", player, current);
                break;
            }
            case "TrackEndEvent": {
                let currents = this.map.get("current") || {};
                let track = currents[payload.guildId] || null;
                let queue = this.db.get(`queue.${payload.guildId}`);
                console.log(queue);
                players[payload.guildId] = {
                    ...players[payload.guildId],
                    playing: false,
                };
                this.map.set("players", players);
                if (["loadFailed", "cleanup"].includes(payload.reason)) {
                    if (!queue) {
                        this.db.delete(`queue.${payload.guildId}`);
                        return this.manager.emit("queueEnd", player, track);
                    }
                    player.play();
                    return;
                }
                if (payload.reason === "replaced") {
                    this.manager.emit("trackEnd", player, track, payload);
                    return;
                }
                if (track && player.loop) {
                    if (player.loop == 1) {
                        await this.rest.update({
                            guildId: payload.guildId,
                            data: {
                                encodedTrack: track.encoded
                            },
                        });
                        return;
                    }
                    if (player.loop == 2) {
                        this.manager.emit("trackEnd", player, track);
                        player.queue.add(track);
                        player.play();
                        await this.rest.update({
                            guildId: payload.guildId,
                            data: {
                                encodedTrack: track.encoded
                            },
                        });
                        return;
                    }
                    else {
                        this.manager.emit("trackEnd", player, track);
                        this.manager.emit("debug", "[ @Manager/Nodes ]: invalid loop value will be ignored!");
                    }
                }
                if (player.queue.size) {
                    this.manager.emit("trackEnd", player, track);
                    player.play();
                    return;
                }
                if (player.autoPlay) {
                    let uri = `https://www.youtube.com/watch?v=${track.identifier}&list=RD${track.identifier}`;
                    let req = await this.manager.search(uri);
                    if (!req ||
                        !req.tracks ||
                        ["loadFailed", "cleanup"].includes(req.loadType))
                        return player.stop();
                    let data = req.tracks[Math.floor(Math.random() * Math.floor(req.tracks.length))];
                    player.queue.add(data);
                    player.play();
                    return;
                }
                if (!player.queue.size) {
                    this.manager.emit("debug", "[ @Moonlink/Nodes ]: The queue is empty");
                    this.manager.emit("queueEnd", player);
                    currents[payload.guildId] = null;
                    this.map.set("current", currents);
                    this.db.delete(`queue.${payload.guildId}`);
                }
                break;
            }
            case "TrackStuckEvent": {
                let currents = this.map.get("current") || {};
                let track = currents[payload.guildId] || null;
                player.stop();
                this.manager.emit("trackStuck", player, track);
                break;
            }
            case "TrackExceptionEvent": {
                let currents = this.map.get("current") || {};
                let track = currents[payload.guildId] || null;
                player.stop();
                this.manager.emit("trackError", player, track);
                break;
            }
            case "WebSocketClosedEvent": {
                this.manager.emit("socketClosed", player, payload);
                break;
            }
            default: {
                const error = new Error(`[ @Moonlink/Nodes ] unknown event '${payload.type}'.`);
                this.manager.emit("nodeError", this, error);
            }
        }
    }
}
exports.MoonlinkNode = MoonlinkNode;
//# sourceMappingURL=MoonlinkNodes.js.map