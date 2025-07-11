"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeManager = void 0;
const index_1 = require("../../index");
class NodeManager {
    manager;
    cache = new Map();
    healthCheckInterval;
    constructor(manager, nodes) {
        this.manager = manager;
        nodes.forEach(node => {
            this.add(node);
        });
    }
    check(node) {
        let hasError = false;
        const reportError = (message) => {
            this.manager.emit("debug", message);
            hasError = true;
        };
        if (!node.host)
            reportError("(Moonlink.js) - Node > Host is required");
        if (node.port !== undefined && (node.port < 0 || node.port > 65535)) {
            reportError("(Moonlink.js) - Node > Invalid port value. Port must be a number between 0 and 65535.");
        }
        if (node.password !== undefined && typeof node.password !== "string") {
            reportError("(Moonlink.js) - Node > Invalid password value. Password must be a string.");
        }
        if (node.secure !== undefined && typeof node.secure !== "boolean") {
            reportError("(Moonlink.js) - Node > Invalid secure value. Secure must be a boolean.");
        }
        if (node.sessionId !== undefined && typeof node.sessionId !== "string") {
            reportError("(Moonlink.js) - Node > Invalid sessionId value. SessionId must be a string.");
        }
        if (node.id !== undefined && typeof node.id !== "number") {
            reportError("(Moonlink.js) - Node > Invalid id value. Id must be a number.");
        }
        if (node.identifier !== undefined && typeof node.identifier !== "string") {
            reportError("(Moonlink.js) - Node > Invalid identifier value. Identifier must be a string.");
        }
        if (node.regions !== undefined && !Array.isArray(node.regions)) {
            reportError("(Moonlink.js) - Node > Invalid regions value. Regions must be an array.");
        }
        if (node.retryDelay !== undefined && node.retryDelay < 0) {
            reportError("(Moonlink.js) - Node > Invalid retryDelay value. ReconnectTimeout must be a number greater than or equal to 0.");
        }
        if (node.retryAmount !== undefined && node.retryAmount < 0) {
            reportError("(Moonlink.js) - Node > Invalid retryAmount value. ReconnectAmount must be a number greater than or equal to 0.");
        }
        return !hasError;
    }
    init() {
        this.cache.forEach(node => {
            node.connect();
        });
        if (this.manager.options.nodeHealthCheckInterval) {
            this.healthCheckInterval = setInterval(() => this._checkNodesHealth(), this.manager.options.nodeHealthCheckInterval);
        }
    }
    async _checkNodesHealth() {
        this.manager.emit("debug", "Moonlink.js > NodeManager > Running periodic node health check.");
        for (const node of this.cache.values()) {
            if (!node.connected) {
                this.manager.emit("debug", `Moonlink.js > NodeManager > Node ${node.identifier} is disconnected, skipping health check.`);
                continue;
            }
            const status = await node.getNodeStatus();
            if (!status.health.responding || status.health.performance === 'poor' || status.health.needsRestart) {
                this.manager.emit("debug", `Moonlink.js > NodeManager > Node ${node.identifier} is unhealthy. Responding: ${status.health.responding}, Performance: ${status.health.performance}, Needs Restart: ${status.health.needsRestart}. Attempting to migrate players.`);
                await node.migrateAllPlayers();
            }
            else {
                this.manager.emit("debug", `Moonlink.js > NodeManager > Node ${node.identifier} is healthy.`);
            }
        }
    }
    add(node) {
        if (!this.check(node))
            return;
        let uuid = (0, index_1.generateUUID)(node.host, node.port);
        this.manager.emit("debug", `Moonlink.js > NodeManager > Adding node: ${node.identifier}, UUID: ${uuid}`);
        const newNode = new (index_1.Structure.get("Node"))(this.manager, node);
        this.cache.set(node.identifier ?? uuid, newNode);
        this.manager.emit("nodeCreate", newNode);
    }
    remove(identifier) {
        const node = this.cache.get(identifier);
        if (!node)
            return;
        node.destroy();
        this.cache.delete(identifier);
        this.manager.emit("nodeDestroy", identifier);
        this.manager.emit("debug", `NodeManager > Node with identifier ${identifier} has been destroyed.`);
    }
    get(identifier) {
        if (identifier === "default" && this.cache.size === 1)
            return this.cache.values().next().value;
        if (!this.cache.has(identifier)) {
            this.manager.emit("debug", `(Moonlink.js) - Node > Node with identifier ${identifier} not found.`);
            return undefined;
        }
        return this.cache.get(identifier);
    }
    get best() {
        return this.sortByUsage("players");
    }
    sortByUsage(sortType, region) {
        let nodes = [...this.cache.values()].filter(node => node.connected === true);
        if (!nodes.length) {
            this.manager.emit("debug", "(Moonlink.js) - Node > No available nodes");
            return undefined;
        }
        if (region) {
            const regionalNodes = nodes.filter(node => node.regions && node.regions.includes(region));
            if (regionalNodes.length > 0) {
                nodes = regionalNodes;
            }
            else {
                this.manager.emit("debug", `(Moonlink.js) - Node > No nodes found for region: ${region}, falling back to all available nodes.`);
            }
        }
        return nodes.sort((a, b) => {
            if (a.priority !== b.priority) {
                return (b.priority || 0) - (a.priority || 0);
            }
            switch (sortType) {
                case "players":
                    return a.stats.players - b.stats.players;
                case "playingPlayers":
                    return a.stats.playingPlayers - b.stats.playingPlayers;
                case "memory":
                    return a.stats.memory.used - b.stats.memory.used;
                case "cpuLavalink":
                    return a.stats.cpu.lavalinkLoad - b.stats.cpu.lavalinkLoad;
                case "cpuSystem":
                    return a.stats.cpu.systemLoad - b.stats.cpu.systemLoad;
                case "uptime":
                    return a.stats.uptime - b.stats.uptime;
                case "random":
                    return Math.random() - 0.5;
                default:
                    return a.stats.players - b.stats.players;
            }
        })[0];
    }
}
exports.NodeManager = NodeManager;
//# sourceMappingURL=NodeManager.js.map