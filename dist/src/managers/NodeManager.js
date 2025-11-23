"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeManager = void 0;
const Util_1 = require("../Util");
class NodeManager {
    manager;
    nodes = new Map();
    nodeConfigs;
    constructor(manager, nodeConfigs) {
        this.manager = manager;
        this.nodeConfigs = nodeConfigs;
    }
    init() {
        for (const config of this.nodeConfigs) {
            this.add(config);
        }
        for (const node of this.nodes.values()) {
            node.connect();
        }
    }
    add(config) {
        this._validateConfig(config);
        const identifier = config.identifier || `${config.host}:${config.port}`;
        if (this.nodes.has(identifier)) {
            throw new Error(`Node with identifier '${identifier}' already exists.`);
        }
        const node = new (Util_1.Structure.get("Node"))(this.manager, { ...config, identifier });
        this.nodes.set(identifier, node);
        this.manager.emit("nodeCreate", node);
        this.manager.emit("debug", `Moonlink.js > NodeManager#add: Node added. Identifier: ${identifier}`);
    }
    remove(identifier) {
        const node = this.nodes.get(identifier);
        if (!node)
            return false;
        node.destroy();
        return this.nodes.delete(identifier);
    }
    get onlineNodes() {
        return [...this.nodes.values()].filter((node) => { return node.connected; });
    }
    get hasOnlineNodes() {
        return this.onlineNodes.length > 0;
    }
    get leastUsedNode() {
        return this.findNode();
    }
    findNode() {
        const nodeOptions = this.manager.options.node;
        const sortBy = nodeOptions?.selectionStrategy ?? "penalty";
        let nodes = this.onlineNodes;
        if (!nodes.length) {
            this.manager.emit("debug", `Moonlink.js > NodeManager#findNode: No online nodes available.`);
            return undefined;
        }
        if (nodeOptions?.avoidUnhealthyNodes) {
            const healthyNodes = nodes.filter(node => {
                if (!node.stats)
                    return true;
                const cpuLoad = node.stats.cpu.systemLoad * 100;
                const memoryUsage = (node.stats.memory.used / node.stats.memory.allocated) * 100;
                const isHealthy = cpuLoad < (nodeOptions.maxCpuLoad ?? 80) && memoryUsage < (nodeOptions.maxMemoryUsage ?? 90);
                if (!isHealthy) {
                    this.manager.emit("debug", `Moonlink.js > NodeManager#findNode: Node ${node.identifier} is unhealthy. CPU: ${cpuLoad.toFixed(2)}%, Memory: ${memoryUsage.toFixed(2)}%`);
                }
                return isHealthy;
            });
            if (healthyNodes.length) {
                nodes = healthyNodes;
            }
            else {
                this.manager.emit("debug", `Moonlink.js > NodeManager#findNode: No healthy nodes available, falling back to all online nodes.`);
            }
        }
        if (nodes.length <= 1) {
            return nodes[0];
        }
        return nodes.sort((a, b) => {
            switch (sortBy) {
                case "leastPlayers":
                case "players":
                    return (a.stats?.players ?? 0) - (b.stats?.players ?? 0);
                case "playingPlayers":
                    return (a.stats?.playingPlayers ?? 0) - (b.stats?.playingPlayers ?? 0);
                case "memory":
                    return (a.stats?.memory?.used ?? 0) - (b.stats?.memory?.used ?? 0);
                case "cpuLavalink":
                    return (a.stats?.cpu?.lavalinkLoad ?? 0) - (b.stats?.cpu?.lavalinkLoad ?? 0);
                case "cpuSystem":
                    return (a.stats?.cpu?.systemLoad ?? 0) - (b.stats?.cpu?.systemLoad ?? 0);
                case "uptime":
                    return (b.stats?.uptime ?? 0) - (a.stats?.uptime ?? 0);
                case "random":
                    return Math.random() - 0.5;
                case "priority":
                    return (a.priority ?? 0) - (b.priority ?? 0);
                case "leastLoad":
                case "penalty":
                default:
                    const aPenalty = (a.stats?.players ?? 0) + ((a.stats?.cpu?.systemLoad ?? 0) * 100);
                    const bPenalty = (b.stats?.players ?? 0) + ((b.stats?.cpu?.systemLoad ?? 0) * 100);
                    return aPenalty - bPenalty;
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