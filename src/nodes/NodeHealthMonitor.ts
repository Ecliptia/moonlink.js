import type { Node } from '../entities/Node';
import type { INodeOptions } from '../typings/Interfaces';
import { NodeState } from '../typings/types';

export type NodeHealth = {
    state: 'healthy' | 'unhealthy' | 'unknown' | 'unavailable';
    reason: string;
    cpuPercent?: number;
    memoryPercent?: number;
};

/** Observes existing statistics; it adds no polling timer or automatic migration. */
export class NodeHealthMonitor {
    public static available(node: Node): boolean {
        return node.connected && !node.destroyed &&
            node.state !== NodeState.DISCONNECTED && node.state !== NodeState.DESTROYED &&
            node.state !== NodeState.CONNECTING;
    }

    public static inspect(node: Node, options: INodeOptions = {}, now = Date.now()): NodeHealth {
        if (!this.available(node)) return { state: 'unavailable', reason: 'Node is not connected' };
        const stats = node.stats;
        if (!stats) return { state: 'unknown', reason: 'No statistics received' };
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
