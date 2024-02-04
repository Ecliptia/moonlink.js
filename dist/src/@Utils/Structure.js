"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = exports.Structure = exports.Nodes = exports.State = void 0;
const index_1 = require("../../index");
exports.State = {
    READY: "READY",
    CONNECTED: "CONNECTED",
    CONNECTING: "CONNECTING",
    DISCONNECTING: "DISCONNECTING",
    DISCONNECTED: "DISCONNECTED",
    RECONNECTING: "RECONNECTING",
    AUTORESUMING: "AUTORESUMING",
    RESUMING: "RESUMING",
    MOVING: "MOVING"
};
class Nodes {
    initiated = false;
    _manager;
    map;
    constructor() {
        this.map = new Map();
    }
    init() {
        this._manager = Structure.manager;
        this.check();
        this._manager.emit("debug", "@Moonlink(Nodes) - Structure(Nodes) was successfully initialized and assigned the value of the main class and checked the nodes");
        this.initiated = true;
    }
    check() {
        if (!this._manager?._nodes)
            throw new Error('@Moonlink(Nodes) - "nodes" option is empty');
        if (this._manager?._nodes && !Array.isArray(this._manager?._nodes))
            throw new Error('@Moonlink(Nodes) - the "nodes" option has to be in an array');
        if (this._manager?._nodes && this._manager?._nodes.length == 0)
            throw new Error('@Moonlink(Nodes) - there are no parameters with "node(s)" information in the object');
        this._manager?._nodes.forEach(node => this.add(node));
    }
    add(node) {
        this._manager.emit("debug", `@Moonlink(Nodes) - The node ${node.host || node.identifier} has been added, and is starting its initialization process`);
        const NodeInstance = new (Structure.get("MoonlinkNode"))(node);
        if (node.identifier)
            this.map.set(node.identifier, NodeInstance);
        else
            this.map.set(node.host, NodeInstance);
        return;
    }
    remove(name) {
        if (!name) {
            throw new Error('[ @Moonlink/Manager ]: option "name" is empty');
        }
        const removed = this.map.delete(name);
        this._manager.emit("debug", `@Moonlink(Nodes) - The node ${name} has been successfully deleted`);
        return removed;
    }
    get(name) {
        return this.map.get(name) ? this.map.get(name) : null;
    }
    sortByUsage(sortType) {
        this._manager.emit("debug", `@Moonlink(Nodes) - A new lavalink server is being drawn, sorting the type ${sortType}`);
        const connectedNodes = [...this.map.values()].filter(node => node.state == exports.State.READY);
        if (connectedNodes.length == 0)
            throw new TypeError("[ @Moonlink/Manager ]: No lavalink server connected");
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
    sortNodesByMemoryUsage(nodes) {
        return nodes.sort((a, b) => (a.stats?.memory?.used || 0) - (b.stats?.memory?.used || 0));
    }
    sortNodesByLavalinkCpuLoad(nodes) {
        return nodes.sort((a, b) => (a.stats?.cpu?.lavalinkLoad || 0) -
            (b.stats?.cpu?.lavalinkLoad || 0));
    }
    sortNodesBySystemCpuLoad(nodes) {
        return nodes.sort((a, b) => (a.stats?.cpu?.systemLoad || 0) -
            (b.stats?.cpu?.systemLoad || 0));
    }
    sortNodesByCalls(nodes) {
        return nodes.sort((a, b) => a.calls - b.calls);
    }
    sortNodesByPlayingPlayers(nodes) {
        return nodes.sort((a, b) => (a.stats?.playingPlayers || 0) - (b.stats?.playingPlayers || 0));
    }
    sortNodesByPlayers(nodes) {
        return nodes.sort((a, b) => (a.stats?.players || 0) - (b.stats?.players || 0));
    }
}
exports.Nodes = Nodes;
const structures = {
    MoonlinkManager: index_1.MoonlinkManager,
    MoonlinkRestFul: index_1.MoonlinkRestFul,
    MoonlinkPlayer: index_1.MoonlinkPlayer,
    MoonlinkFilters: index_1.MoonlinkFilters,
    MoonlinkDatabase: index_1.MoonlinkDatabase,
    MoonlinkQueue: index_1.MoonlinkQueue,
    MoonlinkNode: index_1.MoonlinkNode,
    MoonlinkTrack: index_1.MoonlinkTrack,
    PlayerManager: index_1.PlayerManager,
    Nodes
};
class Structure {
    static manager;
    static db;
    static extend(name, extender) {
        if (!(name in structures)) {
            throw new TypeError(`"${name}" is not a valid structure`);
        }
        const extended = extender(structures[name]);
        structures[name] = extended;
        return extended;
    }
    static init(manager) {
        this.manager = manager;
        this.db = new (Structure.get("MoonlinkDatabase"))(manager.clientId);
        this.manager.emit("debug", `@Moonlink(Structure) - The main class and database are assigned to structure :)`);
    }
    static get(name) {
        const structure = structures[name];
        if (!structure) {
            throw new TypeError(`"${name}" structure must be provided.`);
        }
        return structure;
    }
}
exports.Structure = Structure;
class Plugin {
    load(manager) { }
}
exports.Plugin = Plugin;
