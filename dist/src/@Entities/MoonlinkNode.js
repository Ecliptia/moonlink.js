"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkNode = void 0;
const index_1 = require("../../index");
class MoonlinkNode {
    _manager;
    reconnectTimeout;
    reconnectAttempts = 1;
    retryAmount;
    retryDelay;
    resumeStatus = false;
    host;
    identifier;
    password;
    port;
    secure;
    http;
    rest;
    connected;
    resume;
    resumed;
    resumeTimeout = 30000;
    sessionId;
    socket;
    stats;
    calls;
    db;
    constructor(node) {
        this._manager = index_1.Structure.manager;
        this.check(node);
        this.host = node.host;
        this.identifier = node.identifier || null;
        this.password = node.password ? node.password : "youshallnotpass";
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
        this.rest = new index_1.MoonlinkRestFul(this);
        this.db = new (index_1.Structure.get("MoonlinkDatabase"))(this._manager.options.clientId);
        this.connect();
    }
    init() { }
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
        this.socket = new index_1.WebSocket(`ws${this.secure ? "s" : ""}://${this.address}/v4/websocket`, { headers });
        this.socket.on("open", this.open.bind(this));
        this.socket.on("close", this.close.bind(this));
        this.socket.on("message", this.message.bind(this));
        this.socket.on("error", this.error.bind(this));
    }
    open() {
        if (this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
        this.connected = true;
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
            }, this.retryDelay);
        }
    }
    close(code, reason) {
        if (code !== 1000 || reason !== "destroy")
            this.reconnect();
        this.connected = false;
    }
    async message(data) {
        if (Array.isArray(data))
            data = Buffer.concat(data);
        else if (data instanceof ArrayBuffer)
            data = Buffer.from(data);
        let payload = JSON.parse(data.toString("utf8"));
        if (!payload.op)
            return;
        this._manager.emit("nodeRaw", this, payload);
        switch (payload.op) {
            case "ready":
                this.sessionId = payload.sessionId;
                this.resume ? this.db.set("sessionId", this.sessionId) : null;
                this.resumed = payload.resumed;
                this._manager.nodes.map.set("sessionId", payload.sessionId);
                this.rest.setSessionId(this.sessionId);
                if (!this._manager.initiated && !this.resumed) {
                    this.db.delete("queue");
                    this.db.delete("players");
                }
                this._manager.emit("debug", `[ @Moonlink/Node ]:${this.resumed ? ` session was resumed, ` : ``} session is currently ${this.sessionId}`);
                if (this.resume && this.resumeStatus) {
                    this.rest.patch(`sessions/${this.sessionId}`, {
                        data: {
                            resuming: this.resumeStatus,
                            timeout: this.resumeTimeout
                        }
                    });
                    this._manager.emit("debug", `[ @Moonlink/Node ]: Resuming configured on Lavalink`);
                }
                if (this._manager.options.autoResume) {
                    let obj = this._manager.players.map.get("players") || [];
                    const players = Object.keys(obj);
                    for (const player of players) {
                        if (obj[player].node == this.host) {
                            await this._manager.players.attemptConnection(obj[player].guildId);
                            this._manager.emit("playerResume", this._manager.players.get(obj[player].guildId));
                            this._manager.players
                                .get(obj[player].guildId)
                                .restart();
                        }
                    }
                }
                if (this.resumed) {
                    let players = await this.rest.get(`sessions/${this.sessionId}/players`);
                    for (const player of players) {
                        let previousInfosPlayer = this.db.get(`players.${player.guildId}`) || {};
                        let playerClass = this._manager.players.create({
                            guildId: player.guildId,
                            voiceChannel: previousInfosPlayer.voiceChannel,
                            textChannel: previousInfosPlayer.textChannel,
                            node: this.host
                        });
                        playerClass.connect({
                            setDeaf: true,
                            setMute: false
                        });
                        playerClass.set("playing", true);
                        playerClass.set("conneted", true);
                        let track = new (index_1.Structure.get("MoonlinkTrack"))(player.track);
                        let current = this._manager.players.map.get("current") || {};
                        current[player.guildId] = track;
                        this._manager.players.map.set("current", current);
                    }
                }
                break;
            case "stats":
                delete payload.op;
                this.stats = { ...payload };
                break;
            case "playerUpdate":
                let current = this._manager.players.map.get(`current`) || {};
                let player = this._manager.players.get(payload.guildId);
                const _manager = this._manager;
                current[payload.guildId] = {
                    ...current[payload.guildId],
                    get position() {
                        let player = _manager.players.get(payload.guildId);
                        if (player && player.paused) {
                            return payload.state.position;
                        }
                        if (player && !player.node.isConnected) {
                            return payload.state.position;
                        }
                        if (!player)
                            return payload.state.position;
                        return (payload.state.position +
                            (Date.now() - payload.state.time));
                    },
                    time: payload.state.time,
                    ping: payload.state.ping
                };
                this._manager.players.map.set("current", current);
                break;
            case "event":
                this.handleEvent(payload);
                break;
            default:
                this._manager.emit("nodeError", this, new Error(`[ @Moonlink/Nodes ]: Unexpected op "${payload.op}" with data: ${payload}`));
        }
    }
    error(error) {
        if (!error)
            return;
        this._manager.emit("nodeError", this, error);
        this._manager.emit("debug", "[ @Moonlink/Nodes ]: An error occurred in one of the lavalink(s) server connection(s): " +
            error);
    }
    async handleEvent(payload) {
        if (!payload)
            return;
        if (!payload.guildId)
            return;
        if (!this._manager.players.map.get("players")[payload.guildId])
            return;
        let player = new (index_1.Structure.get("MoonlinkPlayer"))(this._manager.players.map.get("players")[payload.guildId], this._manager, this._manager.players.map);
        let players = this._manager.players.map.get("players") || {};
        switch (payload.type) {
            case "TrackStartEvent": {
                let current = null;
                let currents = this._manager.players.map.get("current") || {};
                current = currents[payload.guildId] || null;
                if (!current)
                    return;
                players[payload.guildId] = {
                    ...players[payload.guildId],
                    playing: true,
                    paused: false
                };
                this._manager.players.map.set("players", players);
                this._manager.emit("trackStart", player, current);
                break;
            }
            case "TrackEndEvent": {
                let currents = this._manager.players.map.get("current") || {};
                let previousData = this._manager.players.map.get("previous") || {};
                let track = currents[payload.guildId] || null;
                let queue = this.db.get(`queue.${payload.guildId}`);
                players[payload.guildId] = {
                    ...players[payload.guildId],
                    playing: false
                };
                previousData[payload.guildId] = {
                    ...track
                };
                this._manager.players.map.set("players", players);
                this._manager.players.map.set("previous", previousData);
                if (["loadFailed", "cleanup"].includes(payload.reason)) {
                    if (!queue) {
                        this.db.delete(`queue.${payload.guildId}`);
                        return this._manager.emit("queueEnd", player, track);
                    }
                    player.play();
                    return;
                }
                if (payload.reason === "replaced") {
                    this._manager.emit("trackEnd", player, track, payload);
                    return;
                }
                if (track && player.loop) {
                    if (player.loop == 1) {
                        await this.rest.update({
                            guildId: payload.guildId,
                            data: {
                                encodedTrack: track.encoded
                            }
                        });
                        return;
                    }
                    if (player.loop == 2) {
                        player.queue.add(track);
                        if (!queue || queue.length === 0)
                            return this._manager.emit("trackEnd", player, track, payload);
                        player.current = queue.shift();
                        player.play();
                        return;
                    }
                    else {
                        this._manager.emit("trackEnd", player, track);
                        this._manager.emit("debug", "[ @_manager/Nodes ]: invalid loop value will be ignored!");
                    }
                }
                if (player.queue.size && player.data.shuffled) {
                    let currentQueue = this.db.get(`queue.${payload.guildId}`);
                    const randomIndex = Math.floor(Math.random() * currentQueue.length);
                    const shuffledTrack = currentQueue.splice(randomIndex, 1)[0];
                    currentQueue.unshift(shuffledTrack);
                    this.db.set(`queue.${payload.guildId}`, currentQueue);
                    player.play();
                    return;
                }
                if (player.queue.size) {
                    this._manager.emit("trackEnd", player, track);
                    player.play();
                    return;
                }
                if (typeof player.autoPlay === "boolean" &&
                    player.autoPlay === true) {
                    if (payload.reason == "stopped")
                        return;
                    let uri = `https://www.youtube.com/watch?v=${track.identifier}&list=RD${track.identifier}`;
                    let req = await this._manager.search(uri);
                    if (!req ||
                        !req.tracks ||
                        ["loadFailed", "cleanup"].includes(req.loadType))
                        return player.stop();
                    let data = req.tracks[Math.floor(Math.random() * Math.floor(req.tracks.length))];
                    player.queue.add(data);
                    player.play();
                    return;
                }
                if (player.data.autoLeave) {
                    player.destroy();
                    this._manager.emit("autoLeaved", player, track);
                }
                if (!player.queue.size) {
                    this._manager.emit("debug", "[ @Moonlink/Nodes ]: The queue is empty");
                    this._manager.emit("queueEnd", player);
                    currents[payload.guildId] = null;
                    this._manager.players.map.set("current", currents);
                    this.db.delete(`queue.${payload.guildId}`);
                }
                break;
            }
            case "TrackStuckEvent": {
                let currents = this._manager.players.map.get("current") || {};
                let track = currents[payload.guildId] || null;
                player.stop();
                this._manager.emit("trackStuck", player, track);
                break;
            }
            case "TrackExceptionEvent": {
                let currents = this._manager.players.map.get("current") || {};
                let track = currents[payload.guildId] || null;
                player.stop();
                this._manager.emit("trackError", player, track);
                break;
            }
            case "WebSocketClosedEvent": {
                this._manager.emit("socketClosed", player, payload);
                break;
            }
            default: {
                const error = new Error(`[ @Moonlink/Nodes ] unknown event '${payload.type}'.`);
                this._manager.emit("nodeError", this, error);
            }
        }
    }
}
exports.MoonlinkNode = MoonlinkNode;
//# sourceMappingURL=MoonlinkNode.js.map