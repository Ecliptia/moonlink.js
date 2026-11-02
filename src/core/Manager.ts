import { VoicePacketHandler } from '../entities/VoicePacketHandler';
import {
    IManagerEvents,
    IManagerConfig,
    IManagerOptionsConfig,
    ISearchQuery,
    ITrack,
    ITrackInfo,
    IRESTLoadTracks,
} from "../typings/Interfaces";
import type { DiscordGatewayPacket, DiscordVoicePacket } from "../typings/types";
import { Structure, validate, EventEmitter, sources, nodeLinkSources, nodeLinkOnlyError, decodeTrack, encodeTrack } from "../Util";
import { PlayerManager } from "../managers/PlayerManager";
import { DatabaseManager } from "../managers/DatabaseManager";
import { Connector } from "../connectors/Connector";
import { version } from "../..";
import { SpotifySource } from "../sources/spotify";
import { DeezerSource } from "../sources/deezer";
import { Logger } from "../logging/Logger";

export class Manager extends EventEmitter<IManagerEvents> {
    public initialized: boolean = false;
    public readonly options: IManagerOptionsConfig;
    public send: (guildId: string, payload: any) => void;
    public clientId: string;
    public readonly nodes: any;
    public readonly players: PlayerManager;
    public database: DatabaseManager;
    public readonly logger?: Logger;
    private detachLogging?: () => void;
    private idleCheckInterval?: NodeJS.Timeout;
    private initializationPromise?: Promise<this>;
    private shutdownPromise?: Promise<void>;
    private shuttingDown = false;
    private readonly connectors = new Set<Connector>();

    public get destroyed(): boolean { return this.shuttingDown; }
    private spotifySource?: SpotifySource;
    private deezerSource?: DeezerSource;

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
            clientName: `NyxLink/${version} (https://github.com/melodiabl/NyxLink)`,
            userAgent: `NyxLink/${version} (https://github.com/melodiabl/NyxLink)`,
            noReplace: false,
            resume: true,
            resumeTimeout: 60000,
            customFilters: {},
            ...config.options,
            defaultPlayer: {
                volume: 100,
                autoPlay: false,
                autoLeave: false,
                selfDeaf: true,
                selfMute: false,
                loop: "off",
                historySize: 10,
                ...config.options?.defaultPlayer
            },
            voiceConnection: {
                timeout: 15000,
                maxReconnectAttempts: 3,
                reconnectDelay: 5000,
                autoReconnect: true,
                ...config.options?.voiceConnection
            },
            node: {
                selectionStrategy: "leastLoad",
                retryDelay: 30000,
                retryAmount: 5,
                avoidUnhealthyNodes: false,
                maxCpuLoad: 80,
                maxMemoryUsage: 90,
                ...config.options?.node
            },
            search: {
                defaultPlatform: "youtube",
                resultLimit: 10,
                playlistLoadLimit: 100,
                ...config.options?.search
            },
            queue: {
                maxSize: 1000,
                allowDuplicates: true,
                historyLimit: 10,
                ...config.options?.queue
            },
            sources: {
                disabledSources: [],
                ...config.options?.sources
            },
            spotify: {
                enabled: false,
                ...config.options?.spotify
            },
            deezer: {
                enabled: false,
                ...config.options?.deezer
            },
            playerDestruction: {
                autoDestroyOnIdle: false,
                idleTimeout: 300000,
                ...config.options?.playerDestruction
            },
            trackHandling: {
                autoSkipOnError: false,
                skipStuckTracks: false,
                trackStuckThreshold: 10000,
                retryFailedTracks: false,
                maxRetryAttempts: 3,
                ...config.options?.trackHandling
            },
            playerHealth: {
                checkInterval: 30000,
                silenceTimeout: 120000,
                maxStuckCount: 3,
                maxSilentCount: 2,
                autoRecover: true,
                resumeDebounce: 1000,
                ...config.options?.playerHealth
            },
            database: {
                type: "local",
                ...config.options?.database
            }
        };
        
        Structure.setManager(this);

        this.nodes = new (Structure.get("NodeManager"))(this, config.nodes);
        this.players = new (Structure.get("PlayerManager"))(this);
        if (this.options.logging) {
            this.logger = new Logger(this.options.logging);
            this.detachLogging = this.logger.attachManager(this);
            if (this.options.logging.banner) this.logger.banner();
        }
    }

    public detachLogger(): void {
        this.detachLogging?.();
        this.detachLogging = undefined;
    }

    public use(connector: Connector, client: any): this {
        if (this.destroyed) throw new Error('Manager is shut down');
        connector.setManager(this);
        if (!this.send) this.send = connector.send.bind(connector);
        this.connectors.add(connector);
        connector.listen(client);
        return this;
    }

    public async init(clientId: string): Promise<this> {
        if (this.destroyed) throw new Error('Manager is shut down');
        if (this.initialized) return this;
        if (this.initializationPromise) return this.initializationPromise;
        validate(clientId, (id) => typeof id === 'string' && /^\d{17,20}$/.test(id), 'init requires a valid clientId (a string of 17-20 digits).');
        this.clientId = clientId;
        const starting = Promise.resolve().then(async () => {
            this.database = new DatabaseManager(this);
            try {
            await this.database.initialize();
            if (this.destroyed) return this;
            this.nodes.init();
            if (this.destroyed) return this;
            if (this.options.playerDestruction?.autoDestroyOnIdle) this.startIdleMonitoring();
            this.initialized = true;
            this.emit('debug', `Moonlink.js > Manager >> Initialized. ClientId: ${this.clientId}`);
            return this;
            } catch (error) {
                this.initialized = false;
                if (this.idleCheckInterval) clearInterval(this.idleCheckInterval);
                this.idleCheckInterval = undefined;
                const cleanup = await Promise.allSettled([...this.nodes.nodes.values()].map(node => Promise.resolve().then(() => node.destroy())));
                this.nodes.nodes.clear();
                cleanup.push(await this.database.shutdown().then(() => ({ status: 'fulfilled' as const, value: undefined }), reason => ({ status: 'rejected' as const, reason })));
                const errors = cleanup.filter(result => result.status === 'rejected').map(result => (result as PromiseRejectedResult).reason);
                if (errors.length) throw new AggregateError([error, ...errors], `Initialization failed: ${error.message}`);
                throw error;
            }
        });
        this.initializationPromise = starting;
        void starting.catch(() => { if (this.initializationPromise === starting) this.initializationPromise = undefined; });
        return starting;
    }

    /** Terminal, idempotent teardown. All resources are attempted before cleanup errors are reported. */
    public shutdown(): Promise<void> {
        if (this.shutdownPromise) return this.shutdownPromise;
        this.shuttingDown = true;
        this.initialized = false;
        if (this.idleCheckInterval) clearInterval(this.idleCheckInterval);
        this.idleCheckInterval = undefined;
        this.shutdownPromise = Promise.resolve().then(async () => {
            const errors: unknown[] = [];
            const attempt = async (operation: () => unknown) => {
                try { await operation(); } catch (error) { errors.push(error); }
            };
            if (this.initializationPromise) await attempt(() => this.initializationPromise);
            await Promise.all(this.players.all.map(player => attempt(() => player.destroy('Manager shutdown'))));
            this.players.players.clear();
            await Promise.all([...this.nodes.nodes.values()].map(node => attempt(() => node.destroy())));
            this.nodes.nodes.clear();
            for (const connector of this.connectors) await attempt(() => connector.dispose?.());
            this.connectors.clear();
            await attempt(() => this.detachLogger());
            if (this.database) await attempt(() => this.database.shutdown());
            if (Structure.getManager() === this) Structure.setManager(undefined);
            if (errors.length) throw new AggregateError(errors, 'Manager shutdown encountered cleanup failures');
        });
        return this.shutdownPromise;
    }

    private startIdleMonitoring(): void {
        const idleTimeout = this.options.playerDestruction?.idleTimeout ?? 300000;
        
        this.idleCheckInterval = setInterval(async () => {
            if (this.destroyed) return;
            const now = Date.now();
            for (const player of this.players.all) {
                if (this.destroyed) return;
                if ((!player.playing || player.paused) && now - player.lastActivityTime >= idleTimeout) {
                    this.emit("debug", `Moonlink.js > Manager >> Player ${player.guildId} has been idle for ${idleTimeout}ms. Auto-destroying...`);
                    try { await player.destroy('Idle timeout'); }
                    catch (error) { this.emit('debug', `NyxLink > Manager > Idle cleanup failed: ${error.message}`); }
                }
            }
        }, 60000);
    }

    private isSpotifyEnabled(): boolean {
        const config = this.options.spotify;
        if (!config) return false;
        if (config.enabled !== undefined) return config.enabled;
        return Boolean(config.clientId || config.clientSecret || config.accessToken);
    }

    private isDeezerEnabled(): boolean {
        const config = this.options.deezer;
        if (!config) return false;
        if (config.enabled !== undefined) return config.enabled;
        return true;
    }

    private getSpotifySource(): SpotifySource | null {
        if (!this.isSpotifyEnabled()) return null;
        if (!this.spotifySource) {
            this.spotifySource = new SpotifySource(this);
        }
        return this.spotifySource;
    }

    private getDeezerSource(): DeezerSource | null {
        if (!this.isDeezerEnabled()) return null;
        if (!this.deezerSource) {
            this.deezerSource = new DeezerSource(this);
        }
        return this.deezerSource;
    }

    private async resolveNativeSource(options: ISearchQuery): Promise<IRESTLoadTracks | null> {
        let query = options.query;
        const source = options.source?.toLowerCase();

        if (source === "spotify") {
            query = `spsearch:${options.query}`;
        } else if (source === "spsearch" || source === "sprec") {
            query = `${source}:${options.query}`;
        } else if (source === "deezer") {
            query = `dzsearch:${options.query}`;
        } else if (source === "dzsearch") {
            query = `dzsearch:${options.query}`;
        }

        const spotify = this.getSpotifySource();
        if (spotify && spotify.match(query)) {
            return spotify.load(query);
        }

        const deezer = this.getDeezerSource();
        if (deezer && deezer.match(query)) {
            return deezer.load(query);
        }

        return null;
    }

    public async search(options: ISearchQuery): Promise<any> {
        if (this.destroyed) throw new Error('Manager is shut down');
        validate(options, (o) => typeof o === "object", "Search > Search options must be an object.");
        validate(options.query, (q) => typeof q === "string" && q.length > 0, "Search > 'query' must be a non-empty string.");

        const nativeResult = await this.resolveNativeSource(options);
        if (nativeResult) {
            this.emit("debug", `Moonlink.js > Manager <- Native source result for query \"${options.query}\". LoadType: ${nativeResult.loadType}`);
            return new (Structure.get("SearchResult"))(
                nativeResult,
                options.requester,
                this.options.search?.playlistLoadLimit
            );
        }

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
                if (nodeLinkSources.has(options.source) && !node.isNodeLink) {
                    throw nodeLinkOnlyError(`search:${options.source}`);
                }
                source = sources[options.source] || options.source;
            } else {
                const defaultPlatform = this.options.search?.defaultPlatform || "youtube";
                if (nodeLinkSources.has(defaultPlatform) && !node.isNodeLink) {
                    throw nodeLinkOnlyError(`search:${defaultPlatform}`);
                }
                source = sources[defaultPlatform] || "ytsearch";
            }
            identifier = `${source}:${options.query}`;
        }

        const res = await node.rest.loadTracks(identifier);
        this.emit("debug", `Moonlink.js > Manager <- Search result for query "${options.query}". LoadType: ${res.loadType}`);
        
        const result = new (Structure.get("SearchResult"))(res, options.requester, this.options.search?.playlistLoadLimit);
        for (const track of result.tracks) track.backend = node.backend?.kind;
        
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

    public async packetUpdate(packet: DiscordGatewayPacket): Promise<void> {
        await VoicePacketHandler.handle(this, packet);
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
