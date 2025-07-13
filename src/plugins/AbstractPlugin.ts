import { Node } from "../entities/Node";

export abstract class AbstractPlugin {
  public abstract readonly name: string;
  public abstract readonly capabilities: string[];

  public abstract load(node: Node): void;
  public abstract unload(node: Node): void;
  public onNodeInfoUpdate?(node: Node): void;
}