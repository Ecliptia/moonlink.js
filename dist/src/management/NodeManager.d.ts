import { INode } from "../typings/Interfaces";
import { Manager, Node, TSortTypeNode } from "../../index";
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
    get best(): Node | undefined;
    sortByUsage(sortType: TSortTypeNode, region?: string): Node | undefined;
}
