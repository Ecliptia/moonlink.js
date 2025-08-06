import { INode } from "../typings/Interfaces";
import { Manager, Node, TSortTypeNode, Track } from "../../index";
export declare class NodeManager {
    readonly manager: Manager;
    cache: Map<string | number, Node>;
    private healthCheckInterval?;
    constructor(manager: Manager, nodes: INode[]);
    check(node: INode): boolean;
    init(): void;
    private _checkNodesHealth;
    add(node: INode): void;
    remove(identifier: string): void;
    get(identifier: string | number): Node | undefined;
    getConnected(): Node[];
    get best(): Node | undefined;
    hasConnected(): boolean;
    getNodeWithCapability(capability: string, preferredNodeIdentifier?: string): Node | undefined;
    getBestNodeForTrack(track: Track): Node | undefined;
    sortByUsage(sortType: TSortTypeNode, region?: string): Node | undefined;
}
