import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";

export class YouTubePlugin extends AbstractPlugin {
    public name: string = "youtube-plugin";
    public capabilities: string[] = ["search:youtube"];

    public load(node: Node): void {}

    public unload(node: Node): void {}
}