import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";
export declare class YouTubePlugin extends AbstractPlugin {
    name: string;
    capabilities: string[];
    load(node: Node): void;
    unload(node: Node): void;
}
