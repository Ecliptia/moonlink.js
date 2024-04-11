import { INode } from "../typings/Interfaces";
import { Node } from "../../index";
export declare class NodeManager {
    nodes: Map<string | number, Node>;
    constructor(nodes: INode[]);
    check(nodes: INode): void;
    addNodes(nodes: INode[]): void;
}
