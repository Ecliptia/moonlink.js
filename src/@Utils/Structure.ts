import { INode } from "../@Typings";
import { MoonlinkManager } from "../../index";
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
        this.emit("playerDisconnect", player);
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
        this.emit("playerMove", player, newChannelId, oldChannelId);
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
}
export class Nodes {
    public readonly initiated: boolean = false;
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
    public sortByUsage(sortType: SortType): MoonlinkNode[] {
        const connectedNodes = [...this.nodes.values()].filter(
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

const structures = {
    MoonlinkNode: require("../@Entities/MoonlinkNode").MoonlinkNode,
    Players,
    Nodes
};
export abstract class Structure {
    public static manager: Manager;
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
