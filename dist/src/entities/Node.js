"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
const Util_1 = require("../Util");
const types_1 = require("../typings/types");
const Track_1 = require("./Track");
const YouTubeLiveChat_1 = require("./YouTubeLiveChat");
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
    resumeUpdateTimeout;
    resumeUpdateAttempts = 0;
    resumeUpdateInProgress = false;
    resumeUpdateMaxAttempts = 5;
    resumeUpdateBaseDelay = 2000;
    resumeWindowTimeout;
    resumeWindowActive = false;
    pendingRecovery = false;
    recoveryInProgress = false;
    regions;
    secure;
    sessionId;
    priority;
    socket;
    stats;
    info;
    version;
    isNodeLink = false;
    url;
    rest;
    lastStats;
    state = types_1.NodeState.DISCONNECTED;
    capabilities = new Set();
    constructor(manager, config) {
        this.manager = manager;
        this.uuid = (0, Util_1.generateUUID)(config.host, config.port);
        this.host = config.host;
        this.port = config.port;
        this.identifier = config.identifier ?? this.uuid;
        this.password = config.password || "youshallnotpass";
        this.regions = config.regions;
        this.pathVersion = config.pathVersion || "v4";
        this.retryDelay = config.retryDelay || 30000;
        this.retryAmount = config.retryAmount || 5;
        this.secure = config.secure;
        this.resumeTimeout = this.manager.options.resumeTimeout ?? 60000;
        this.url = `${this.secure ? "https" : "http"}://${this.address}/${this.pathVersion}/`;
        this.rest = new (Util_1.Structure.get("Rest"))(this);
        this.manager.emit("debug", `Moonlink.js > Node >> New node initialized. Identifier: ${this.identifier} (${this.host}:${this.port}), UUID: ${this.uuid}`);
    }
    get latency() {
        if (!this.socket)
            return -1;
        return this.socket.latency;
    }
    getPenalties() {
        if (!this.stats)
            return 0;
        const cpuLoad = this.stats.cpu.systemLoad;
        const players = this.stats.playingPlayers;
        return players + (cpuLoad * 100);
    }
    ping() {
        if (!this.connected) {
            return Promise.reject(new Error("Node is not connected."));
        }
        return this.socket.ping();
    }
    createYouTubeLiveChat(identifier, options) {
        if (!this.isNodeLink) {
            throw (0, Util_1.nodeLinkOnlyError)("youtubeLiveChat");
        }
        return new YouTubeLiveChat_1.YouTubeLiveChat(this, identifier, options);
    }
    async loadLyrics(track, lang) {
        const encoded = typeof track === "string" ? track : track?.encoded;
        if (!encoded) {
            throw new Error("loadLyrics requires an encoded track string or object with an encoded field.");
        }
        return this.rest.loadLyrics(encoded, lang);
    }
    async loadDirectStream(track, volume, position, filters) {
        const encoded = typeof track === "string" ? track : track?.encoded;
        if (!encoded) {
            throw new Error("loadDirectStream requires an encoded track string or object with an encoded field.");
        }
        const payload = { encodedTrack: encoded };
        if (volume !== undefined)
            payload.volume = volume;
        if (position !== undefined)
            payload.position = position;
        if (filters !== undefined)
            payload.filters = filters;
        return this.rest.loadStream(payload);
    }
    async getDirectStream(track, itag) {
        const encoded = typeof track === "string" ? track : track?.encoded;
        if (!encoded) {
            throw new Error("getDirectStream requires an encoded track string or object with an encoded field.");
        }
        return this.rest.trackStream(encoded, itag);
    }
    get address() {
        return `${this.host}:${this.port}`;
    }
    setState(state) {
        const oldState = this.state;
        this.state = state;
        this.manager.emit("nodeStateChange", this, oldState, state);
    }
    async connect() {
        this.setState(types_1.NodeState.CONNECTING);
        this.manager.emit("debug", `Moonlink.js > Node -> Attempting connection to ${this.identifier} (${this.host}:${this.port}).`);
        const nodeData = await this.manager.database.get(`nodes.${this.uuid}`);
        const sessionId = nodeData?.sessionId;
        let headers = {
            Authorization: this.password,
            "User-Id": this.manager.clientId,
            "Client-Name": this.manager.options.clientName || "Moonlink.js",
        };
        if (this.manager.options.resume && sessionId) {
            headers["Session-Id"] = sessionId;
            this.manager.emit("debug", `Moonlink.js > Node > Connect > Using resume session ID: ${sessionId} for ${this.identifier}`);
        }
        this.manager.emit("debug", `Moonlink.js > Node >> WebSocket headers for ${this.identifier}: ${(0, Util_1.stringifyWithReplacer)(headers)}.`);
        this.socket = new (Util_1.Structure.get("WebSocket"))(`ws${this.secure ? "s" : ""}://${this.address}/${this.pathVersion}/websocket`, {
            headers,
        });
        this.socket.on("open", this.open.bind(this));
        this.socket.on("close", this.close.bind(this));
        this.socket.on("message", this.message.bind(this));
        this.socket.on("error", this.error.bind(this));
        this.socket.on("pong", (latency) => {
            this.manager.emit("debug", `Moonlink.js > Node >> Received pong from ${this.identifier}. Latency: ${latency}ms.`);
        });
    }
    calculateReconnectDelay() {
        const maxRetries = this.retryAmount ?? 50;
        const baseDelays = [2000, 5000, 10000, 15000, 30000, 45000, 60000, 90000, 120000, 180000];
        if (this.reconnectAttempts < baseDelays.length) {
            return baseDelays[this.reconnectAttempts];
        }
        const maxDelay = 300000;
        const exponentialDelay = Math.min(180000 * Math.pow(1.3, this.reconnectAttempts - baseDelays.length), maxDelay);
        return exponentialDelay;
    }
    reconnect() {
        this.setState(types_1.NodeState.CONNECTING);
        const maxRetries = this.retryAmount ?? 50;
        const delay = this.calculateReconnectDelay();
        this.manager.emit("nodeReconnecting", this, this.reconnectAttempts + 1);
        this.manager.emit("debug", `Moonlink.js > Node >> Reconnecting to ${this.identifier} in ${Math.round(delay / 1000)}s (Attempt ${this.reconnectAttempts + 1}/${maxRetries}).`);
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = undefined;
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }
    resetResumeUpdateState() {
        this.resumeUpdateAttempts = 0;
        this.resumeUpdateInProgress = false;
        if (this.resumeUpdateTimeout) {
            clearTimeout(this.resumeUpdateTimeout);
            this.resumeUpdateTimeout = undefined;
        }
    }
    cancelResumeWindow() {
        this.resumeWindowActive = false;
        if (this.resumeWindowTimeout) {
            clearTimeout(this.resumeWindowTimeout);
            this.resumeWindowTimeout = undefined;
        }
    }
    startResumeWindow() {
        if (!this.manager.options.resume)
            return;
        this.cancelResumeWindow();
        this.resumeWindowActive = true;
        const windowMs = Math.max(15000, Math.min(this.resumeTimeout, 30000));
        this.resumeWindowTimeout = setTimeout(() => {
            this.resumeWindowTimeout = undefined;
            this.resumeWindowActive = false;
            if (this.pendingRecovery && !this.recoveryInProgress) {
                if (this.state !== types_1.NodeState.READY) {
                    this.manager.emit("debug", `Moonlink.js > Node >> Resume window expired for ${this.identifier}, waiting for READY before recovery.`);
                    return;
                }
                this.startDisasterRecovery("resume window expired");
            }
        }, windowMs);
    }
    scheduleResumeUpdateRetry(delayMs) {
        if (this.resumeUpdateTimeout) {
            clearTimeout(this.resumeUpdateTimeout);
        }
        this.resumeUpdateTimeout = setTimeout(() => {
            this.resumeUpdateTimeout = undefined;
            void this.enableResumeWithRetry();
        }, delayMs);
    }
    async enableResumeWithRetry() {
        if (!this.manager.options.resume)
            return;
        if (!this.sessionId)
            return;
        if (this.resumeUpdateInProgress)
            return;
        this.resumeUpdateInProgress = true;
        try {
            await this.rest.updateSession(this.manager.options.resume, this.resumeTimeout / 1000);
            this.resetResumeUpdateState();
            this.manager.emit("debug", `Moonlink.js > Node > Resume enabled for session ${this.sessionId} on ${this.identifier}.`);
        }
        catch (error) {
            this.resumeUpdateAttempts++;
            const attempt = this.resumeUpdateAttempts;
            const delay = Math.min(this.resumeUpdateBaseDelay * Math.pow(1.5, attempt - 1), 30000);
            this.manager.emit("debug", `Moonlink.js > Node > Failed to enable resume for ${this.identifier} (attempt ${attempt}/${this.resumeUpdateMaxAttempts}). Retrying in ${Math.round(delay / 1000)}s. Error: ${error.message}`);
            if (attempt < this.resumeUpdateMaxAttempts) {
                this.scheduleResumeUpdateRetry(delay);
            }
        }
        finally {
            this.resumeUpdateInProgress = false;
        }
    }
    async startDisasterRecovery(reason) {
        if (this.recoveryInProgress)
            return;
        this.recoveryInProgress = true;
        this.pendingRecovery = false;
        this.manager.emit("debug", `Moonlink.js > Node >> Session not resumed for node ${this.identifier}. Starting disaster recovery (${reason}).`);
        const playersOnNode = this.manager.players.filter((p) => p.node.uuid === this.uuid);
        for (const player of playersOnNode) {
            this.manager.emit("playerRecoveryStarted", player);
            player
                .restart()
                .then((success) => {
                if (success) {
                    this.manager.emit("playerRecoverySuccess", player);
                }
                else {
                    this.manager.emit("playerRecoveryFailed", player);
                }
            })
                .catch((error) => {
                this.manager.emit("debug", `Moonlink.js > Node >> Player recovery failed for ${player.guildId}. Error: ${error.message}`);
                this.manager.emit("playerRecoveryFailed", player);
            });
        }
        this.recoveryInProgress = false;
    }
    async open() {
        if (this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
        this.reconnectAttempts = 0;
        this.connected = true;
        this.setState(types_1.NodeState.CONNECTED);
        this.manager.emit("debug", `Moonlink.js > Node <- Connected to ${this.identifier}.`);
        try {
            const infoResult = await this.rest.getInfoWithHeaders();
            if (infoResult) {
                const nodeInfo = infoResult.data;
                const headers = infoResult.headers;
                const headerFlag = headers?.iamnodelink;
                const headerValue = Array.isArray(headerFlag) ? headerFlag[0] : headerFlag;
                const headerIsNodeLink = typeof headerValue === "string" && headerValue.toLowerCase() === "true";
                this.isNodeLink = Boolean(nodeInfo?.isNodelink) || headerIsNodeLink;
                this.info = nodeInfo;
                this.version = nodeInfo?.version?.semver;
                if (this.isNodeLink) {
                    this.manager.emit("debug", `Moonlink.js > Node >> NodeLink detected for ${this.identifier}.`);
                }
                this.capabilities.clear();
                if (Array.isArray(nodeInfo?.sourceManagers)) {
                    for (const source of nodeInfo.sourceManagers) {
                        this.capabilities.add(`source:${source}`);
                    }
                }
                if (Array.isArray(nodeInfo?.filters)) {
                    for (const filter of nodeInfo.filters) {
                        this.capabilities.add(`filter:${filter}`);
                    }
                }
                this.manager.emit("debug", `Moonlink.js > Node >> Node ${this.identifier} capabilities updated: ${[...this.capabilities].join(", ")}`);
            }
        }
        catch (error) {
            this.manager.emit("debug", `Moonlink.js > Node >> Failed to get node info for ${this.identifier}. Error: ${error.message}`);
        }
        this.manager.emit("nodeConnected", this);
    }
    async close(event) {
        const { code, reason } = event;
        if (this.connected)
            this.connected = false;
        this.setState(types_1.NodeState.DISCONNECTED);
        this.resetResumeUpdateState();
        this.manager.emit("debug", `Moonlink.js > Node <- Disconnected from ${this.identifier}. Code: ${code}, Reason: ${reason}.`);
        this.manager.emit("nodeDisconnect", this, code, reason);
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        if (this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
        const orphanedPlayers = this.manager.players.filter((p) => p.node.uuid === this.uuid);
        let moved = false;
        if (orphanedPlayers.length > 0 && this.manager.options.node?.autoMovePlayers) {
            const newNode = this.manager.nodes.findNode({ exclude: [this.identifier] });
            if (newNode) {
                moved = true;
                this.manager.emit("debug", `Moonlink.js > Node >> Found a new healthy node (${newNode.identifier}). Moving ${orphanedPlayers.length} players...`);
                await Promise.all(orphanedPlayers.map(p => p.transferNode(newNode)));
                this.manager.emit("playersMoved", orphanedPlayers, this, newNode);
            }
            else {
                this.manager.emit("debug", `Moonlink.js > Node >> No healthy nodes available to move players.`);
            }
        }
        if (this.destroyed || this.reconnectAttempts >= this.retryAmount) {
            if (!moved && orphanedPlayers.length > 0) {
                this.manager.emit("debug", `Moonlink.js > Node >> Node disconnected permanently. Destroying ${orphanedPlayers.length} players.`);
                for (const player of orphanedPlayers) {
                    await player.destroy("Node disconnected permanently");
                }
                this.manager.emit("playersOrphaned", orphanedPlayers, this);
            }
            if (this.reconnectAttempts >= this.retryAmount && !this.destroyed) {
                this.destroyed = true;
                this.setState(types_1.NodeState.DESTROYED);
                this.manager.emit("debug", `Moonlink.js > Node >> Max reconnect attempts reached for ${this.identifier}. Node destroyed.`);
                this.manager.emit("nodeDestroy", this.identifier);
            }
        }
        else {
            if (!moved && orphanedPlayers.length > 0 && this.manager.options.resume) {
                this.pendingRecovery = true;
                this.startResumeWindow();
            }
            if (!moved && orphanedPlayers.length > 0) {
                this.manager.emit("debug", `Moonlink.js > Node >> Node disconnected (Code ${code}). Attempting reconnect. Keeping ${orphanedPlayers.length} players waiting for resume.`);
            }
            this.reconnect();
        }
    }
    async message({ data }) {
        let payload;
        try {
            payload = JSON.parse(data);
        }
        catch (e) {
            this.manager.emit("debug", `Moonlink.js > Node <- Received malformed payload from ${this.identifier}. Data: ${data}, Error: ${e}.`);
            return;
        }
        this.manager.emit("nodeRaw", this, payload);
        const player = this.manager.players.get(payload.guildId);
        if (!player && payload.guildId) {
            this.manager.emit("debug", `Moonlink.js > Node >> Payload for non-existent player. GuildId: ${payload.guildId}, OP: ${payload.op}.`);
            return;
        }
        let loggedByCase = false;
        switch (payload.op) {
            case "ready":
                this.manager.emit("debug", `Moonlink.js > Node >> READY payload: ${(0, Util_1.stringifyWithReplacer)(payload)}`);
                this.sessionId = payload.sessionId;
                this.resumed = payload.resumed;
                this.setState(types_1.NodeState.READY);
                await this.manager.database.set(`nodes.${this.uuid}`, {
                    sessionId: this.sessionId,
                });
                if (this.manager.options.resume) {
                    void this.enableResumeWithRetry();
                }
                this.manager.emit("nodeReady", this, payload);
                if (this.manager.options.resume) {
                    if (this.resumed) {
                        this.manager.emit("nodeResume", this);
                        this.pendingRecovery = false;
                        this.cancelResumeWindow();
                        this._resumePlayers();
                    }
                    else {
                        this.pendingRecovery = true;
                        if (!this.resumeWindowActive) {
                            void this.startDisasterRecovery("resume not confirmed");
                        }
                        else {
                            this.manager.emit("debug", `Moonlink.js > Node >> Resume window active for ${this.identifier}; delaying recovery.`);
                        }
                    }
                }
                loggedByCase = true;
                break;
            case "stats":
                delete payload.op;
                this.stats = payload;
                if (!this.lastStats ||
                    this.stats.players !== this.lastStats.players ||
                    this.stats.playingPlayers !== this.lastStats.playingPlayers) {
                    this.lastStats = {
                        players: this.stats.players,
                        playingPlayers: this.stats.playingPlayers,
                    };
                    this.manager.emit("debug", `Moonlink.js > Node <- Node ${this.identifier} STATS updated. Stats: ${(0, Util_1.stringifyWithReplacer)(this.stats)}.`);
                }
                loggedByCase = true;
                break;
            case "playerUpdate":
                if (!player) {
                    loggedByCase = true;
                    break;
                }
                const currentState = payload.state;
                const lastState = player.get("lastState");
                player.connected = currentState.connected;
                player.ping = currentState.ping;
                if (player.current) {
                    const shouldPreservePosition = Boolean(!currentState.connected &&
                        lastState?.connected &&
                        lastState.position > 0);
                    if (!shouldPreservePosition || currentState.position > 0) {
                        player.current.position = currentState.position;
                        player.current.time = currentState.time;
                        player.updateData("current.position", currentState.position);
                    }
                    if (shouldPreservePosition) {
                        player.set("lastKnownPosition", lastState.position);
                    }
                }
                const positionAdvanced = Boolean(!lastState || currentState.position > lastState.position);
                if (player.playing && !player.paused && currentState.connected && positionAdvanced) {
                    player.updateActivity();
                }
                let logMessage = `Moonlink.js > Node#handleMessage >> Player ${player.guildId} state updated. CurrentState: ${(0, Util_1.stringifyWithReplacer)(currentState)}.`;
                let shouldLog = false;
                if (!lastState) {
                    shouldLog = true;
                    logMessage += ` Initial state: ${(0, Util_1.stringifyWithReplacer)(currentState)} (skipping all normal logs).`;
                }
                else {
                    if (currentState.connected !== lastState.connected) {
                        shouldLog = true;
                        logMessage += ` Connection status changed from ${lastState.connected} to ${currentState.connected}.`;
                    }
                    if (currentState.ping !== -1) {
                        if (currentState.ping > 1000 && currentState.ping !== lastState.ping) {
                            shouldLog = true;
                            logMessage += ` High ping detected: ${currentState.ping}ms.`;
                        }
                        else if (lastState.ping &&
                            lastState.ping !== -1 &&
                            Math.abs(currentState.ping - lastState.ping) > 500) {
                            shouldLog = true;
                            logMessage += ` Significant ping change: ${lastState.ping}ms -> ${currentState.ping}ms.`;
                        }
                    }
                    if (player.playing && player.current) {
                        if (currentState.position === 0 && lastState.position !== 0) {
                            shouldLog = true;
                            logMessage += ` Position reset to 0 while playing.`;
                        }
                        else if (currentState.position === lastState.position &&
                            currentState.position !== 0) {
                            shouldLog = true;
                            logMessage += ` Position stuck at ${currentState.position}ms while playing.`;
                        }
                    }
                }
                if (shouldLog) {
                    this.manager.emit("debug", logMessage);
                }
                loggedByCase = true;
                player.set("lastState", {
                    connected: currentState.connected,
                    position: currentState.position,
                    ping: currentState.ping,
                    time: currentState.time,
                });
                this.manager.emit("playerUpdate", player, player.current ?? null, payload);
                player.voice.check(currentState.connected);
                break;
            case "event":
                if (payload.type === "WorkerFailedEvent") {
                    this.handleWorkerFailed(payload);
                    loggedByCase = true;
                    break;
                }
                if (!player) {
                    loggedByCase = true;
                    break;
                }
                this.manager.emit("debug", `Moonlink.js > Node <- Player ${player.guildId} received event. Type: ${payload.type}, Payload: ${(0, Util_1.stringifyWithReplacer)(payload)}.`);
                this.handleEvent(player, payload);
                loggedByCase = true;
                break;
            default:
                if (!loggedByCase) {
                    this.manager.emit("debug", `Moonlink.js > Node <- Received unhandled payload from ${this.identifier}. OP: ${payload.op}, Data: ${(0, Util_1.stringifyWithReplacer)(payload)}.`);
                }
                loggedByCase = true;
                break;
        }
    }
    handleEvent(player, payload) {
        switch (payload.type) {
            case "TrackStartEvent":
                this.handleTrackStart(player, payload);
                break;
            case "TrackEndEvent":
                this.handleTrackEnd(player, payload);
                break;
            case "TrackStuckEvent":
                this.handleTrackStuck(player, payload);
                break;
            case "TrackExceptionEvent":
                this.handleTrackException(player, payload);
                break;
            case "MixStartedEvent":
                this.handleMixStarted(player, payload);
                break;
            case "MixEndedEvent":
                this.handleMixEnded(player, payload);
                break;
            case "ConnectionStatusEvent":
                this.handleConnectionStatus(player, payload);
                break;
            case "VolumeChangedEvent":
                this.handleVolumeChanged(player, payload);
                break;
            case "FiltersChangedEvent":
                this.handleFiltersChanged(player, payload);
                break;
            case "SeekEvent":
                this.handleSeek(player, payload);
                break;
            case "PauseEvent":
                this.handlePause(player, payload);
                break;
            case "PlayerCreatedEvent":
                this.handlePlayerCreated(player, payload);
                break;
            case "PlayerDestroyedEvent":
                this.handlePlayerDestroyed(player, payload);
                break;
            case "PlayerReconnectingEvent":
                this.handlePlayerReconnecting(player, payload);
                break;
            case "PlayerConnectedEvent":
                this.handlePlayerConnected(player, payload);
                break;
            case "EternalBoxInfoEvent":
                this.handleEternalBoxInfo(player, payload);
                break;
            case "EternalBoxJumpEvent":
                this.handleEternalBoxJump(player, payload);
                break;
            case "StreamMetadataEvent":
                this.handleStreamMetadata(player, payload);
                break;
            case "LyricsFoundEvent":
                this.handleLyricsFound(player, payload);
                break;
            case "LyricsLineEvent":
                this.handleLyricsLine(player, payload);
                break;
            case "LyricsNotFoundEvent":
                this.handleLyricsNotFound(player, payload);
                break;
            case "WebSocketClosedEvent":
                this.handleWebSocketClosed(player, payload);
                break;
        }
    }
    async handleWorkerFailed(payload) {
        const affectedGuilds = Array.isArray(payload.affectedGuilds) ? payload.affectedGuilds : [];
        this.manager.emit("debug", `Moonlink.js > Node#handleWorkerFailed >> WorkerFailedEvent received on ${this.identifier}. Affected guilds: ${affectedGuilds.join(", ") || "none"}. Message: ${payload.message ?? "n/a"}.`);
        for (const guildId of affectedGuilds) {
            const player = this.manager.players.get(guildId);
            if (!player || player.destroyed)
                continue;
            if (player.get("voiceCloseRecoveryInProgress")) {
                this.manager.emit("debug", `Moonlink.js > Node#handleWorkerFailed >> Recovery already in progress for player ${guildId}, skipping duplicate worker recovery.`);
                continue;
            }
            player.set("voiceCloseRecoveryInProgress", true);
            try {
                await player.disconnect();
                try {
                    await this.rest.destroyPlayer(guildId);
                }
                catch { }
                await new Promise(resolve => setTimeout(resolve, 750));
                await player.connect();
                const restarted = await player.restart();
                if (!restarted) {
                    this.manager.emit("debug", `Moonlink.js > Node#handleWorkerFailed >> Restart returned false for player ${guildId}.`);
                }
            }
            catch (error) {
                this.manager.emit("debug", `Moonlink.js > Node#handleWorkerFailed >> Recovery failed for player ${guildId}. Error: ${error.message}`);
                await player.destroy("Worker failed recovery failed");
            }
            finally {
                player.set("voiceCloseRecoveryInProgress", false);
            }
        }
    }
    async handleTrackStart(player, payload) {
        const trackData = payload.track ?? player.current?.toJSON?.();
        const trackTitle = trackData?.info?.title ?? player.current?.title ?? "Unknown";
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackStart >> Track started for player ${player.guildId}: "${trackTitle}". Track: ${(0, Util_1.stringifyWithReplacer)(trackData ?? payload.track)}.`);
        player.playing = true;
        player.paused = false;
        player.updateActivity();
        player.set("lastKnownPosition", null);
        if (player.current) {
            player.current.position = 0;
        }
        const reconnectAttempts = player.get("reconnectAttempts");
        if (reconnectAttempts && reconnectAttempts > 0) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackStart >> Player ${player.guildId} successfully recovered after ${reconnectAttempts} reconnect attempts.`);
            player.set("reconnectAttempts", 0);
        }
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackStart >> Resetting player state (stuckCount, exceptionCount, isResuming) for player ${player.guildId}.`);
        player.set("stuckCount", 0);
        player.set("exceptionCount", 0);
        player.isResuming = false;
        if (!trackData) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackStart >> Missing track data for player ${player.guildId}. Payload: ${(0, Util_1.stringifyWithReplacer)(payload)}.`);
            return;
        }
        if (player.current && (!trackData.userData || Object.keys(trackData.userData).length === 0)) {
            trackData.userData = player.current.userData;
        }
        const trackForEvent = new (Util_1.Structure.get("Track"))(trackData, player.current?.requester);
        this.manager.emit("trackStart", player, trackForEvent);
    }
    async handleTrackEnd(player, payload) {
        const { reason } = payload;
        if (reason === "replaced" || reason === "gapless") {
            return;
        }
        const trackData = payload.track ?? player.current?.toJSON?.();
        if (trackData && player.current && (!trackData.userData || Object.keys(trackData.userData).length === 0)) {
            trackData.userData = player.current.userData;
        }
        const trackForEvent = trackData
            ? new (Util_1.Structure.get("Track"))(trackData, player.current?.requester)
            : player.current;
        player.playing = false;
        player.paused = false;
        player.updateActivity();
        player.set("lastKnownPosition", null);
        player.set("isBackPlay", false);
        if (trackForEvent) {
            this.manager.emit("trackEnd", player, trackForEvent, reason, payload);
        }
        else {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Missing track data for player ${player.guildId}. Payload: ${(0, Util_1.stringifyWithReplacer)(payload)}.`);
        }
        if (player.destroyed) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Player ${player.guildId} is destroyed, skipping end handling.`);
            return;
        }
        if (reason === "loadFailed") {
            const trackHandling = this.manager.options.trackHandling;
            const trackToRetry = player.current;
            if (trackHandling?.retryFailedTracks && trackToRetry) {
                const maxRetries = trackHandling.maxRetryAttempts ?? 3;
                if (trackToRetry.retries < maxRetries) {
                    trackToRetry.retries++;
                    this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Track failed to load. Retrying... (Attempt ${trackToRetry.retries}/${maxRetries}) for player ${player.guildId}.`);
                    player.queue.unshift(trackToRetry);
                    await player.play();
                    return;
                }
                this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Track failed to load after ${maxRetries} attempts for player ${player.guildId}.`);
            }
        }
        if (reason === "stopped") {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Track was ${reason}, skipping queue logic for player ${player.guildId}.`);
            return;
        }
        if (player.loop === "track" && player.current) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Player ${player.guildId} is in track loop mode. Replaying track: ${player.current.title}.`);
            await this.rest.updatePlayer(player.guildId, {
                track: { encoded: player.current.encoded },
                position: 0,
            });
            return;
        }
        if (player.loop === "queue" && player.current) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Player ${player.guildId} is in queue loop mode. Adding current track to the end of the queue: ${player.current.title}.`);
            player.current.position = 0;
            player.queue.add(player.current);
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd << Queue size is now ${player.queue.size}.`);
        }
        if (player.queue.size > 0) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd -> Playing next track from queue for player ${player.guildId} (${player.queue.size} tracks remaining).`);
            await player.play();
            return;
        }
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Queue is empty for player ${player.guildId}. Proceeding to autoplay check.`);
        if (player.autoPlay && trackForEvent) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd -> Attempting autoPlay for player ${player.guildId}. Previous track: ${trackForEvent.title}.`);
            const autoplayed = await this.handleAutoPlay(player, trackForEvent);
            if (autoplayed) {
                this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd << AutoPlay was successful for player ${player.guildId}.`);
                return;
            }
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> AutoPlay failed for player ${player.guildId}.`);
        }
        else if (player.autoPlay) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> AutoPlay skipped for player ${player.guildId} due to missing previous track data.`);
        }
        await this.handleQueueEnd(player, trackForEvent);
    }
    async handleTrackStuck(player, payload) {
        const track = player.current;
        const thresholdMs = payload.thresholdMs;
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck >> Track stuck for player ${player.guildId}: "${track?.title}". Threshold: ${thresholdMs}ms. Payload: ${(0, Util_1.stringifyWithReplacer)(payload)}.`);
        this.manager.emit("trackStuck", player, track, thresholdMs, payload);
        if (track && track.duration === -1) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck >> Track has -1 duration (stream?), skipping auto-recovery to prevent loops for player ${player.guildId}.`);
            return;
        }
        if (this.manager.options.trackHandling?.skipStuckTracks) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck >> 'skipStuckTracks' is true, skipping track for player ${player.guildId}.`);
            await player.skip();
            return;
        }
        const stuckCount = (player.get("stuckCount") || 0) + 1;
        player.set("stuckCount", stuckCount);
        if (stuckCount >= 3) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck >> Track stuck ${stuckCount} times for player ${player.guildId}, skipping track.`);
            player.set("stuckCount", 0);
            if (player.queue.size > 0) {
                this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck -> Skipping to next track for player ${player.guildId}.`);
                await player.skip();
            }
            else {
                this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck -> No tracks in queue, stopping player ${player.guildId}.`);
                await player.stop();
                this.manager.emit("queueEnd", player, track);
            }
        }
        else {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck -> Attempting to restart playback for player ${player.guildId} (attempt ${stuckCount}/3).`);
            try {
                const currentPosition = player.current?.position || 0;
                this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck -> Seeking player ${player.guildId} to position ${currentPosition + 1000}ms.`);
                await player.seek(currentPosition + 1000);
                this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck >> Seeked forward 1s for player ${player.guildId}.`);
            }
            catch (error) {
                this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck >> Failed to seek, attempting full restart for player ${player.guildId}. Error: ${error.message}.`);
                await player.restart();
            }
        }
    }
    async handleTrackException(player, payload) {
        const track = player.current;
        const exception = payload.exception;
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackException >> Track exception for player ${player.guildId}: "${track?.title}". Severity: ${exception.severity}. Message: ${exception.message}. Payload: ${(0, Util_1.stringifyWithReplacer)(payload)}.`);
        this.manager.emit("trackException", player, track, exception, payload);
        if (this.manager.options.trackHandling?.autoSkipOnError) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackException >> 'autoSkipOnError' is true, skipping track for player ${player.guildId}.`);
            await player.skip();
            return;
        }
        const exceptionCount = (player.get("exceptionCount") || 0) + 1;
        player.set("exceptionCount", exceptionCount);
        if (exception.severity === "fault") {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackException >> Fatal exception detected for player ${player.guildId}, skipping track.`);
            if (player.queue.size > 0) {
                await player.skip();
            }
            else {
                await player.stop();
                this.manager.emit("queueEnd", player, track);
            }
            player.set("exceptionCount", 0);
        }
        else if (exception.severity === "suspicious" && exceptionCount >= 2) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackException >> Suspicious exception repeated ${exceptionCount} times for player ${player.guildId}, skipping track.`);
            player.set("exceptionCount", 0);
            if (player.queue.size > 0) {
                await player.skip();
            }
            else {
                await player.stop();
                this.manager.emit("queueEnd", player, track);
            }
        }
        else if (exceptionCount >= 3) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackException >> Track threw ${exceptionCount} exceptions for player ${player.guildId}, skipping track.`);
            player.set("exceptionCount", 0);
            if (player.queue.size > 0) {
                await player.skip();
            }
            else {
                await player.stop();
                this.manager.emit("queueEnd", player, track);
            }
        }
        else {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackException -> Exception count: ${exceptionCount}/3 for player ${player.guildId}, continuing playback.`);
        }
    }
    handleMixStarted(player, payload) {
        const trackData = payload.track;
        const mixTrack = new (Util_1.Structure.get("Track"))(trackData, trackData?.userData?.requester);
        this.manager.emit("mixStart", player, payload.mixId, mixTrack, payload.volume, payload);
    }
    handleMixEnded(player, payload) {
        this.manager.emit("mixEnd", player, payload.mixId, payload.reason, payload);
    }
    handleConnectionStatus(player, payload) {
        const statusValue = payload.status ?? payload.connected;
        let connected;
        if (typeof statusValue === "string") {
            connected = statusValue.toLowerCase() === "connected";
        }
        else if (typeof statusValue === "boolean") {
            connected = statusValue;
        }
        if (typeof connected === "boolean") {
            player.connected = connected;
            player.voice.check(connected);
            if (connected) {
                this.manager.emit("playerConnected", player, payload);
            }
            else {
                this.manager.emit("playerDisconnected", player);
            }
        }
        this.manager.emit("playerConnectionStatus", player, statusValue, payload);
    }
    handleVolumeChanged(player, payload) {
        if (typeof payload.volume === "number") {
            const oldVolume = player.volume;
            player.volume = payload.volume;
            player.updateData("volume", player.volume);
            this.manager.emit("playerChangedVolume", player, oldVolume, player.volume);
        }
    }
    handleFiltersChanged(player, payload) {
        const filtersPayload = payload.filters?.filters ?? payload.filters;
        if (filtersPayload && typeof filtersPayload === "object") {
            Object.assign(player.filters, filtersPayload);
            void player.updateData("filters", player.filters.toJSON());
        }
        this.manager.emit("filtersUpdate", player, player.filters);
    }
    handleSeek(player, payload) {
        if (typeof payload.position !== "number")
            return;
        if (player.current) {
            player.current.position = payload.position;
            player.updateData("current.position", payload.position);
        }
        this.manager.emit("playerSeek", player, payload.position, payload);
    }
    handlePause(player, payload) {
        if (typeof payload.paused !== "boolean")
            return;
        player.paused = payload.paused;
        player.updateData("paused", player.paused);
        player.updateActivity();
        this.manager.emit("playerPause", player, payload.paused, payload);
    }
    handlePlayerCreated(player, payload) {
        this.manager.emit("playerCreated", player, payload);
    }
    async handlePlayerDestroyed(player, payload) {
        this.manager.emit("playerDestroyed", player, payload);
        if (!player.destroyed) {
            await player.destroy("Remote player destroyed");
        }
    }
    handlePlayerReconnecting(player, payload) {
        player.isResuming = true;
        this.manager.emit("playerReconnect", player, payload.reason);
    }
    handlePlayerConnected(player, payload) {
        player.isResuming = false;
        player.connected = true;
        this.manager.emit("playerConnected", player, payload);
    }
    handleEternalBoxInfo(player, payload) {
        this.manager.emit("eternalBoxInfo", player, payload);
    }
    handleEternalBoxJump(player, payload) {
        this.manager.emit("eternalBoxJump", player, payload);
    }
    handleStreamMetadata(player, payload) {
        this.manager.emit("streamMetadata", player, payload);
    }
    handleLyricsFound(player, payload) {
        this.manager.emit("lyricsFound", player, payload);
    }
    handleLyricsLine(player, payload) {
        this.manager.emit("lyricsLine", player, payload);
    }
    handleLyricsNotFound(player, payload) {
        this.manager.emit("lyricsNotFound", player, payload);
    }
    async handleWebSocketClosed(player, payload) {
        const { code, reason, byRemote } = payload;
        if (player.destroyed)
            return;
        if (player.get("voiceCloseRecoveryInProgress")) {
            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Voice-close recovery already in progress for player ${player.guildId}, skipping event.`);
            return;
        }
        this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> WebSocket closed for player ${player.guildId}. Code: ${code}, Reason: "${reason}", By Remote: ${byRemote}. Payload: ${(0, Util_1.stringifyWithReplacer)(payload)}.`);
        const isMoveCloseCode = code === 4014 || code === 4022;
        if (isMoveCloseCode && (player.voice.isMoving || player.voice.wasRecentlyMoved())) {
            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Ignoring WebSocket close (${code}) for player ${player.guildId} due to channel move.`);
            return;
        }
        if (code === 4022) {
            player.set("voiceCloseRecoveryInProgress", true);
            try {
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Handling 4022 for player ${player.guildId} with full bot-side voice recovery.`);
                await player.disconnect();
                try {
                    await this.rest.destroyPlayer(player.guildId);
                }
                catch (e) {
                    this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Failed to destroy remote player during 4022 recovery for ${player.guildId}: ${e.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, 750));
                await player.connect();
                const restarted = await player.restart();
                if (!restarted) {
                    this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> 4022 recovery restart returned false for player ${player.guildId}.`);
                }
                player.set("wsReconnectAttempts", 0);
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> 4022 recovery finished for player ${player.guildId}.`);
            }
            catch (error) {
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> 4022 recovery failed for player ${player.guildId}. Error: ${error.message}`);
                await player.destroy("Voice close 4022 recovery failed");
            }
            finally {
                player.set("voiceCloseRecoveryInProgress", false);
            }
            return;
        }
        if (code === 5001 && this.isNodeLink) {
            player.set("voiceCloseRecoveryInProgress", true);
            try {
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Handling 5001 (worker_failed) for player ${player.guildId} with bot-side recovery.`);
                await player.disconnect();
                try {
                    await this.rest.destroyPlayer(player.guildId);
                }
                catch { }
                await new Promise(resolve => setTimeout(resolve, 750));
                await player.connect();
                const restarted = await player.restart();
                if (!restarted) {
                    this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> 5001 recovery restart returned false for player ${player.guildId}.`);
                }
                player.set("wsReconnectAttempts", 0);
            }
            catch (error) {
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> 5001 recovery failed for player ${player.guildId}. Error: ${error.message}`);
                await player.destroy("Worker failed (5001) recovery failed");
            }
            finally {
                player.set("voiceCloseRecoveryInProgress", false);
            }
            return;
        }
        if (player.isResuming) {
            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Player ${player.guildId} is resuming, ignoring WebSocket close event.`);
            return;
        }
        const fatalCodes = [4004, 4015];
        if (fatalCodes.includes(code)) {
            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Fatal close code ${code} for player ${player.guildId}, destroying player.`);
            this.manager.emit("socketClosed", player, code, reason, byRemote, payload);
            await player.destroy(`WebSocket closed with fatal code: ${code}`);
            return;
        }
        const voiceOptions = this.manager.options.voiceConnection;
        if (!voiceOptions?.autoReconnect) {
            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Auto-reconnect is disabled for player ${player.guildId}.`);
            await player.destroy("Auto-reconnect disabled");
            return;
        }
        const reconnectAttempts = (player.get("wsReconnectAttempts") || 0) + 1;
        const maxReconnectAttempts = voiceOptions.maxReconnectAttempts ?? 5;
        if (reconnectAttempts > maxReconnectAttempts) {
            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Max reconnect attempts reached (${maxReconnectAttempts}) for player ${player.guildId}.`);
            this.manager.emit("socketClosed", player, code, reason, byRemote, payload);
            await player.destroy("Max reconnect attempts reached");
            return;
        }
        player.set("wsReconnectAttempts", reconnectAttempts);
        this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed -> Attempting reconnect ${reconnectAttempts}/${maxReconnectAttempts} for player ${player.guildId}.`);
        const reconnectDelay = voiceOptions.reconnectDelay ?? 5000;
        this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed -> Reconnect scheduled in ${reconnectDelay}ms for player ${player.guildId}.`);
        setTimeout(async () => {
            if (player.destroyed) {
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Player ${player.guildId} was destroyed during reconnect delay.`);
                return;
            }
            try {
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed -> Step 1: Reconnecting voice for player ${player.guildId}.`);
                await player.connect();
                const timeout = voiceOptions.timeout ?? 15000;
                await new Promise(resolve => setTimeout(resolve, timeout));
                if (player.playing && player.current) {
                    this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed -> Step 2: Restarting player ${player.guildId} after voice reconnect.`);
                    await player.restart();
                }
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Voice reconnected for player ${player.guildId}.`);
                player.set("wsReconnectAttempts", 0);
            }
            catch (error) {
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Reconnect attempt ${reconnectAttempts} failed for player ${player.guildId}. Error: ${error.message}.`);
                if (reconnectAttempts >= maxReconnectAttempts) {
                    this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> All reconnect attempts exhausted for player ${player.guildId}.`);
                    this.manager.emit("socketClosed", player, code, reason, byRemote, payload);
                    await player.destroy("All reconnect attempts exhausted");
                }
            }
        }, reconnectDelay);
    }
    async handleAutoPlay(player, previousTrack) {
        if (!previousTrack?.sourceName || !previousTrack.identifier) {
            this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> No source or identifier for autoPlay in player ${player.guildId}. PreviousTrack: ${(0, Util_1.stringifyWithReplacer)(previousTrack)}.`);
            return false;
        }
        const source = previousTrack.sourceName.toLowerCase();
        const identifier = previousTrack.identifier;
        let uri;
        let searchSource;
        switch (source) {
            case "youtube":
                uri = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
                searchSource = "youtube";
                this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay -> Using YouTube Mix for autoPlay in player ${player.guildId}. URI: ${uri}.`);
                break;
            case "spotify":
                if (this.isNodeLink && this.capabilities.has("source:spotify")) {
                    uri = `seed_tracks=${identifier}`;
                    searchSource = "sprec";
                    this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay -> Using Spotify recommendations for autoPlay in player ${player.guildId}. URI: ${uri}.`);
                }
                break;
            case "deezer":
                if (this.isNodeLink && this.capabilities.has("source:deezer")) {
                    uri = identifier;
                    searchSource = "dzrec";
                    this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay -> Using Deezer recommendations for autoPlay in player ${player.guildId}. URI: ${uri}.`);
                }
                break;
            case "soundcloud":
                uri = `${previousTrack.author}`;
                searchSource = "soundcloud";
                this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay -> Using SoundCloud artist search for autoPlay in player ${player.guildId}. URI: ${uri}.`);
                break;
            case "applemusic":
                if (this.isNodeLink && this.capabilities.has("source:applemusic")) {
                    uri = identifier;
                    searchSource = "amrec";
                    this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay -> Using Apple Music recommendations for autoPlay in player ${player.guildId}. URI: ${uri}.`);
                }
                break;
        }
        if (!uri || !searchSource) {
            this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> No valid autoPlay source found for ${source} in player ${player.guildId}.`);
            if (source !== "youtube") {
                this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> Falling back to YouTube Mix for autoPlay in player ${player.guildId}.`);
                const res = await this.manager.search({
                    query: `${previousTrack.title} ${previousTrack.author}`,
                });
                if (res && res.tracks && res.tracks.length > 0) {
                    const suposteousTrack = res.tracks[0];
                    uri = `https://www.youtube.com/watch?v=${res.tracks[0].identifier}&list=RD${res.tracks[0].identifier}`;
                    searchSource = "youtube";
                    this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay -> YouTube Mix URI for autoPlay in player ${player.guildId}: ${uri}.`);
                }
                else {
                    this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> YouTube Mix fallback failed for autoPlay in player ${player.guildId}.`);
                    return false;
                }
            }
        }
        if (!uri || !searchSource) {
            this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> Unable to determine URI or search source for autoPlay in player ${player.guildId}.`);
            return false;
        }
        try {
            const res = await this.manager.search({
                query: uri,
                source: searchSource,
                requester: previousTrack.requester,
            });
            if (!res || !res.tracks || res.tracks.length === 0 || res.loadType === "error") {
                this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> No tracks found for autoPlay in player ${player.guildId}. LoadType: ${res?.loadType}.`);
                return false;
            }
            const historyLimit = this.manager.options.queue?.historyLimit ?? player.historySize ?? 10;
            const recentHistory = Array.isArray(player.previous)
                ? player.previous.slice(-historyLimit)
                : [];
            const queuedTracks = Array.isArray(player.queue?.tracks)
                ? player.queue.tracks
                : [];
            const getTrackKey = (track) => {
                if (!track)
                    return null;
                const identifier = track.identifier ?? track.info?.identifier;
                const sourceName = track.sourceName ?? track.info?.sourceName;
                if (identifier)
                    return `${sourceName ?? "unknown"}:${identifier}`;
                const encoded = track.encoded;
                if (encoded)
                    return encoded;
                const uri = track.uri ?? track.info?.uri;
                if (uri)
                    return uri;
                const title = track.title ?? track.info?.title ?? "";
                const author = track.author ?? track.info?.author ?? "";
                const combined = `${title}:${author}`.trim();
                return combined.length > 1 ? combined : null;
            };
            const blockedKeys = new Set();
            const addBlocked = (track) => {
                const key = getTrackKey(track);
                if (key)
                    blockedKeys.add(key);
            };
            addBlocked(previousTrack);
            for (const track of recentHistory)
                addBlocked(track);
            for (const track of queuedTracks)
                addBlocked(track);
            const seenKeys = new Set();
            const candidates = res.tracks.filter((track) => {
                const key = getTrackKey(track);
                if (!key)
                    return false;
                if (blockedKeys.has(key))
                    return false;
                if (seenKeys.has(key))
                    return false;
                seenKeys.add(key);
                return true;
            });
            if (candidates.length === 0) {
                this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> AutoPlay results contained only recent/duplicate tracks for player ${player.guildId}.`);
                return false;
            }
            const filteredTracks = candidates.slice(0, 10);
            const randomTrack = filteredTracks[Math.floor(Math.random() * filteredTracks.length)];
            if (randomTrack) {
                player.queue.add(randomTrack);
                this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> AutoPlay track added for player ${player.guildId}: "${randomTrack.title}" by ${randomTrack.author}. Track: ${(0, Util_1.stringifyWithReplacer)(randomTrack)}.`);
                await player.play();
                this.manager.emit("autoPlayed", player, randomTrack, previousTrack);
                return true;
            }
        }
        catch (error) {
            this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> AutoPlay error for player ${player.guildId}. Error: ${error.message}.`);
        }
        return false;
    }
    async handleQueueEnd(player, lastTrack) {
        this.manager.emit("debug", `Moonlink.js > Node#handleQueueEnd >> Queue ended for player ${player.guildId}. LastTrack: ${lastTrack?.title || "None"}.`);
        player.current = null;
        player.playing = false;
        player.paused = false;
        this.manager.emit("debug", `Moonlink.js > Node#handleQueueEnd >> Player state updated: current=${player.current}, playing=${player.playing}, paused=${player.paused} for player ${player.guildId}.`);
        this.manager.emit("queueEnd", player, lastTrack);
        if (player.autoLeave) {
            this.manager.emit("debug", `Moonlink.js > Node#handleQueueEnd -> AutoLeave enabled, destroying player ${player.guildId}.`);
            this.manager.emit("autoLeaved", player, lastTrack);
            await player.destroy("AutoLeave enabled");
        }
    }
    error({ error }) {
        this.manager.emit("debug", `Moonlink.js > Node !> Error on node ${this.identifier}. Error: ${error.message}.`);
        this.manager.emit("nodeError", this, error);
    }
    async destroy() {
        this.destroyed = true;
        this.setState(types_1.NodeState.DESTROYED);
        this.cancelResumeWindow();
        this.resetResumeUpdateState();
        if (this.socket) {
            this.socket.close();
        }
        this.manager.emit("nodeDestroy", this.identifier);
        this.manager.emit("debug", `Moonlink.js > Node >> Node ${this.identifier} destroyed.`);
    }
    async _resumePlayers() {
        if (this.recoveryInProgress) {
            this.manager.emit("debug", `Moonlink.js > Node > Resume skipped for ${this.identifier}; recovery in progress.`);
            return;
        }
        const players = await this.rest.getPlayers();
        if (!players || players?.length === 0) {
            this.manager.emit("debug", `Moonlink.js > Node > No players to resume on node ${this.uuid}.`);
            return;
        }
        for (const playerInfo of players) {
            const guildId = playerInfo.guildId;
            const player = this.manager.players.get(guildId);
            if (player) {
                this.manager.emit("debug", `Moonlink.js > Node > Player ${guildId} found in memory. Syncing state with Lavalink.`);
                player.isResuming = true;
                player.playing = playerInfo.paused === false;
                player.paused = playerInfo.paused ?? false;
                if (player.current) {
                    player.current.position = playerInfo.state.position;
                }
                this.manager.emit("playerResumed", player);
                player.isResuming = false;
                continue;
            }
            const storage = await this.manager.database.get(`players.${guildId}`);
            if (!storage) {
                this.manager.emit("debug", `Moonlink.js > Node > No stored data found for player ${guildId}, skipping resume.`);
                continue;
            }
            this.manager.emit("debug", `Moonlink.js > Node > Attempting to resume player ${guildId} on node ${this.uuid}.`);
            const reconstructedPlayer = this.manager.players.create({
                guildId: guildId,
                voiceChannelId: storage.voiceChannelId,
                textChannelId: storage.textChannelId,
                selfDeaf: storage.selfDeaf,
                selfMute: storage.selfMute,
                volume: playerInfo.volume,
                node: this.identifier,
            });
            this.manager.emit("playerResuming", reconstructedPlayer);
            reconstructedPlayer.isResuming = true;
            reconstructedPlayer.connect();
            reconstructedPlayer.playing = playerInfo.paused === false;
            reconstructedPlayer.paused = playerInfo.paused ?? false;
            const currentTrackInfo = storage.current;
            if (currentTrackInfo && currentTrackInfo.encoded) {
                reconstructedPlayer.current = new Track_1.Track((0, Util_1.decodeTrack)(currentTrackInfo.encoded), currentTrackInfo.requester);
                reconstructedPlayer.current.position = playerInfo.state.position;
            }
            else {
                reconstructedPlayer.playing = false;
                reconstructedPlayer.paused = true;
                this.manager.emit("debug", `Moonlink.js > Node > No current track found for player ${guildId}.`);
            }
            const queueTracks = storage.queue;
            if (queueTracks && Array.isArray(queueTracks)) {
                for (const trackData of queueTracks) {
                    if (trackData.encoded) {
                        reconstructedPlayer.queue.add(new Track_1.Track((0, Util_1.decodeTrack)(trackData.encoded), trackData.requester));
                    }
                }
            }
            this.manager.emit("debug", `Moonlink.js > Player ${guildId} has been resumed on node ${this.uuid}.`);
            this.manager.emit("playerResumed", reconstructedPlayer);
            reconstructedPlayer.isResuming = false;
        }
    }
}
exports.Node = Node;
//# sourceMappingURL=Node.js.map