import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";

export class YouTubePlugin extends AbstractPlugin {
    public name: string = "youtube-plugin";
    public capabilities: string[] = ["search:youtube"];

    public load(node: Node): void {
        node.manager.emit("debug", `Moonlink.js > YouTubePlugin > Loaded for node: ${node.identifier}`);
    }

    public unload(node: Node): void {
        node.manager.emit("debug", `Moonlink.js > YouTubePlugin > Unloaded for node: ${node.identifier}`);
    }
}