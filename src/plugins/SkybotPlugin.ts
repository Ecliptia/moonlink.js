import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";

export class SkybotPlugin extends AbstractPlugin {
    public name: string = "DuncteBot-plugin";
    public capabilities: string[] = [
        "search:pornhub",
        "search:speak",
        "direct:mixcloud",
        "direct:ocremix",
        "direct:clypit",
        "direct:reddit",
        "direct:getyarn",
        "direct:tiktok",
        "direct:soundgasm",
        "direct:pixeldrain",
        "direct:streamdeck"
    ];

    public load(node: Node): void {}

    public unload(node: Node): void {}
}
