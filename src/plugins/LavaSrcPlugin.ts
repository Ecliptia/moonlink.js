import { Node } from "../entities/Node";
import { AbstractPlugin } from "./AbstractPlugin";

export class LavaSrcPlugin extends AbstractPlugin {
  public name: string = "lavasrc-plugin"; 
  public capabilities: string[] = [
    "search:spotify",
    "search:sprec",
    "search:applemusic",
    "search:deezer",
    "search:dzrec",
    "search:yandexmusic",
    "search:ymrec",
    "search:flowerytts",
    "search:ytseach",
    "search:vkmusic",
    "search:vkrec",
    "search:tidal",
    "search:tdrec",
    "search:qobuz",
    "search:qbrec",
    "search:ytdlp",
  ];

  public load(node: Node): void {}

  public unload(node: Node): void {}

  public onNodeInfoUpdate(node: Node): void {
    node.manager.emit("debug", `Moonlink.js > LavaSrcPlugin > Node info updated for node: ${node.identifier}`);
  }
}
