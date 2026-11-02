"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeSelector = void 0;
const types_1 = require("../typings/types");
const NodeHealthMonitor_1 = require("./NodeHealthMonitor");
const measured = (value, fallback = Infinity) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
class NodeSelector {
    static select(nodes, options = {}, selection = {}) {
        let candidates = [...nodes].filter(node => NodeHealthMonitor_1.NodeHealthMonitor.available(node) && !selection.exclude?.includes(node.identifier));
        if (options.avoidUnhealthyNodes || selection.allowUnhealthyFallback === false) {
            const healthy = candidates.filter(node => NodeHealthMonitor_1.NodeHealthMonitor.inspect(node, options).state === 'healthy');
            const unknown = candidates.filter(node => NodeHealthMonitor_1.NodeHealthMonitor.inspect(node, options).state === 'unknown');
            if (healthy.length)
                candidates = healthy;
            else if (unknown.length)
                candidates = unknown;
            else if (selection.allowUnhealthyFallback === false)
                candidates = [];
        }
        const ready = candidates.filter(node => node.state === types_1.NodeState.READY);
        if (ready.length)
            candidates = ready;
        if (!candidates.length)
            return undefined;
        const strategy = options.selectionStrategy ?? 'leastLoad';
        if (strategy === 'random')
            return candidates[Math.floor(Math.random() * candidates.length)];
        const score = (node) => {
            const stats = node.stats;
            switch (strategy) {
                case 'players':
                case 'leastPlayers': return measured(stats?.players);
                case 'playingPlayers': return measured(stats?.playingPlayers);
                case 'memory': return measured(stats?.memory?.used);
                case 'cpuLavalink': return measured(stats?.cpu?.lavalinkLoad);
                case 'cpuSystem': return measured(stats?.cpu?.systemLoad);
                case 'uptime': return -measured(stats?.uptime, -Infinity);
                case 'priority': return typeof node.priority === 'number' && Number.isFinite(node.priority) ? node.priority : 0;
                default: return measured(stats?.players) + measured(stats?.cpu?.systemLoad) * 100;
            }
        };
        return candidates.reduce((best, node) => score(node) < score(best) ? node : best);
    }
}
exports.NodeSelector = NodeSelector;
//# sourceMappingURL=NodeSelector.js.map