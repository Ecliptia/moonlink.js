import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";
export declare class SponsorBlockPlugin extends AbstractPlugin {
    name: string;
    capabilities: string[];
    node: Node;
    load(node: Node): void;
    unload(node: Node): void;
    getCategories(guildId: string): Promise<string[]>;
    setCategories(guildId: string, categories: string[]): Promise<void>;
    deleteCategories(guildId: string): Promise<void>;
    handleEvent(node: Node, payload: any): void;
}
