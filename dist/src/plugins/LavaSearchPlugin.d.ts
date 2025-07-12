import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";
import { ILavaSearchResultData } from "../typings/Interfaces";
export declare class LavaSearchPlugin extends AbstractPlugin {
    name: string;
    capabilities: string[];
    node: Node;
    load(node: Node): void;
    unload(node: Node): void;
    search(query: string, options: {
        source?: string;
        types?: string;
    }): Promise<ILavaSearchResultData>;
}
