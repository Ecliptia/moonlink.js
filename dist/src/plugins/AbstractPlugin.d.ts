import { Node } from "../entities/Node";
export declare abstract class AbstractPlugin {
    abstract readonly name: string;
    abstract readonly capabilities: string[];
    abstract load(node: Node): void;
    abstract unload(node: Node): void;
    onNodeInfoUpdate?(node: Node): void;
}
