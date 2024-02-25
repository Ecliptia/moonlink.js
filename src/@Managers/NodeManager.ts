import {
    MoonlinkManager,
    MoonlinkNode,
    Structure,
    INode,
    SortType
} from "../../index";

export class NodeManager {
    public initiated: boolean = false;
    public _manager: MoonlinkManager;
    public map: Map<any, any>;
    constructor() {
        this.map = new Map();
    }
    public init(): void {
        this._manager = Structure.manager;
        this.check();
        this._manager.emit(
            "debug",
            "@Moonlink(Nodes) - Structure(Nodes) was successfully initialized and assigned the value of the main class and checked the nodes"
        );
        this.initiated = true;
    }
    public check(): void {
        if (!this._manager?._nodes)
            throw new Error('@Moonlink(Nodes) - "nodes" option is empty');
        if (this._manager?._nodes && !Array.isArray(this._manager?._nodes))
            throw new Error(
                '@Moonlink(Nodes) - the "nodes" option has to be in an array'
            );
        if (this._manager?._nodes && this._manager?._nodes.length == 0)
            throw new Error(
                '@Moonlink(Nodes) - there are no parameters with "node(s)" information in the object'
            );
        this._manager?._nodes.forEach(node => this.add(node));
    }
    public add(node: INode): void {
        this._manager.emit(
            "debug",
            `@Moonlink(Nodes) - The node ${
                node.host || node.identifier
            } has been added, and is starting its initialization process`
        );
        const NodeInstance: MoonlinkNode = new (Structure.get("MoonlinkNode"))(
            node
        );
        if (node.identifier) this.map.set(node.identifier, NodeInstance);
        else this.map.set(node.host, NodeInstance);
        return;
    }

    public remove(name: string): boolean {
        if (!name) {
            throw new Error('[ @Moonlink/Manager ]: option "name" is empty');
        }
        const removed = this.map.delete(name);

        this._manager.emit(
            "debug",
            `@Moonlink(Nodes) - The node ${name} has been successfully deleted`
        );
        return removed;
    }
    public get(name) {
        return this.map.get(name) ? this.map.get(name) : null;
    }
    
    public sortByUsage(sortType: SortType): MoonlinkNode[] {
        this._manager.emit(
            "debug",
            `@Moonlink(Nodes) - A new lavalink server is being drawn, sorting the type ${sortType}`
        );
        const connectedNodes = [...this.map.values()].filter(
            node => node.state == "READY"
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
