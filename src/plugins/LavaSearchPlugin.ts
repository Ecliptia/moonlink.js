import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";
import { ILavaSearchResultData } from "../typings/Interfaces";
import { sources } from "../Utils";

export class LavaSearchPlugin extends AbstractPlugin {
    public name: string = "lavasearch-plugin";
    public capabilities: string[] = ["lavasearch"]
    public node: Node;

    public load(node: Node): void {
        this.node = node;
    }

    public unload(node: Node): void {
    }

    public async search(query: string, options: { source?: string; types?: string }): Promise<ILavaSearchResultData> {
        const params = new URLSearchParams({
            query: `${sources[options.source] ?? options.source}:${query}`,
            types: options.types ?? "track,album,artist,playlist,text",
        });
        const request: ILavaSearchResultData = await this.node.rest.get(`loadsearch?${params}`);
        return request;
    }
}