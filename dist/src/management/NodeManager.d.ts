import { INode } from "../typings/Interfaces";
import { Manager, Node } from "../../index";
export declare class NodeManager {
    readonly manager: Manager;
    cache: Map<string | number, Node>;
    constructor(manager: Manager, nodes: INode[]);
    check(node: INode): void;
    init(): void;
    add(node: INode): void;
    remove(identifier: string | number): void;
    get(identifier: string | number): Node;
    get best(): Node;
}
