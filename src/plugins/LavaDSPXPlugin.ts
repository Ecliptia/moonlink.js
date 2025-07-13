import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";

export class LavaDSPXPlugin extends AbstractPlugin {
    public name: string = "lavadspx-plugin";
    public capabilities: string[] = ["lavadspx"];

    public load(node: Node): void {
        node.manager.emit("debug", `Moonlink.js > LavaDSPXPlugin > Loaded for node ${node.identifier}`);
    }

    public unload(node: Node): void {
        node.manager.emit("debug", `Moonlink.js > LavaDSPXPlugin > Unloaded for node ${node.identifier}`);
    }
}
