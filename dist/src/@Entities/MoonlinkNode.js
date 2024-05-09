"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkNode = void 0;
const ws_1 = __importDefault(require("ws"));
const index_1 = require("../../index");
class MoonlinkNode {
    _manager = index_1.Structure.manager;
    reconnectTimeout;
    reconnectAttempts = 1;
    retryAmount = 6;
    retryDelay = 120000;
    resumeStatus = false;
    host;
    identifier;
    password;
    port;
    secure;
    regions;
    http;
    rest;
    info = {};
    version;
    resume = index_1.Structure.manager.options?.resume;
    resumed;
    autoResume = index_1.Structure.manager.options?.autoResume;
    resumeTimeout = 30000;
    sessionId;
    socket;
    state = "DISCONNECTED";
    stats = {};
    calls = 0;
    constructor(node) {
        this.check(node);
        this.host = node.host;
        this.identifier = node.identifier || null;
        this.password = node.password ? node.password : "youshallnotpass";
        this.port = node.port ? node.port : node.secure == true ? 443 : 80;
        this.secure = node.secure || false;
        this.regions = node.regions;
        this.http = `http${node.secure ? "s" : ""}://${this.address}/v4/`;
        this.rest = new (index_1.Structure.get("MoonlinkRestFul"))(this);
        if (node.sessionId)
            this.sessionId = node.sessionId;
        this.connect();
    }
    get address() {
        return `${this.host}:${this.port}`;
    }
    check(node) {
        if (typeof node.host !== "string" && typeof node.host !== "undefined")
            throw new Error('@Moonlink(Nodes) - "host" option is not configured correctly');
        if (typeof node.password !== "string" &&
            typeof node.password !== "undefined")
            throw new Error('@Moonlink(Nodes) - the option "password" is not set correctly');
        if ((node.port && typeof node.port !== "number") ||
            node.port > 65535 ||
            node.port < 0)
            throw new Error('@Moonlink(Nodes) - the "port" option is not set correctly');
        if (typeof node.retryAmount !== "undefined" &&
            typeof node.retryAmount !== "number")
            throw new Error('@Moonlink(Nodes) - the "retryAmount" option is not set correctly');
        if (typeof node.retryDelay !== "undefined" &&
            typeof node.retryDelay !== "number")
            throw new Error('@Moonlink(Nodes) - the "retryDelay" option is not set correctly');
    }
    request(endpoint, params) {
        this.calls++;
        return this.rest.get(`${endpoint}?${params}`);
    }
    async connect() {
        if (this.state == "CONNECTED" || this.state == "READY")
            return;
        this.state = "CONNECTING";
        let headers = {
            Authorization: this.password,
            "User-Id": this._manager.options.clientId,
            "Client-Name": this._manager.options.clientName
        };
        if (this.resume)
            headers["Session-Id"] = index_1.Structure.db.get(`sessionId.${this.identifier ?? this.host.replace(/\./g, "-")}`);
        this.socket = new ws_1.default(`ws${this.secure ? "s" : ""}://${this.address}/v4/websocket`, { headers });
        this.socket.on("open", this.open.bind(this));
        this.socket.on("close", this.close.bind(this));
        this.socket.on("message", this.message.bind(this));
        this.socket.on("error", this.error.bind(this));
    }
    open() {
        if (this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
        this._manager.emit("debug", `@Moonlink(Node) - The Node ${this.identifier ?? this.host} has been connected successfully`);
        this._manager.emit("nodeCreate", this);
        this.state = "CONNECTED";
    }
    reconnect() {
        if (this.reconnectAttempts >= this.retryAmount) {
            this._manager.emit("debug", `@Moonlink(Node) - Node ${this.identifier ?? this.host} was destroyed due to inactivity, attempts to reconnect were failed`);
            this._manager.emit("nodeDestroy", this);
            this.socket.close(1000, "destroy");
            this.socket.removeAllListeners();
        }
        else {
            this.reconnectTimeout = setTimeout(() => {
                this.socket.removeAllListeners();
                this.socket = null;
                this.state = "RECONNECTING";
                this._manager.emit("nodeReconnect", this);
                this.connect();
                this._manager.emit("debug", `@Moonlink(Node) - We are trying to reconnect node ${this.identifier ?? this.host}, attempted number ${this.reconnectAttempts}
                `);
                if (this.getAllPlayers.length &&
                    this._manager.options?.switchPlayersAnotherNode)
                    this.movePlayers();
                this.reconnectAttempts++;
            }, this.retryDelay);
        }
    }
    close(code, reason) {
        if (code !== 1000 || reason !== "destroy")
            this.reconnect();
        this._manager.emit("debug", `@Moonlink(Node) - The node connection ${this.identifier ?? this.host} has been closed`);
        this._manager.emit("nodeClose", this, code, reason);
        this.getAllPlayers.forEach(player => {
            player.playing = false;
        });
        this.state = "DISCONNECTED";
    }
    error(error) {
        if (!error)
            return;
        this._manager.emit("nodeError", this, error);
        this._manager.emit("debug", `@Moonlink(Nodes) - The ${this.identifier ?? this.host} an error has occurred: 
                ${error}`);
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
                this.resume
                    ? index_1.Structure.db.set(`sessionId.${this.identifier ?? this.host.replace(/\./g, "-")}`, this.sessionId)
                    : null;
                this.resumed = payload.resumed;
                this.rest.setSessionId(this.sessionId);
                this.state = "READY";
                if (!this._manager.initiated && !this.resumed) {
                    index_1.Structure.db.delete("queue");
                    index_1.Structure.db.delete("players");
                }
                this._manager.emit("debug", `@Moonlink(Node) - ${this.resumed ? ` session was resumed,` : ``} session is currently ${this.sessionId}`);
                this._manager.emit("nodeReady", this, this.sessionId, this.resumed);
                if (this.resume) {
                    this.rest.patch(`sessions/${this.sessionId}`, {
                        data: {
                            resuming: this.resume,
                            timeout: this.resumeTimeout
                        }
                    });
                    this._manager.emit("debug", `@Moonlink(Nodes) - Resuming configured`);
                }
                this.version = await this.rest.getVersion();
                this.info = await this.rest.getInfo();
                if (this.autoResume) {
                    let resumePlayers = this.getAllPlayers;
                    for (const resumePlayer of resumePlayers) {
                        resumePlayer.restart();
                    }
                }
                if (this.resumed) {
                    const resumedPlayers = await this.rest.get(`sessions/${this.sessionId}/players`);
                    for (const resumedPlayer of resumedPlayers) {
                        const previousInfosPlayer = index_1.Structure.db.get(`players.${resumedPlayer.guildId}`) || {};
                        const player = this._manager.players.create({
                            guildId: resumedPlayer.guildId,
                            voiceChannel: previousInfosPlayer.voiceChannel,
                            textChannel: previousInfosPlayer.textChannel,
                            volume: previousInfosPlayer.volume,
                            loop: previousInfosPlayer.loop,
                            autoPlay: previousInfosPlayer.autoPlay,
                            autoLeave: previousInfosPlayer.autoLeave,
                            node: this.identifier ?? this.host,
                            notBackup: true
                        });
                        player.previous = previousInfosPlayer.previous;
                        if (resumedPlayer.track) {
                            const track = new (index_1.Structure.get("MoonlinkTrack"))(resumedPlayer.track);
                            player.current = track;
                            player.current.position =
                                resumedPlayer.state.position;
                            await player.restart();
                        }
                    }
                    this._manager.emit("nodeResumed", this, resumedPlayers);
                }
                break;
            case "stats":
                delete payload.op;
                this.stats = { ...payload };
                break;
            case "playerUpdate":
                let player = this._manager.players.get(payload.guildId);
                if (!player)
                    return;
                player.ping = payload.state.ping;
                if (!player.current)
                    return;
                player.current.position = payload.state.position;
                player.current.time = payload.state.time;
                this._manager.emit("playerUpdate", player, payload, this);
                break;
            case "event":
                this.handleEvent(payload);
                break;
            default:
                this._manager.emit("nodeError", this, new Error(`@Moonlink(Nodes) - Unexpected op "${payload.op}" with data: ${payload}`));
        }
    }
    async handleEvent(payload) {
        if (!payload)
            return;
        if (!payload.guildId)
            return;
        if (!this._manager.players.has(payload.guildId))
            return;
        let player = this._manager.players.get(payload.guildId);
        switch (payload.type) {
            case "TrackStartEvent": {
                if (!player.current)
                    player.current = new (index_1.Structure.get("MoonlinkTrack"))(payload.track);
                player.playing = true;
                player.paused = false;
                this._manager.emit("trackStart", player, player.current);
                break;
            }
            case "TrackEndEvent": {
                let track = player.current;
                let queue = player.queue.all;
                player.playing = false;
                if (this._manager.options.previousTracksInArray)
                    player.previous.push(track);
                else
                    player.previous = track;
                if (["loadFailed", "cleanup"].includes(payload.reason)) {
                    if (!queue) {
                        player.queue.clear();
                        {
                            this._manager.emit("trackEnd", player, track, payload);
                            this._manager.emit("queueEnd", player, track);
                            return;
                        }
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
                            data: { track: { encoded: payload.track.encoded } }
                        });
                        if (this.resumed)
                            player.current = new (index_1.Structure.get("MoonlinkTrack"))(payload.track);
                        return;
                    }
                    if (player.loop == 2) {
                        player.queue.add(new (index_1.Structure.get("MoonlinkTrack"))(payload.track));
                        if (!queue || queue.length === 0)
                            return this._manager.emit("trackEnd", player, track, payload);
                        player.play();
                        return;
                    }
                    else {
                        this._manager.emit("trackEnd", player, track);
                        this._manager.emit("debug", "@Manager(Nodes) - invalid loop value will be ignored!");
                    }
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
                    this._manager.emit("trackEnd", player, track, payload);
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
                if (player.autoLeave) {
                    player.destroy();
                    this._manager.emit("autoLeaved", player, track);
                }
                if (!player.queue.size) {
                    this._manager.emit("debug", "@Moonlink(Nodes) - The queue is empty");
                    this._manager.emit("trackEnd", player, track, payload);
                    this._manager.emit("queueEnd", player);
                    player.current = null;
                    player.queue.clear();
                }
                break;
            }
            case "TrackStuckEvent": {
                this._manager.emit("trackStuck", player, player.current);
                player.stop();
                break;
            }
            case "TrackExceptionEvent": {
                this._manager.emit("trackError", player, player.current);
                player.stop();
                break;
            }
            case "WebSocketClosedEvent": {
                this._manager.emit("socketClosed", player, payload);
                break;
            }
            default: {
                const error = new Error(`@Moonlink(Nodes) - unknown event '${payload.type}'.`);
                this._manager.emit("nodeError", this, error);
            }
        }
    }
    movePlayers() {
        this.getAllPlayers.forEach(player => {
            let anotherNode = this._manager.nodes.sortByUsage(this._manager.options?.sortNode ?? "players")[0];
            this._manager.emit("debug", `@Moonlink(Node) - Moving player ${player.guildId} to ${anotherNode.identifier ?? anotherNode.host}`);
            player.transferNode(anotherNode);
        });
        return true;
    }
    get getAllPlayers() {
        return Object.values(this._manager.players.all).filter(player => player.node === this);
    }
}
exports.MoonlinkNode = MoonlinkNode;
