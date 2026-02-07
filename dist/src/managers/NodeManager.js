"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeManager = void 0;
const types_1 = require("../typings/types");
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
    get ready() {
        return [...this.nodes.values()].filter((node) => node.state === types_1.NodeState.READY);
    }
    get hasReady() {
        return this.ready.length > 0;
    }
    get leastUsedNode() {
        return this.findNode();
    }
    get stats() {
        const nodeStats = {};
        for (const node of this.onlineNodes) {
            if (node.stats) {
                nodeStats[node.identifier] = node.stats;
            }
        }
        return nodeStats;
    }
    findNode(options) {
        const nodeOptions = this.manager.options.node;
        const sortBy = nodeOptions?.selectionStrategy ?? "penalty";
        let nodes = this.ready.length ? this.ready : this.onlineNodes;
        if (options?.exclude) {
            nodes = nodes.filter(node => !options.exclude.includes(node.identifier));
        }
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
        const scoredNodes = nodes.map((node) => {
            const players = node.stats?.players ?? 0;
            const cpuSystem = node.stats?.cpu?.systemLoad ?? 0;
            return {
                node,
                players,
                playingPlayers: node.stats?.playingPlayers ?? 0,
                memory: node.stats?.memory?.used ?? 0,
                cpuLavalink: node.stats?.cpu?.lavalinkLoad ?? 0,
                cpuSystem,
                uptime: node.stats?.uptime ?? 0,
                priority: node.priority ?? 0,
                penalty: players + (cpuSystem * 100),
            };
        });
        if (sortBy === "random") {
            return scoredNodes[Math.floor(Math.random() * scoredNodes.length)].node;
        }
        const pickLowest = (key) => scoredNodes.reduce((best, current) => (current[key] < best[key] ? current : best)).node;
        const pickHighest = (key) => scoredNodes.reduce((best, current) => (current[key] > best[key] ? current : best)).node;
        switch (sortBy) {
            case "leastPlayers":
            case "players":
                return pickLowest("players");
            case "playingPlayers":
                return pickLowest("playingPlayers");
            case "memory":
                return pickLowest("memory");
            case "cpuLavalink":
                return pickLowest("cpuLavalink");
            case "cpuSystem":
                return pickLowest("cpuSystem");
            case "uptime":
                return pickHighest("uptime");
            case "priority":
                return pickLowest("priority");
            case "leastLoad":
            case "penalty":
            default:
                return pickLowest("penalty");
        }
    }
    async eject(identifier) {
        const node = this.nodes.get(identifier);
        if (!node) {
            this.manager.emit("debug", `Moonlink.js > NodeManager#eject: Node ${identifier} not found.`);
            return false;
        }
        const playersToMove = this.manager.players.filter(player => player.node.identifier === identifier);
        if (playersToMove.length > 0) {
            this.manager.emit("debug", `Moonlink.js > NodeManager#eject: Moving ${playersToMove.length} players from ${identifier}...`);
            const newNode = this.findNode({ exclude: [identifier] });
            if (newNode) {
                await Promise.all(playersToMove.map(player => player.transferNode(newNode)));
            }
            else {
                this.manager.emit("debug", `Moonlink.js > NodeManager#eject: No other nodes available to receive players from ${identifier}. Players will be destroyed.`);
                await Promise.all(playersToMove.map(player => player.destroy("Node Ejected")));
            }
        }
        this.remove(identifier);
        this.manager.emit("debug", `Moonlink.js > NodeManager#eject: Node ${identifier} ejected successfully.`);
        return true;
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