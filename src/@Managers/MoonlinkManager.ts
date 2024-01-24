import { EventEmitter } from "node:events";
import { performance } from "perf_hooks";
import {
    Structure,
    MoonlinkPlayer,
    MoonlinkTrack,
    MoonlinkNode,
    Players,
    Nodes,
    Plugin
} from "../../index";

import {
    INode,
    IOptions,
    VoicePacket,
    SearchResult,
    SearchQuery
} from "../@Typings";

export interface MoonlinkEvents {
    /* Logic created by PiscesXD */
    autoLeaved: (player: MoonlinkPlayer, track?: any) => void;
    debug: (...args: any) => void;
    nodeCreate: (node: MoonlinkNode) => void;
    nodeDestroy: (node: MoonlinkNode) => void;
    nodeReconnect: (node: MoonlinkNode) => void;
    nodeClose: (node: MoonlinkNode, code: number, reason: any) => void;
    nodeRaw: (node: MoonlinkNode, payload: object) => void;
    nodeError: (node: MoonlinkNode, error: Error) => void;
    trackStart: (player: MoonlinkPlayer, current: any) => void;
    trackEnd: (player: MoonlinkPlayer, track: any, payload?: any) => void;
    trackStuck: (player: MoonlinkPlayer, track: any) => void;
    trackError: (player: MoonlinkPlayer, track: any) => void;
    queueEnd: (player: MoonlinkPlayer, track?: any) => void;
    playerCreated: (guildId: string) => void;
    playerDisconnect: (player: MoonlinkPlayer) => void;
    playerResume: (player: MoonlinkPlayer) => void;
    playerMove: (
        player: MoonlinkPlayer,
        newVoiceChannel: string,
        oldVoiceChannel: string
    ) => void;
    socketClosed: (player: MoonlinkPlayer, track: any) => void;
}

export declare interface MoonlinkManager {
    on<K extends keyof MoonlinkEvents>(
        event: K,
        listener: MoonlinkEvents[K]
    ): this;
    once<K extends keyof MoonlinkEvents>(
        event: K,
        listener: MoonlinkEvents[K]
    ): this;
    emit<K extends keyof MoonlinkEvents>(
        event: K,
        ...args: Parameters<MoonlinkEvents[K]>
    ): boolean;
    off<K extends keyof MoonlinkEvents>(
        event: K,
        listener: MoonlinkEvents[K]
    ): this;
}

export class MoonlinkManager extends EventEmitter {
    public clientId: string;
    public readonly _nodes: INode[];
    public readonly _SPayload: Function;
    public readonly players: Players;
    public readonly nodes: Nodes;
    public readonly version: number = require("../../index").version;
    public options: IOptions;
    public initiated: boolean = false;

    constructor(nodes: INode[], options: IOptions, SPayload: Function) {
        super();
        this._nodes = nodes;
        this._SPayload = SPayload;
        this.players = new (Structure.get("Players"))();
        this.nodes = new (Structure.get("Nodes"))();
        this.options = options;
        if (options.plugins) {
            options.plugins.forEach(plugin => {
                plugin.load(this);
            });
        }
        if (!this.options.clientName)
            this.options.clientName = `@Moonlink/${this.version} (https://github.com/Ecliptia/moonlink.js)`;
    }
    public init(clientId?: string): this {
        if (this.initiated) return this;
        this.emit(
            "debug",
            "@Moonlink - moonlink.js has started the initialization process, do not attempt to use functions until everything is initialized correctly "
        );
        if (!clientId && !this.options.clientId)
            throw new TypeError(
                '[ @Moonlink/Manager ]: "clientId" option is required.'
            );
        this.options.clientId = clientId;
        this.clientId = clientId;
        Structure.init(this);
        this.nodes.init();
        this.players.init();
        this.initiated = true;
        return this;
    }
    public async search(options: string | SearchQuery): Promise<SearchResult> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!options) {
                    throw new Error(
                        "@Moonlink(Manager) - the search option has to be in string format or in an array"
                    );
                }

                let query;
                let source;
                let requester: any = null;
                let node;
                if (typeof options === "object") {
                    query = options.query;
                    source = options.source;
                    requester = options.requester;
                    node = options.node;
                } else {
                    query = options;
                }
                if (
                    requester &&
                    typeof requester !== "object" &&
                    typeof requester !== "string"
                ) {
                    throw new Error(
                        '[ @Moonlink/Manager ]: The "requester" option in the search function must be in string or array format'
                    );
                }
                if (source && typeof source !== "string") {
                    throw new Error(
                        "[ @Moonlink/Manager ]: the source option has to be in string format"
                    );
                }

                if (typeof query !== "string" && typeof query !== "object") {
                    throw new Error(
                        "@Moonlink(Manager) - (search) the search option has to be in string or array format"
                    );
                }
                node && this.nodes.get(node)
                    ? (node = this.nodes.get(node))
                    : (node = this.nodes.sortByUsage("memory")[0]);

                const sources = {
                    youtube: "ytsearch",
                    youtubemusic: "ytmsearch",
                    soundcloud: "scsearch"
                };

                let searchIdentifier =
                    query.startsWith("http://") || query.startsWith("https://")
                        ? query
                        : source
                        ? sources[source]
                            ? `${sources[source]}:${query}`
                            : `${source}:${query}`
                        : `ytsearch:${query}`;

                const params = new URLSearchParams({
                    identifier: searchIdentifier
                });
                const res: any = await node.request("loadtracks", params);
                if (["error", "empty"].includes(res.loadType)) {
                    this.emit(
                        "debug",
                        "@Moonlink(Manager) - not found or there was an error loading the track"
                    );
                    return resolve(res);
                }

                if (["track"].includes(res.loadType)) {
                    res.data = [res.data];
                }

                if (["playlist"].includes(res.loadType)) {
                    res.playlistInfo = {
                        duration: res.data.tracks.reduce(
                            (acc, cur) => acc + cur.info.length,
                            0
                        ),
                        name: res.data.info.name,
                        selectedTrack: res.data.info.selectedTrack
                    };
                    res.pluginInfo = res.data.pluginInfo;
                    res.data = [...res.data.tracks];
                }
                const tracks = res.data.map(
                    track =>
                        new (Structure.get("MoonlinkTrack"))(
                            track,
                            requester
                        ) as MoonlinkTrack
                );

                resolve({
                    ...res,
                    tracks
                });
            } catch (error) {
                this.emit(
                    "debug",
                    "@Moonlink(Manager) - An error occurred: " + error
                );
                reject(error);
            }
        });
    }
    public packetUpdate(packet: VoicePacket): void {
        const { t, d } = packet;
        if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(t)) return;

        const update: any = d;
        const guildId = update.guild_id;
        const player: MoonlinkPlayer = this.players.get(guildId);

        if (!update || (!update.token && !update.session_id)) return;

        if (t === "VOICE_SERVER_UPDATE") {
            this.players.handleVoiceServerUpdate(update, guildId);
        }

        if (t === "VOICE_STATE_UPDATE" && update.user_id === this.clientId) {
            if (!player) return;

            if (!update.channel_id) {
                this.players.handlePlayerDisconnect(player, guildId);
            }

            if (
                update.channel_id &&
                update.channel_id !== player.voiceChannel
            ) {
                this.players.handlePlayerMove(
                    player,
                    update.channel_id,
                    player.voiceChannel,
                    guildId
                );
            }

            this.players.updateVoiceStates(guildId, update);
            this.players.attemptConnection(guildId);
        }
    }
}
