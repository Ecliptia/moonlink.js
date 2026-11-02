import type { Node } from '../entities/Node';
import type { INodeOptions } from '../typings/Interfaces';
export type NodeHealth = {
    state: 'healthy' | 'unhealthy' | 'unknown' | 'unavailable';
    reason: string;
    cpuPercent?: number;
    memoryPercent?: number;
};
export declare class NodeHealthMonitor {
    static available(node: Node): boolean;
    static inspect(node: Node, options?: INodeOptions, now?: number): NodeHealth;
}
