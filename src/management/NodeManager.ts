import { INode } from "../typings/Interfaces";
import { Node } from "../../index";
export class NodeManager {
    public nodes: Map<string | number, Node> = new Map();
    constructor(nodes: INode[]) {
        this.addNodes(nodes);
    }
    public check(nodes: INode): void {}
    public addNodes(nodes: INode[]): void {
        nodes?.forEach(async node => {
            await this.check(node);
            this.nodes.set(
                node.id ?? node.identifier ?? node.host,
                new Node(node)
            );
        });
    }

}
