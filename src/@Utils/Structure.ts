import { INode, Extendable, SortType, createOptions } from "../@Typings";
import {
    MoonlinkManager,
    MoonlinkPlayer,
    MoonlinkDatabase,
    MoonlinkQueue,
    MoonlinkNode,
    MoonlinkTrack
} from "../../index";

export class Players {
    public _manager: MoonlinkManager;
    public map: Map<any, any>;
    constructor() {
        this.map = new Map();
    }
    public init(): void {
        this._manager = Structure.manager;
    }
    public handleVoiceServerUpdate(update: any, guildId: string): void {
        const voiceServerData = { event: update };
        const existingVoiceServer = this.map.get("voiceServer") || {};
        existingVoiceServer[guildId] = voiceServerData;

        this.map.set("voiceServer", existingVoiceServer);
        this.attemptConnection(guildId);
    }

    public handlePlayerDisconnect(
        player: MoonlinkPlayer,
        guildId: string
    ): void {
        const players = this.map.get("players") || {};
        players[guildId] = {
            ...players[guildId],
            connected: false,
            voiceChannel: null,
            playing: false
        };
        player.connected = false;
        player.voiceChannel = null;
        player.playing = false;
        player.stop();
    }

    public handlePlayerMove(
        player: MoonlinkPlayer,
        newChannelId: string,
        oldChannelId: string,
        guildId: string
    ): void {
        const players: any = this.map.get("players") || {};
        players[guildId] = {
            ...players[guildId],
            voiceChannel: newChannelId
        };
        this.map.set("players", players);
        player.voiceChannel = newChannelId;
    }

    public updateVoiceStates(guildId: string, update: any): void {
        const voiceStates = this.map.get("voiceStates") || {};
        voiceStates[guildId] = update;
        this.map.set("voiceStates", voiceStates);
    }
    public async attemptConnection(guildId: string): Promise<boolean> {
        let voiceServer = this.map.get("voiceServer") || {};
        let voiceStates = this.map.get("voiceStates") || {};
        let players = this.map.get("players") || {};
        if (!players[guildId]) return false;
        if (!voiceServer[guildId]) return false;
        await this._manager.nodes.get(players[guildId].node).rest.update({
            guildId,
            data: {
                voice: {
                    sessionId: voiceStates[guildId].session_id,
                    endpoint: voiceServer[guildId].event.endpoint,
                    token: voiceServer[guildId].event.token
                }
            }
        });
        return true;
    }
    public has(guildId: string): boolean {
        let players = this.map.get("players") || {};
        if (players[guildId]) players = true;
        else players = false;
        return players;
    }
    public get(guildId: string): MoonlinkPlayer | null {
        if (!guildId && typeof guildId !== "string")
            throw new Error(
                '[ @Moonlink/Manager ]: "guildId" option in parameter to get player is empty or type is different from string'
            );
        if (!this.has(guildId)) return null;
        return new (Structure.get("MoonlinkPlayer"))(
            this.map.get("players")[guildId],
            this._manager,
            this.map
        );
    }
    public create(data: createOptions): MoonlinkPlayer {
        if (
            typeof data !== "object" ||
            !data.guildId ||
            typeof data.guildId !== "string" ||
            !data.textChannel ||
            typeof data.textChannel !== "string" ||
            !data.voiceChannel ||
            typeof data.voiceChannel !== "string" ||
            (data.autoPlay !== undefined &&
                typeof data.autoPlay !== "boolean") ||
            (data.node && typeof data.node !== "string")
        ) {
            const missingParams = [];
            if (!data.guildId || typeof data.guildId !== "string")
                missingParams.push("guildId");
            if (!data.textChannel || typeof data.textChannel !== "string")
                missingParams.push("textChannel");
            if (!data.voiceChannel || typeof data.voiceChannel !== "string")
                missingParams.push("voiceChannel");
            if (
                data.autoPlay !== undefined &&
                typeof data.autoPlay !== "boolean"
            )
                missingParams.push("autoPlay");
            if (data.node && typeof data.node !== "string")
                missingParams.push("node");

            throw new Error(
                `[ @Moonlink/Manager ]: Invalid or missing parameters for player creation: ${missingParams.join(
                    ", "
                )}`
            );
        }

        if (this.has(data.guildId)) return this.get(data.guildId);

        let players_map: Map<string, object> | object =
            this.map.get("players") || {};
        let nodeSorted = this._manager.nodes.sortByUsage(
            `${
                this._manager.options.sortNode
                    ? this._manager.options.sortNode
                    : "players"
            }`
        )[0];

        players_map[data.guildId] = {
            guildId: data.guildId,
            textChannel: data.textChannel,
            voiceChannel: data.voiceChannel,
            volume: data.volume || 80,
            playing: false,
            connected: false,
            paused: false,
            shuffled: false,
            loop: null,
            autoPlay: data.autoPlay !== undefined ? data.autoPlay : undefined,
            node: data.node || nodeSorted?.identifier || nodeSorted?.host
        };
        this.map.set("players", players_map);

        return new (Structure.get("MoonlinkPlayer"))(
            players_map[data.guildId],
            this._manager,
            this.map
        );
    }
    public get all(): Record<string, any> {
        return this.map.get("players") ? this.map.get("players") : null;
    }
}
export class Nodes {
    public initiated: boolean = false;
    public _manager: MoonlinkManager;
    public map: Map<any, any>;
    constructor() {
        this.map = new Map();
    }
    public init(): void {
        this._manager = Structure.manager;
        this.check();
        this.initiated = true;
    }
    public check(): void {
        if (!this._manager?._nodes)
            throw new Error('[ @Moonlink/Manager ]: "nodes" option is empty');
        if (this._manager?._nodes && !Array.isArray(this._manager?._nodes))
            throw new Error(
                '[ @Moonlink/Manager ]: the "nodes" option has to be in an array'
            );
        if (this._manager?._nodes && this._manager?._nodes.length == 0)
            throw new Error(
                '[ @Moonlink/Manager ]: there are no parameters with "node(s)" information in the object'
            );
        this._manager?._nodes.forEach(node => this.add(node));
    }
    public add(node: INode): void {
        const NodeInstance: MoonlinkNode = new (Structure.get("MoonlinkNode"))(
            node
        );
        if (node.identifier) this.map.set(node.identifier, NodeInstance);
        else this.map.set(node.host, NodeInstance);
        NodeInstance.init();
        return;
    }

    public remove(name: string): boolean {
        if (!name) {
            throw new Error('[ @Moonlink/Manager ]: option "name" is empty');
        }
        const removed = this.map.delete(name);
        return removed;
    }
    public get(name) {
        return this.map.get(name) ? this.map.get(name) : null;
    }
    public sortByUsage(sortType: SortType): MoonlinkNode[] {
        const connectedNodes = [...this.map.values()].filter(
            node => node.connected
        );
        if (connectedNodes.length == 0)
            throw new TypeError(
                "[ @Moonlink/Manager ]: No lavalink server connected"
            );
        switch (sortType) {
            case "memory":
                return this.sortNodesByMemoryUsage(connectedNodes);
            case "cpuLavalink":
                return this.sortNodesByLavalinkCpuLoad(connectedNodes);
            case "cpuSystem":
                return this.sortNodesBySystemCpuLoad(connectedNodes);
            case "calls":
                return this.sortNodesByCalls(connectedNodes);
            case "playingPlayers":
                return this.sortNodesByPlayingPlayers(connectedNodes);
            case "players":
            default:
                return this.sortNodesByPlayers(connectedNodes);
        }
    }
    private sortNodesByMemoryUsage(nodes: MoonlinkNode[]): MoonlinkNode[] {
        return nodes.sort(
            (a, b) =>
                (a.stats?.memory?.used || 0) - (b.stats?.memory?.used || 0)
        );
    }
    private sortNodesByLavalinkCpuLoad(nodes: MoonlinkNode[]): MoonlinkNode[] {
        return nodes.sort(
            (a, b) =>
                (a.stats?.cpu?.lavalinkLoad || 0) -
                (b.stats?.cpu?.lavalinkLoad || 0)
        );
    }
    private sortNodesBySystemCpuLoad(nodes: MoonlinkNode[]): MoonlinkNode[] {
        return nodes.sort(
            (a, b) =>
                (a.stats?.cpu?.systemLoad || 0) -
                (b.stats?.cpu?.systemLoad || 0)
        );
    }
    private sortNodesByCalls(nodes: MoonlinkNode[]): MoonlinkNode[] {
        return nodes.sort((a, b) => a.calls - b.calls);
    }
    private sortNodesByPlayingPlayers(nodes: MoonlinkNode[]): MoonlinkNode[] {
        return nodes.sort(
            (a, b) =>
                (a.stats?.playingPlayers || 0) - (b.stats?.playingPlayers || 0)
        );
    }
    private sortNodesByPlayers(nodes: MoonlinkNode[]): MoonlinkNode[] {
        return nodes.sort(
            (a, b) => (a.stats?.players || 0) - (b.stats?.players || 0)
        );
    }
}

const structures: Extendable = {
    MoonlinkManager,
    MoonlinkPlayer,
    MoonlinkDatabase,
    MoonlinkQueue,
    MoonlinkNode,
    MoonlinkTrack,
    Players,
    Nodes
};
export abstract class Structure {
    public static manager: MoonlinkManager;

    public static extend<K extends keyof Extendable, T extends Extendable[K]>(
        name: K,
        extender: (target: Extendable[K]) => T
    ): T {
        if (!(name in structures)) {
            throw new TypeError(`"${name}" is not a valid structure`);
        }

        const extended = extender(structures[name]);
        structures[name] = extended;
        return extended;
    }

    public static init(manager: MoonlinkManager): void {
        this.manager = manager;
    }

    public static get<K extends keyof Extendable>(name: K): Extendable[K] {
        const structure = structures[name];
        if (!structure) {
            throw new TypeError(`"${name}" structure must be provided.`);
        }
        return structure;
    }
}

export class Plugin {
    public load(manager: MoonlinkManager): void {}
}
