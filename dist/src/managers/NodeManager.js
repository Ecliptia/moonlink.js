"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeManager = void 0;
const NodeFailover_1 = require("../nodes/NodeFailover");
const NodeSelector_1 = require("../nodes/NodeSelector");
const NodeHealthMonitor_1 = require("../nodes/NodeHealthMonitor");
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
            if (this.manager.destroyed)
                return;
            this.add(config);
        }
        for (const node of this.nodes.values()) {
            if (this.manager.destroyed)
                return;
            node.connect();
        }
    }
    add(config) {
        if (this.manager.destroyed)
            throw new Error('Manager is shut down');
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
        return [...this.nodes.values()].filter(node => NodeHealthMonitor_1.NodeHealthMonitor.available(node));
    }
    get hasOnlineNodes() {
        return this.onlineNodes.length > 0;
    }
    get ready() {
        return this.onlineNodes.filter(node => node.state === types_1.NodeState.READY);
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
    findNode(options = {}) {
        return NodeSelector_1.NodeSelector.select(this.nodes.values(), this.manager.options.node, options);
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
            const results = await Promise.all(playersToMove.map(player => NodeFailover_1.NodeFailover.move(player, node)));
            const failed = playersToMove.filter((_, index) => results[index].status === 'failed');
            if (failed.length) {
                this.manager.emit('playersOrphaned', failed, node);
                if (!this.manager.options.node?.failover?.preserveOnFailure) {
                    await Promise.all(failed.map(player => player.destroy('Node ejected: failover failed')));
                }
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