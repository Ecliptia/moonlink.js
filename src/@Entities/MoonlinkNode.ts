import {
    INode,
    INodeStats,
    SearchResult,
    PreviousInfosPlayer
} from "../@Typings";

import { MoonlinkWebSocket } from "../@Services/MoonlinkWebSocket";

import {
    MoonlinkManager,
    MoonlinkTrack,
    MoonlinkPlayer,
    MoonlinkRestFul,
    Structure
} from "../../index";

export class MoonlinkNode {
    private _manager: MoonlinkManager = Structure.manager;
    private reconnectTimeout?: NodeJS.Timeout;
    private reconnectAttempts: number = 1;
    private retryAmount: number = 6;
    private retryDelay: number = 120000;
    private resumeStatus: boolean = false;

    public host: string;
    public identifier?: string;
    public password: string;
    public port?: number;
    public secure: boolean;
    public regions?: string[];
    public http: string;
    public rest: MoonlinkRestFul;
    public info?: Record<string, any> = {};
    public version?: string;
    public resume?: boolean = Structure.manager.options?.resume;
    public resumed?: boolean;
    public autoResume?: boolean = Structure.manager.options?.autoResume;
    public resumeTimeout?: number = 30000;
    public sessionId: string;
    public socket: MoonlinkWebSocket | null;
    public state: string = "DISCONNECTED";
    public stats: INodeStats | Record<string, any> = {};
    public calls: number = 0;

    /**
     * Initializes a new MoonlinkNode instance with the provided configuration.
     * @param node - The configuration object for the Lavalink node.
     */

    constructor(node: INode) {
        this.check(node);
        this.host = node.host;
        this.identifier = node.identifier || null;
        this.password = node.password ? node.password : "youshallnotpass";
        this.port = node.port ? node.port : node.secure == true ? 443 : 80;
        this.secure = node.secure || false;
        this.regions = node.regions;
        this.http = `http${node.secure ? "s" : ""}://${this.address}/v4/`;
        this.rest = new (Structure.get("MoonlinkRestFul"))(this);

        this.connect();
    }

    /**
     * Returns the formatted address string composed of the host and port.
     * @returns The formatted address string.
     */

    public get address(): string {
        return `${this.host}:${this.port}`;
    }

    /**
     * Validates the correctness of essential configuration options for the node.
     * @param node - The configuration object for the Lavalink node.
     */

    public check(node: INode): void {
        if (typeof node.host !== "string" && typeof node.host !== "undefined")
            throw new Error(
                '@Moonlink(Nodes) - "host" option is not configured correctly'
            );
        if (
            typeof node.password !== "string" &&
            typeof node.password !== "undefined"
        )
            throw new Error(
                '@Moonlink(Nodes) - the option "password" is not set correctly'
            );
        if (
            (node.port && typeof node.port !== "number") ||
            node.port > 65535 ||
            node.port < 0
        )
            throw new Error(
                '@Moonlink(Nodes) - the "port" option is not set correctly'
            );
        if (
            typeof node.retryAmount !== "undefined" &&
            typeof node.retryAmount !== "number"
        )
            throw new Error(
                '@Moonlink(Nodes) - the "retryAmount" option is not set correctly'
            );

        if (
            typeof node.retryDelay !== "undefined" &&
            typeof node.retryDelay !== "number"
        )
            throw new Error(
                '@Moonlink(Nodes) - the "retryDelay" option is not set correctly'
            );
    }

    /**
     * Sends a request to the specified endpoint with parameters and returns a promise that resolves to the response object.
     * @param endpoint - The endpoint to send the request to.
     * @param params - The parameters for the request.
     * @returns A promise resolving to the response object.
     */

    public request(endpoint: string, params: any): Promise<object> {
        this.calls++;
        return this.rest.get(`${endpoint}?${params}`);
    }

    /**
     * Establishes a WebSocket connection to the Lavalink server.
     * @returns A promise representing the connection process.
     */

    public async connect(): Promise<any> {
        if (this.state == "CONNECTED" || this.state == "READY") return;
        this.state = "CONNECTING";
        let headers = {
            Authorization: this.password,
            "User-Id": this._manager.options.clientId,
            "Client-Name": this._manager.options.clientName
        };
        if (this.resume)
            headers["Session-Id"] = Structure.db.get(
                `sessionId.${this.identifier ?? this.host.replace(/\./g, "-")}`
            );
        this.socket = new MoonlinkWebSocket(
            `ws${this.secure ? "s" : ""}://${this.address}/v4/websocket`,
            { headers }
        );
        this.socket.on("open", this.open.bind(this));
        this.socket.on("close", this.close.bind(this));
        this.socket.on("message", this.message.bind(this));
        this.socket.on("error", this.error.bind(this));
    }
    public open(): void {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this._manager.emit(
            "debug",
            `@Moonlink(Node) - The Node ${
                this.identifier ?? this.host
            } has been connected successfully`
        );
        this._manager.emit("nodeCreate", this);
        this.state = "CONNECTED";
    }

    private reconnect(): void {
        if (this.reconnectAttempts >= this.retryAmount) {
            this._manager.emit(
                "debug",
                `@Moonlink(Node) - Node ${
                    this.identifier ?? this.host
                } was destroyed due to inactivity, attempts to reconnect were failed`
            );
            this._manager.emit("nodeDestroy", this);
            this.socket.close(1000, "destroy");
            this.socket.removeAllListeners();
        } else {
            this.reconnectTimeout = setTimeout(() => {
                this.socket.removeAllListeners();
                this.socket = null;
                this.state = "RECONNECTING";
                this._manager.emit("nodeReconnect", this);
                this.connect();
                this._manager.emit(
                    "debug",
                    `@Moonlink(Node) - We are trying to reconnect node ${
                        this.identifier ?? this.host
                    }, attempted number ${this.reconnectAttempts}
                `
                );
                if (this.getAllPlayers.length) this.movePlayers();
                this.reconnectAttempts++;
            }, this.retryDelay);
        }
    }

    protected close(code: number, reason: any): void {
        if (code !== 1000 || reason !== "destroy") this.reconnect();
        this._manager.emit(
            "debug",
            `@Moonlink(Node) - The node connection ${
                this.identifier ?? this.host
            } has been closed`
        );
        this._manager.emit("nodeClose", this, code, reason);

        this.getAllPlayers.forEach(player => {
            player.playing = false;
        });

        this.state = "DISCONNECTED";
    }

    protected error(error: Error): void {
        if (!error) return;
        this._manager.emit("nodeError", this, error);
        this._manager.emit(
            "debug",
            `@Moonlink(Nodes) - The ${
                this.identifier ?? this.host
            } an error has occurred: 
                ${error}`
        );
    }

    protected async message(data: Buffer | string): Promise<void> {
        if (Array.isArray(data)) data = Buffer.concat(data);
        else if (data instanceof ArrayBuffer) data = Buffer.from(data);

        let payload = JSON.parse(data.toString("utf8"));

        if (!payload.op) return;
        this._manager.emit("nodeRaw", this, payload);
        switch (payload.op) {
            case "ready":
                this.sessionId = payload.sessionId;
                this.resume
                    ? Structure.db.set(
                          `sessionId.${
                              this.identifier ?? this.host.replace(/\./g, "-")
                          }`,
                          this.sessionId
                      )
                    : null;
                this.resumed = payload.resumed;
                this.rest.setSessionId(this.sessionId);
                this.state = "READY";
                if (!this._manager.initiated && !this.resumed) {
                    Structure.db.delete("queue");
                    Structure.db.delete("players");
                }
                this._manager.emit(
                    "debug",
                    `@Moonlink(Node) - ${
                        this.resumed ? ` session was resumed,` : ``
                    } session is currently ${this.sessionId}`
                );
                this._manager.emit(
                    "nodeReady",
                    this,
                    this.sessionId,
                    this.resumed
                );
                if (this.resume) {
                    this.rest.patch(`sessions/${this.sessionId}`, {
                        data: {
                            resuming: this.resume,
                            timeout: this.resumeTimeout
                        }
                    });
                    this._manager.emit(
                        "debug",
                        `@Moonlink(Nodes) - Resuming configured`
                    );
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
                    const resumedPlayers: any[] = await this.rest.get(
                        `sessions/${this.sessionId}/players`
                    );
                    for (const resumedPlayer of resumedPlayers) {
                        const previousInfosPlayer: PreviousInfosPlayer =
                            Structure.db.get<PreviousInfosPlayer>(
                                `players.${resumedPlayer.guildId}`
                            ) || {};
                        const player = this._manager.players.create({
                            guildId: resumedPlayer.guildId,
                            voiceChannel: previousInfosPlayer.voiceChannel,
                            textChannel: previousInfosPlayer.textChannel,
                            volume: previousInfosPlayer.volume,
                            loop: previousInfosPlayer.loop,
                            autoPlay: previousInfosPlayer.autoPlay,
                            autoLeave: previousInfosPlayer.autoLeave,
                            node: this.identifier ?? this.host
                        });
                        player.playing = true;
                        player.connected = true;
                        player.previous = previousInfosPlayer.previous;
                        const track = new (Structure.get("MoonlinkTrack"))(
                            resumedPlayer.track
                        );
                        player.current = track;
                        player.current.position = resumedPlayer.state.position;
                        await player.restart();
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
                if (!player) return;
                player.ping = payload.state.ping;
                if (!player.current) return;
                player.current.position = payload.state.position;
                player.current.time = payload.state.time;
                break;
            case "event":
                this.handleEvent(payload);
                break;
            default:
                this._manager.emit(
                    "nodeError",
                    this,
                    new Error(
                        `@Moonlink(Nodes) - Unexpected op "${payload.op}" with data: ${payload}`
                    )
                );
        }
    }
    protected async handleEvent(payload: any): Promise<any> {
        if (!payload) return;
        if (!payload.guildId) return;
        if (!this._manager.players.has(payload.guildId)) return;
        let player: MoonlinkPlayer = this._manager.players.get(payload.guildId);
        switch (payload.type) {
            case "TrackStartEvent": {
                let current = player.current;
                if (!current) return;
                player.playing = true;
                player.paused = false;
                this._manager.emit("trackStart", player, current);
                break;
            }
            case "TrackEndEvent": {
                let track = player.current;
                let queue: string[] = player.queue.all;
                player.playing = false;

                if (this._manager.options.previousTracksInArray)
                    (player.previous as MoonlinkTrack[]).push(
                        track as MoonlinkTrack
                    );
                else player.previous = track;

                if (["loadFailed", "cleanup"].includes(payload.reason)) {
                    if (!queue) {
                        player.queue.clear();
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
                            data: { track: { encoded: track.encoded } }
                        });
                        return;
                    }
                    if (player.loop == 2) {
                        player.queue.add(player.current as MoonlinkTrack);
                        if (!queue || queue.length === 0)
                            return this._manager.emit(
                                "trackEnd",
                                player,
                                track,
                                payload
                            );

                        player.play();
                        return;
                    } else {
                        this._manager.emit("trackEnd", player, track);
                        this._manager.emit(
                            "debug",
                            "@Manager(Nodes) - invalid loop value will be ignored!"
                        );
                    }
                }
                if (player.queue.size) {
                    this._manager.emit("trackEnd", player, track);
                    player.play();
                    return;
                }
                if (
                    typeof player.autoPlay === "boolean" &&
                    player.autoPlay === true
                ) {
                    if (payload.reason == "stopped") return;
                    let uri = `https://www.youtube.com/watch?v=${track.identifier}&list=RD${track.identifier}`;
                    let req: SearchResult = await this._manager.search(uri);
                    if (
                        !req ||
                        !req.tracks ||
                        ["loadFailed", "cleanup"].includes(req.loadType)
                    )
                        return player.stop();
                    let data: any =
                        req.tracks[
                            Math.floor(
                                Math.random() * Math.floor(req.tracks.length)
                            )
                        ];
                    player.queue.add(data);
                    player.play();
                    return;
                }
                /* Logic created by PiscesXD */
                if (player.autoLeave) {
                    player.destroy();
                    this._manager.emit("autoLeaved", player, track);
                }
                if (!player.queue.size) {
                    this._manager.emit(
                        "debug",
                        "[ @Moonlink/Nodes ]: The queue is empty"
                    );
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
                const error = new Error(
                    `[ @Moonlink/Nodes ] unknown event '${payload.type}'.`
                );
                this._manager.emit("nodeError", this, error);
            }
        }
    }
    private movePlayers(): boolean {
        this.getAllPlayers.forEach(player => {
            let anotherNode = this._manager.nodes.sortByUsage(
                this._manager.options?.sortNode ?? "players"
            )[0];
            this._manager.emit(
                "debug",
                `@Moonlink(Node) - Moving player ${player.guildId} to ${
                    anotherNode.identifier ?? anotherNode.host
                }`
            );
            player.node = anotherNode;
            player.restart();
        });
        return true;
    }

    private get getAllPlayers(): MoonlinkPlayer[] {
        return Object.values(this._manager.players.all).filter(
            player => player.node === this
        );
    }
}
