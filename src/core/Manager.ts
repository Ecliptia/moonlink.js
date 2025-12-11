import {
    IManagerEvents,
    IManagerConfig,
    IManagerOptionsConfig,
    ISearchQuery,
    ITrack,
    ITrackInfo,
} from "../typings/Interfaces";
import { Structure, validate, EventEmitter, sources, decodeTrack, encodeTrack } from "../Util";
import { PlayerManager } from "../managers/PlayerManager";
import { DatabaseManager } from "../managers/DatabaseManager";
import { Connector } from "../connectors/Connector";
import { version } from "../..";

export class Manager extends EventEmitter<IManagerEvents> {
    public initialized: boolean = false;
    public readonly options: IManagerOptionsConfig;
    public send: (guildId: string, payload: any) => void;
    public clientId: string;
    public readonly nodes: any;
    public readonly players: PlayerManager;
    public database: DatabaseManager;
    private idleCheckInterval?: NodeJS.Timeout;

    public get readyNodes() {
        return this.nodes.ready;
    }
    public get hasReadyNodes() {
        return this.nodes.hasReady;
    }

    constructor(config: IManagerConfig) {
        super();

        validate(config, (value) => value != null, "Manager constructor requires a config object.");
        validate(config.nodes, (value) => Array.isArray(value) && value.length > 0, "Manager config requires a non-empty nodes array.");
        validate(config.options, (value) => value == null || (typeof value === "object" && !Array.isArray(value)), "Manager config 'options' must be a plain object if provided.");

        this.send = config.send || null;
        
        this.options = { 
            clientName: `Moonlink.js/${version} (https://github.com/Ecliptia/moonlink.js)`,
            userAgent: `Moonlink.js/${version} (Snoozy/16.11.2025)`,
            noReplace: false,
            resume: false,
            resumeTimeout: 60000,
            customFilters: {},
            defaultPlayer: {
                volume: 100,
                autoPlay: false,
                autoLeave: false,
                selfDeaf: true,
                selfMute: false,
                loop: "off",
                historySize: 10
            },
            voiceConnection: {
                timeout: 15000,
                maxReconnectAttempts: 3,
                reconnectDelay: 5000,
                autoReconnect: true
            },
            node: {
                selectionStrategy: "leastLoad",
                retryDelay: 30000,
                retryAmount: 5,
                avoidUnhealthyNodes: false,
                maxCpuLoad: 80,
                maxMemoryUsage: 90
            },
            search: {
                defaultPlatform: "youtube",
                resultLimit: 10,
                playlistLoadLimit: 100
            },
            queue: {
                maxSize: 1000,
                allowDuplicates: true,
                historyLimit: 10
            },
            sources: {
                disabledSources: []
            },
            playerDestruction: {
                autoDestroyOnIdle: false,
                idleTimeout: 300000
            },
            trackHandling: {
                autoSkipOnError: false,
                skipStuckTracks: false,
                trackStuckThreshold: 10000,
                retryFailedTracks: false,
                maxRetryAttempts: 3
            },
            database: {
                type: "local"
            },
            ...config.options 
        };

        Structure.setManager(this);

        this.nodes = new (Structure.get("NodeManager"))(this, config.nodes);
        this.players = new (Structure.get("PlayerManager"))(this);
    }

    public use(connector: Connector, client: any): this {
        connector.setManager(this);
        if (!this.send) this.send = connector.send.bind(connector);
        connector.listen(client);
        return this;
    }

    public async init(clientId: string): Promise<this> {
        if (this.initialized) return this;

        validate(clientId, (id) => typeof id === "string" && /^\d{17,20}$/.test(id), "init requires a valid clientId (a string of 17-20 digits).");
        this.clientId = clientId;
        this.database = new DatabaseManager(this);
        await this.database.initialize();

        this.nodes.init();
        
        if (this.options.playerDestruction?.autoDestroyOnIdle) {
            this.startIdleMonitoring();
        }
        
        this.initialized = true;
        this.emit("debug", `Moonlink.js > Manager >> Initialized. ClientId: ${this.clientId}`);
        return this;
    }

    private startIdleMonitoring(): void {
        const idleTimeout = this.options.playerDestruction?.idleTimeout ?? 300000;
        
        this.idleCheckInterval = setInterval(async () => {
            const now = Date.now();
            for (const player of this.players.all) {
                if ((!player.playing || player.paused) && now - player.lastActivityTime >= idleTimeout) {
                    this.emit("debug", `Moonlink.js > Manager >> Player ${player.guildId} has been idle for ${idleTimeout}ms. Auto-destroying...`);
                    await player.destroy();
                }
            }
        }, 60000);
    }

    public async search(options: ISearchQuery): Promise<any> {
        validate(options, (o) => typeof o === "object", "Search > Search options must be an object.");
        validate(options.query, (q) => typeof q === "string" && q.length > 0, "Search > 'query' must be a non-empty string.");

        const node = options.node ? this.nodes.nodes.get(options.node) : this.nodes.findNode();
        if (!node) {
            throw new Error("Moonlink.js > Search > No available nodes for searching.");
        }

        let identifier: string;
        const URL_REGEX = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

        if (URL_REGEX.test(options.query)) {
            identifier = options.query;
        } else {
            let source: string;
            if (options.source) {
                source = sources[options.source] || options.source;
            } else {
                const defaultPlatform = this.options.search?.defaultPlatform || "youtube";
                source = sources[defaultPlatform] || "ytsearch";
            }
            identifier = `${source}:${options.query}`;
        }

        const res = await node.rest.loadTracks(identifier);
        this.emit("debug", `Moonlink.js > Manager <- Search result for query "${options.query}". LoadType: ${res.loadType}`);
        
        const result = new (Structure.get("SearchResult"))(res, options.requester, this.options.search?.playlistLoadLimit);
        
        if (result.loadType === "search") {
            result.tracks = result.tracks.slice(0, this.options.search?.resultLimit ?? 10);
        }

        if (this.options.sources?.disabledSources && this.options.sources.disabledSources.length > 0) {
            result.tracks = result.tracks.filter(track => {
                const isDisabled = this.options.sources.disabledSources.includes(track.sourceName);
                if (isDisabled) {
                    this.emit("debug", `Moonlink.js > Manager >> Filtered out track from disabled source: ${track.sourceName} - ${track.title}`);
                }
                return !isDisabled;
            });
        }
        
        return result;
    }

    public async packetUpdate(packet: any): Promise<void> {
        if (!this.initialized || !["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t)) return;

        const player = this.players.get(packet.d.guild_id);
        if (!player) {
            this.emit("debug", `Moonlink.js > Manager <- Received packet for non-existent player. GuildId: ${packet.d.guild_id}, Packet Type: ${packet.t}`);
            return;
        }

        switch (packet.t) {
            case "VOICE_STATE_UPDATE":
                if (packet.d.user_id !== this.clientId) return;
                this.emit("debug", `Moonlink.js > Manager <- Received VOICE_STATE_UPDATE. Guild: ${packet.d.guild_id}, Data: ${JSON.stringify(packet.d)}`);
                player.voice.handleStateUpdate(packet.d);
                break;
            case "VOICE_SERVER_UPDATE":
                this.emit("debug", `Moonlink.js > Manager <- Received VOICE_SERVER_UPDATE. Guild: ${packet.d.guild_id}, Data: ${JSON.stringify(packet.d)}`);
                player.voice.handleServerUpdate(packet.d);
                break;
        }
    }

    public decodeTrack(encoded: string): ITrack {
        validate(encoded, (v) => typeof v === "string", "Manager#decodeTrack > Encoded string must be a string.");
        return decodeTrack(encoded);
    }

    public encodeTrack(track: ITrackInfo): string {
        validate(track, (v) => typeof v === "object", "Manager#encodeTrack > Track info must be an object.");
        return encodeTrack(track);
    }
}