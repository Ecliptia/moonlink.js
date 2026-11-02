"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeHealthMonitor = void 0;
const types_1 = require("../typings/types");
class NodeHealthMonitor {
    static available(node) {
        return node.connected && !node.destroyed &&
            node.state !== types_1.NodeState.DISCONNECTED && node.state !== types_1.NodeState.DESTROYED &&
            node.state !== types_1.NodeState.CONNECTING;
    }
    static inspect(node, options = {}, now = Date.now()) {
        if (!this.available(node))
            return { state: 'unavailable', reason: 'Node is not connected' };
        const stats = node.stats;
        if (!stats)
            return { state: 'unknown', reason: 'No statistics received' };
        if (node.statsReceivedAt && now - node.statsReceivedAt > (options.maxStatsAgeMs ?? 120000)) {
            return { state: 'unknown', reason: 'Statistics are stale' };
        }
        const cpu = stats.cpu?.systemLoad;
        const used = stats.memory?.used;
        const allocated = stats.memory?.allocated;
        if (![cpu, used, allocated].every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0) || !allocated) {
            return { state: 'unknown', reason: 'Statistics are incomplete or invalid' };
        }
        const cpuPercent = cpu * 100;
        const memoryPercent = used / allocated * 100;
        const overloaded = cpuPercent >= (options.maxCpuLoad ?? 80) || memoryPercent >= (options.maxMemoryUsage ?? 90);
        return { state: overloaded ? 'unhealthy' : 'healthy', reason: overloaded ? 'Load threshold exceeded' : 'Load within thresholds', cpuPercent, memoryPercent };
    }
}
exports.NodeHealthMonitor = NodeHealthMonitor;
//# sourceMappingURL=NodeHealthMonitor.js.map