import { AbstractPlugin } from "./AbstractPlugin";
import { Node } from "../entities/Node";

export class GoogleCloudTTSPlugin extends AbstractPlugin {
    public name: string = "Google Cloud TTS";
    public capabilities: string[] = ["search:tts"];

    public load(node: Node): void {}

    public unload(node: Node): void {}
}
