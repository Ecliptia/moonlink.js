import { Node } from "../entities/Node";
import { AbstractPlugin } from "./AbstractPlugin";
export declare class LavaSrcPlugin extends AbstractPlugin {
    name: string;
    capabilities: string[];
    load(node: Node): void;
    unload(node: Node): void;
    onNodeInfoUpdate(node: Node): void;
}
