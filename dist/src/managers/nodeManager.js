"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeManager = void 0;
const Util_1 = require("../Util");
class NodeManager {
    manager;
    nodes = new Map();
    constructor(manager, nodeConfigs) {
        this.manager = manager;
        for (const config of nodeConfigs) {
            this.add(config);
        }
    }
    get onlineNodes() {
        return [...this.nodes.values()].filter((node) => { return node.connected; });
    }
    get hasOnlineNodes() {
        return this.onlineNodes.length > 0;
    }
    get leastUsedNode() {
        return this.findNode("players");
    }
    get size() {
        return this.nodes.size;
    }
    get all() {
        return [...this.nodes.values()];
    }
    has(id) {
        if (this.nodes.has(id))
            return true;
        return this.all.some(node => node.identifier === id);
    }
    getById(id) {
        let node = this.nodes.get(id);
        if (!node) {
            node = this.all.find(n => n.identifier === id);
        }
        return node;
    }
    filter(predicate) {
        return this.all.filter(predicate);
    }
    find(predicate) {
        return this.all.find(predicate);
    }
    map(callback) {
        return this.all.map(callback);
    }
    forEach(callback) {
        this.all.forEach(callback);
    }
    init() {
        if (!this.nodes.size) {
            throw new Error("Moonlink.js > NodeManager#init: No nodes were provided to initialize.");
        }
        this.manager.emit("debug", `Moonlink.js > NodeManager#init: Initializing ${this.nodes.size} nodes.`);
        for (const node of this.nodes.values()) {
            node.connect();
        }
    }
    add(config) {
        this._validateConfig(config);
        const node = new (Util_1.Structure.get("Node"))(this.manager, config);
        if (this.nodes.has(node.uuid)) {
            throw new Error(`NodeManager#add: A node with the uuid "${node.uuid}" already exists.`);
        }
        this.nodes.set(node.uuid, node);
    }
    remove(id) {
        let nodeToRemove = this.nodes.get(id);
        if (!nodeToRemove) {
            nodeToRemove = [...this.nodes.values()].find(node => node.identifier === id);
        }
        if (!nodeToRemove) {
            this.manager.emit("debug", `Moonlink.js > NodeManager#remove: Could not find a node with id "${id}".`);
            return false;
        }
        nodeToRemove.destroy();
        this.nodes.delete(nodeToRemove.uuid);
        this.manager.emit("debug", `Moonlink.js > NodeManager#remove: Node ${nodeToRemove.identifier} destroyed.`);
        return true;
    }
    findNode(sortBy = "penalty") {
        const onlineNodes = this.onlineNodes;
        if (!onlineNodes.length) {
            this.manager.emit("debug", `Moonlink.js > NodeManager#findNode: No online nodes available.`);
            return undefined;
        }
        if (onlineNodes.length <= 1) {
            return onlineNodes[0];
        }
        return onlineNodes.sort((a, b) => {
            switch (sortBy) {
                case "players": {
                    const aPlayers = a?.stats?.players ?? 0;
                    const bPlayers = b?.stats?.players ?? 0;
                    return aPlayers - bPlayers;
                }
                case "playingPlayers": {
                    const aPlayers = a?.stats?.playingPlayers ?? 0;
                    const bPlayers = b?.stats?.playingPlayers ?? 0;
                    return aPlayers - bPlayers;
                }
                case "memory": {
                    const aMemory = a?.stats?.memory?.used ?? 0;
                    const bMemory = b?.stats?.memory?.used ?? 0;
                    return aMemory - bMemory;
                }
                case "cpuLavalink": {
                    const aCpu = a?.stats?.cpu?.lavalinkLoad ?? 0;
                    const bCpu = b?.stats?.cpu?.lavalinkLoad ?? 0;
                    return aCpu - bCpu;
                }
                case "cpuSystem": {
                    const aCpu = a?.stats?.cpu?.systemLoad ?? 0;
                    const bCpu = b?.stats?.cpu?.systemLoad ?? 0;
                    return aCpu - bCpu;
                }
                case "uptime": {
                    const aUptime = a?.stats?.uptime ?? 0;
                    const bUptime = b?.stats?.uptime ?? 0;
                    return bUptime - aUptime;
                }
                case "random":
                    return Math.random() - 0.5;
                case "penalty":
                default: {
                    const aPenalty = (a?.stats?.players ?? 0) + ((a?.stats?.cpu?.systemLoad ?? 0) * 100);
                    const bPenalty = (b?.stats?.players ?? 0) + ((b?.stats?.cpu?.systemLoad ?? 0) * 100);
                    return aPenalty - bPenalty;
                }
            }
        })[0];
    }
    _validateConfig(config) {
        (0, Util_1.validate)(config.host, (value) => typeof value === "string" && value.length > 0, "Node config 'host' must be a non-empty string.");
        (0, Util_1.validate)(config.port, (value) => typeof value === "number" && value >= 0 && value <= 65535, "Node config 'port' must be a number between 0 and 65535.");
        (0, Util_1.validate)(config.password, (value) => typeof value === "string", "Node config 'password' must be a string.");
        (0, Util_1.validate)(config.secure, (value) => typeof value === "boolean", "Node config 'secure' must be a boolean.");
    }
}
exports.NodeManager = NodeManager;
//# sourceMappingURL=NodeManager.js.map