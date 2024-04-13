import { INode } from "../typings/Interfaces";
import { Node } from "../../index";
export declare class NodeManager {
    cache: Map<string | number, Node>;
    constructor(nodes: INode[]);
    check(node: INode): void;
    addNodes(nodes: INode[]): void;
}
