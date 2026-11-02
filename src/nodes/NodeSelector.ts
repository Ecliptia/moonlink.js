import type { Node } from '../entities/Node';
import type { INodeOptions } from '../typings/Interfaces';
import { NodeState } from '../typings/types';
import { NodeHealthMonitor } from './NodeHealthMonitor';

export type NodeSelectionOptions = { exclude?: string[]; allowUnhealthyFallback?: boolean };

const measured = (value: unknown, fallback = Infinity): number =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;

export class NodeSelector {
    public static select(nodes: Iterable<Node>, options: INodeOptions = {}, selection: NodeSelectionOptions = {}): Node | undefined {
        let candidates = [...nodes].filter(node => NodeHealthMonitor.available(node) && !selection.exclude?.includes(node.identifier));
        if (options.avoidUnhealthyNodes || selection.allowUnhealthyFallback === false) {
            const healthy = candidates.filter(node => NodeHealthMonitor.inspect(node, options).state === 'healthy');
            const unknown = candidates.filter(node => NodeHealthMonitor.inspect(node, options).state === 'unknown');
            if (healthy.length) candidates = healthy;
            else if (unknown.length) candidates = unknown;
            else if (selection.allowUnhealthyFallback === false) candidates = [];
        }
        const ready = candidates.filter(node => node.state === NodeState.READY);
        if (ready.length) candidates = ready;
        if (!candidates.length) return undefined;
        const strategy = options.selectionStrategy ?? 'leastLoad';
        if (strategy === 'random') return candidates[Math.floor(Math.random() * candidates.length)];
        const score = (node: Node): number => {
            const stats = node.stats;
            switch (strategy) {
                case 'players': case 'leastPlayers': return measured(stats?.players);
                case 'playingPlayers': return measured(stats?.playingPlayers);
                case 'memory': return measured(stats?.memory?.used);
                case 'cpuLavalink': return measured(stats?.cpu?.lavalinkLoad);
                case 'cpuSystem': return measured(stats?.cpu?.systemLoad);
                case 'uptime': return -measured(stats?.uptime, -Infinity);
                case 'priority': return typeof node.priority === 'number' && Number.isFinite(node.priority) ? node.priority : 0;
                default: return measured(stats?.players) + measured(stats?.cpu?.systemLoad) * 100;
            }
        };
        // Strict comparison preserves insertion order for equal/unknown scores.
        return candidates.reduce((best, node) => score(node) < score(best) ? node : best);
    }
}
