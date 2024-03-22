import { INode } from "../typings/Interfaces";
import { Node } from "../../index";
export class NodeManager {
    public nodes: Map<string, Node> = new Map();
    constructor(nodes: INode[]) {
        this.addNodes(nodes);
    }
    public check(nodes: INode[]): boolean {}
    public addNodes(nodes: INode[]): void {
        nodes?.map(async node => {
            await this.check(node);
            this.node.set(
                node.id ?? node.identifier ?? node.host,
                new Node(node)
            );
        });
    }

    public init(): void {}
}
