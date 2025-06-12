"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
const index_1 = require("../../index");
const ws_1 = __importDefault(require("ws"));
class Node {
    manager;
    uuid;
    host;
    port;
    identifier;
    password;
    pathVersion;
    connected = false;
    destroyed = false;
    reconnectTimeout;
    reconnectAttempts = 0;
    retryAmount;
    retryDelay = 60000;
    resumed = false;
    resumeTimeout = 60000;
    regions;
    secure;
    sessionId;
    socket;
    stats;
    info;
    version;
    url;
    rest;
    constructor(manager, config) {
        this.manager = manager;
        this.uuid = (0, index_1.generateUUID)(config.host, config.port);
        this.host = config.host;
        this.port = config.port;
        this.identifier = config.identifier;
        this.password = config.password || "youshallnotpass";
        this.regions = config.regions;
        this.pathVersion = config.pathVersion || "v4";
        this.retryDelay = config.retryDelay || 30000;
        this.retryAmount = config.retryAmount || 5;
        this.secure = config.secure;
        this.sessionId = config.sessionId;
        this.url = `${this.secure ? "https" : "http"}://${this.address}/${this.pathVersion}/`;
        this.rest = new index_1.Rest(this);
        this.manager.emit("debug", `Moonlink.js > Node > Constructor > New node initialized: ${this.identifier} (${this.host}:${this.port}) UUID: ${this.uuid}`);
    }
    get address() {
        return `${this.host}:${this.port}`;
    }
    connect() {
        this.manager.emit("debug", `Moonlink.js > Node > Connect > Attempting connection to ${this.identifier} (${this.host}:${this.port}) UUID: ${this.uuid}`);
        let sessionId = this.manager.database.get(`nodes.${this.uuid}.sessionId`);
        let headers = {
            Authorization: this.password,
            "User-Id": this.manager.options.clientId,
            "Client-Name": this.manager.options.clientName,
        };
        if (this.manager.options.resume && sessionId) {
            headers["Session-Id"] = sessionId;
            this.manager.emit("debug", `Moonlink.js > Node > Connect > Using resume session ID: ${sessionId} for ${this.identifier}`);
        }
        this.socket = new ws_1.default(`ws${this.secure ? "s" : ""}://${this.address}/${this.pathVersion}/websocket`, {
            headers,
        });
        this.socket.addEventListener("open", this.open.bind(this), { once: true });
        this.socket.addEventListener("close", this.close.bind(this), { once: true });
        this.socket.addEventListener("message", this.message.bind(this));
        this.socket.addEventListener("error", this.error.bind(this));
        this.manager.emit("debug", `Moonlink.js > Node (${this.identifier ? this.identifier : this.address}) is ready for attempting to connect.`);
        this.manager.emit("nodeCreate", this);
        this.manager.emit("debug", `Moonlink.js > Node > Connect > WebSocket handlers attached to ${this.identifier}`);
    }
    reconnect() {
        const delay = Math.min(this.retryDelay * Math.pow(1.5, this.reconnectAttempts), 300000);
        this.manager.emit("debug", `Moonlink.js > Node (${this.identifier}) attempting to reconnect in ${delay / 1000}s (Attempt ${this.reconnectAttempts + 1}/${this.retryAmount})`);
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, delay);
        if (this.getPlayersCount > 0) {
            this.getPlayers().forEach(player => {
                player.playing = false;
            });
        }
        if (this.getPlayersCount > 0 && this.manager.options.movePlayersOnReconnect) {
            let node = this.manager.nodes.sortByUsage(this.manager.options.sortTypeNode || "players");
            if (!node) {
                this.manager.emit("debug", "Moonlink.js > Node > Wait node is avaliable.");
            }
            else {
                this.manager.emit("debug", "Moonlink.js > Node > Moving " +
                    this.getPlayersCount +
                    "players from node " +
                    this.uuid +
                    " to node " +
                    node.uuid +
                    ".");
                this.getPlayers().forEach(player => {
                    player.transferNode(node);
                });
            }
        }
        this.manager.emit("debug", `Moonlink.js > Node (${this.identifier ? this.identifier : this.address}) is attempting to reconnect.`);
        this.manager.emit("nodeReconnect", this);
    }
    open() {
        if (this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
        this.connected = true;
        this.manager.emit("debug", `Moonlink.js > Node (${this.identifier ? this.identifier : this.address}) has connected.`);
        this.manager.emit("nodeConnected", this);
    }
    close({ code, reason }) {
        if (this.connected)
            this.connected = false;
        this.socket.close();
        if (this.retryAmount > this.reconnectAttempts) {
            this.reconnect();
        }
        else {
            this.socket = null;
            this.destroyed = true;
        }
        this.manager.emit("debug", `Moonlink.js > Node (${this.identifier ? this.identifier : this.address}) has disconnected with code ${code} and reason ${reason}.`);
        this.manager.emit("nodeDisconnect", this, code, reason);
    }
    async message({ data }) {
        let payload = JSON.parse(data);
        this.manager.emit("nodeRaw", this, payload);
        switch (payload.op) {
            case "ready":
                this.sessionId = payload.sessionId;
                this.info = await this.rest.getInfo();
                this.version = this.info.version;
                this.resumed = payload.resumed;
                this.manager.database.set(`nodes.${this.uuid}.sessionId`, this.sessionId);
                if (this.manager.options.resume) {
                    this.rest.patch(`sessions/${this.sessionId}`, {
                        data: {
                            resuming: this.manager.options.resume,
                            timeout: this.resumeTimeout,
                        },
                    });
                    this.manager.emit("debug", "Moonlink.js > Node > Resuming node " + this.uuid + ".");
                }
                this.manager.emit("debug", `Moonlink.js > Node (${this.identifier ? this.identifier : this.address}) has been ready.`);
                this.manager.emit("nodeReady", this, payload);
                if (this.getPlayersCount > 0 && this.manager.options.autoResume) {
                    this.manager.emit("debug", "Moonlink.js > Node > Auto-resuming " +
                        this.getPlayersCount +
                        " players from node " +
                        this.uuid +
                        ".");
                    await this.getPlayers().forEach(player => {
                        player.playing = true;
                        player.restart();
                    });
                    this.manager.emit("debug", "Moonlink.js > Node > Auto-resumed " +
                        this.getPlayersCount +
                        " players from node " +
                        this.uuid +
                        ".");
                    this.manager.emit("nodeAutoResumed", this, this.getPlayers());
                }
                if (this.manager.options.resume && this.resumed) {
                    let players = await this.rest.getPlayers(this.sessionId);
                    players.forEach(async (player) => {
                        let guildId = player.guildId;
                        let storage = this.manager.database.get(`players.${guildId}`);
                        let queue = this.manager.database.get(`queues.${guildId}`);
                        let current = storage.current;
                        if (!storage)
                            return;
                        console.log(this.uuid);
                        let reconstructedPlayer = this.manager.createPlayer({
                            ...storage,
                            node: this.identifier ?? this.uuid,
                        });
                        await reconstructedPlayer.connect({
                            setDeaf: false,
                            setMute: false,
                        });
                        reconstructedPlayer.current = new index_1.Track((0, index_1.decodeTrack)(current.encoded));
                        if (queue?.tracks) {
                            let tracks = queue.tracks.map(track => new index_1.Track((0, index_1.decodeTrack)(track)));
                            this.manager.database.delete(`queues.${guildId}`);
                            for (let track of tracks) {
                                reconstructedPlayer.queue.add(track);
                            }
                        }
                        this.manager.emit("debug", "Moonlink.js > Player " + guildId + " has been resumed on node " + this.uuid + ".");
                    });
                }
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
                this.manager.emit("playerUpdate", player, player.current, payload);
                if (!player.get("sendPlayerUpdateDebug")) {
                    this.manager.emit("debug", "Moonlink.js > Player " +
                        player.guildId +
                        " has been updated with position " +
                        payload.state.position +
                        " and time " +
                        payload.state.time +
                        " and ping " +
                        payload.state.ping +
                        "ms.");
                    player.set("sendPlayerUpdateDebug", true);
                }
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
                        this.manager.emit("debug", "Moonlink.js > Player " +
                            player.guildId +
                            " has started the track: " +
                            player.current.title);
                        if (player.get("attemptingToReconnect")) {
                            player.set("attemptingToReconnect", 0);
                            this.manager.emit("debug", "Moonlink.js > Player " +
                                player.guildId +
                                " has successfully reconnected to the node " +
                                this.uuid +
                                ".");
                        }
                        break;
                    case "TrackEndEvent":
                        if (!player.current)
                            this.manager.emit("debug", "Moonlink.js > Player " +
                                player.guildId +
                                " has ended the track for reason " +
                                payload.reason +
                                ". But the current track is null. " +
                                player.current?.encoded);
                        let track = new (index_1.Structure.get("Track"))({ ...payload.track }, player.current.requestedBy);
                        player.playing = false;
                        player.paused = false;
                        player.set("sendPlayerUpdateDebug", false);
                        this.manager.options.previousInArray
                            ? player.previous.push(track)
                            : (player.previous = track);
                        this.manager.emit("trackEnd", player, player.current, payload.reason, payload);
                        if (player.destroyed) {
                            this.manager.emit("debug", "Moonlink.js > Player " +
                                player.guildId +
                                " has been destroyed. No need to process the end of the track.");
                            return;
                        }
                        if (["loadFailed", "cleanup"].includes(payload.reason)) {
                            if (player.queue.size) {
                                player.play();
                            }
                            else {
                                player.queue.clear();
                            }
                            this.manager.emit("debug", "Moonlink.js > Player " +
                                player.guildId +
                                " has ended the track for reason " +
                                payload.reason +
                                ".");
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
                            this.manager.emit("debug", "Moonlink.js > Player " + player.guildId + " is looping the track.");
                            return;
                        }
                        else if (player.loop === "queue") {
                            player.current.position = 0;
                            player.current.time = 0;
                            player.queue.add(player.current);
                            player.play();
                            this.manager.emit("debug", "Moonlink.js > Player " + player.guildId + " is looping the queue.");
                            return;
                        }
                        if (player.queue.size) {
                            player.play();
                            return;
                        }
                        if (player.autoPlay && player.current.sourceName === "youtube") {
                            let uri = `https://www.youtube.com/watch?v=${player.current.identifier}&list=RD${player.current.identifier}`;
                            let res = await this.manager.search({
                                query: uri,
                            });
                            if (payload.reason === "stopped") {
                                this.manager.emit("debug", "Moonlink.js > Player " + player.guildId + " is autoplay payload reason stopped ");
                            }
                            else if (!res || !res.tracks || ["loadFailed", "cleanup"].includes(res.loadType)) {
                                this.manager.emit("debug", "Moonlink.js > Player " +
                                    player.guildId +
                                    " is autoplay payload is error loadType");
                            }
                            else {
                                let randomTrack = res.tracks[Math.floor(Math.random() * res.tracks.length)];
                                if (randomTrack) {
                                    player.queue.add(randomTrack);
                                    player.play();
                                    this.manager.emit("debug", "Moonlink.js > Player " +
                                        player.guildId +
                                        " is autoplaying track " +
                                        randomTrack.title);
                                    return;
                                }
                                else {
                                    this.manager.emit("debug", "Moonlink.js > Player " + player.guildId + " is autoplay failed ");
                                }
                            }
                        }
                        if (player.autoPlay && player.current.sourceName?.toLowerCase() == "spotify") {
                            if (player.current.pluginInfo?.MoonlinkInternal) {
                                let uri = `sprec:seed_tracks=${player.current.identifier}`;
                                let res = await this.manager.search({
                                    query: uri,
                                });
                                if (payload.reason === "stopped") {
                                    this.manager.emit("debug", "Moonlink.js > Player " + player.guildId + " is autoplay payload reason stopped ");
                                }
                                else if (!res || !res.tracks || ["loadFailed", "cleanup"].includes(res.loadType)) {
                                    this.manager.emit("debug", "Moonlink.js > Player " +
                                        player.guildId +
                                        " is autoplay payload is error loadType");
                                }
                                else {
                                    let randomTrack = res.tracks[Math.floor(Math.random() * res.tracks.length)];
                                    if (randomTrack) {
                                        player.queue.add(randomTrack);
                                        player.play();
                                        this.manager.emit("debug", "Moonlink.js > Player " +
                                            player.guildId +
                                            " is autoplaying track " +
                                            randomTrack.title);
                                        return;
                                    }
                                    else {
                                        this.manager.emit("debug", "Moonlink.js > Player " + player.guildId + " is autoplay failed ");
                                    }
                                }
                            }
                        }
                        if (player.autoLeave) {
                            player.destroy();
                            this.manager.emit("autoLeaved", player, player.current);
                            this.manager.emit("queueEnd", player, player.current);
                            this.manager.emit("debug", "Moonlink.js > Player " +
                                player.guildId +
                                " has been destroyed because of autoLeave.");
                            return;
                        }
                        if (!player.queue.size) {
                            player.current = null;
                            player.queue.clear();
                            this.manager.emit("queueEnd", player, player.current);
                            this.manager.emit("debug", "Moonlink.js > Player " +
                                player.guildId +
                                " has been cleared because of empty queue.");
                        }
                        break;
                    case "TrackStuckEvent": {
                        this.manager.emit("trackStuck", player, player.current, payload.thresholdMs);
                        this.manager.emit("debug", "Moonlink.js > Player " +
                            player.guildId +
                            " has been stuck for " +
                            payload.thresholdMs +
                            "ms.");
                        break;
                    }
                    case "TrackExceptionEvent": {
                        this.manager.emit("trackException", player, player.current, payload.exception);
                        this.manager.emit("debug", "Moonlink.js > Player " +
                            player.guildId +
                            " has an exception: " +
                            JSON.stringify(payload.exception));
                        break;
                    }
                    case "WebSocketClosedEvent": {
                        this.manager.emit("socketClosed", player, payload.code, payload.reason, payload.byRemote);
                        this.manager.emit("debug", "Moonlink.js > Player " +
                            player.guildId +
                            " has been closed with code " +
                            payload.code +
                            " and reason " +
                            payload.reason);
                        if (player.playing && player.queue.size > 0) {
                            if (player.get("attemptingToReconnect") ?? 0 < 6) {
                                await player.connect({});
                                await player.restart();
                                this.manager.emit("debug", "Moonlink.js > Player " + player.guildId + " is web socket closed and attempting to reconnect.");
                                this.manager.emit("playerReconnect", player, "webSocketClosed");
                                player.set("attemptingToReconnect", (player.get("attemptingToReconnect") ?? 0) + 1);
                            }
                            else {
                                player.destroy("webSocketClosed");
                                this.manager.emit("debug", "Moonlink.js > Player " + player.guildId + " has been destroyed because of too many failed attempts to reconnect.");
                            }
                            break;
                        }
                    }
                }
                break;
            }
        }
    }
    error({ error }) {
        this.manager.emit("nodeError", this, error);
    }
    destroy() {
        this.socket.close();
        this.destroyed = true;
    }
    getSystemStats() {
        if (!this.stats)
            return { cpuLoad: 0, memoryUsage: 0 };
        return {
            cpuLoad: this.stats.cpu ? this.stats.cpu.systemLoad : 0,
            memoryUsage: this.stats.memory ? this.stats.memory.used : 0
        };
    }
    isOverloaded(cpuThreshold = 80, memoryThreshold = 80) {
        const stats = this.getSystemStats();
        return stats.cpuLoad > cpuThreshold || stats.memoryUsage > memoryThreshold;
    }
    async migrateAllPlayers(targetNode) {
        if (!this.getPlayersCount)
            return;
        const destination = targetNode || this.manager.nodes.sortByUsage(this.manager.options.sortTypeNode || "players")[0];
        if (!destination) {
            this.manager.emit('debug', 'Moonlink.js > Node > No nodes available for migration');
            return;
        }
        for (const player of this.getPlayers()) {
            try {
                await player.transferNode(destination);
                this.manager.emit('debug', `Moonlink.js > Node > Player ${player.guildId} successfully migrated to ${destination.identifier}`);
            }
            catch (error) {
                this.manager.emit('debug', `Moonlink.js > Node > Error migrating player ${player.guildId}: ${error}`);
            }
        }
    }
    getPlayers() {
        return this.manager.players.all.filter(player => player.node.uuid === this.uuid);
    }
    get getPlayersCount() {
        return this.getPlayers().length;
    }
    needsRestart() {
        const stats = this.getSystemStats();
        return (stats.cpuLoad > 80 ||
            stats.memoryUsage > 80 ||
            this.reconnectAttempts > 3);
    }
    getNodeStatus() {
        const players = this.getPlayers();
        const { cpuLoad, memoryUsage } = this.stats?.cpu ? {
            cpuLoad: this.stats.cpu.systemLoad,
            memoryUsage: this.stats.memory.used
        } : { cpuLoad: 0, memoryUsage: 0 };
        const isNodeOverloaded = cpuLoad > 80 || memoryUsage > 80;
        return {
            identifier: this.identifier,
            connected: this.connected,
            version: this.version,
            stats: {
                cpu: cpuLoad,
                memory: memoryUsage,
                uptime: this.stats?.uptime || 0,
            },
            players: {
                total: this.getPlayersCount,
                active: players.filter(p => p.playing).length,
                paused: players.filter(p => p.paused).length,
                idle: players.filter(p => !p.playing && !p.paused).length
            },
            health: {
                status: isNodeOverloaded ? 'overloaded' : 'stable',
                needsRestart: isNodeOverloaded || this.reconnectAttempts > 3
            }
        };
    }
    async checkHealth(timeout = 2000) {
        try {
            const start = Date.now();
            await Promise.race([
                this.rest.getVersion(),
                new Promise((_, reject) => setTimeout(() => reject(), timeout))
            ]);
            const responseTime = Date.now() - start;
            return {
                responding: true,
                performance: responseTime < 100 ? 'excellent' : responseTime < 200 ? 'good' : 'poor'
            };
        }
        catch {
            return { responding: false, performance: 'poor' };
        }
    }
}
exports.Node = Node;
//# sourceMappingURL=Node.js.map