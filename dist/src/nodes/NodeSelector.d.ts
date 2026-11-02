import type { Node } from '../entities/Node';
import type { INodeOptions } from '../typings/Interfaces';
export type NodeSelectionOptions = {
    exclude?: string[];
    allowUnhealthyFallback?: boolean;
};
export declare class NodeSelector {
    static select(nodes: Iterable<Node>, options?: INodeOptions, selection?: NodeSelectionOptions): Node | undefined;
}
