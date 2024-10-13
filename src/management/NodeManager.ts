import { INode } from "../typings/Interfaces";
import { Structure, Manager, Node, TSortTypeNode, validateProperty } from "../../index";
export class NodeManager {
  public readonly manager: Manager;
  public cache: Map<string | number, Node> = new Map();
  constructor(manager: Manager, nodes: INode[]) {
    this.manager = manager;
    nodes.forEach((node) => {
      this.add(node);
    });
  }
  public check(node: INode): void {
    validateProperty(
      node.host,
      (value) => !!value,
      "(Moonlink.js) - Node > Host is required",
    );
    validateProperty(
      node.port,
      (value) => value === undefined || (value >= 0 && value <= 65535),
      "(Moonlink.js) - Node > Invalid port value. Port must be a number between 0 and 65535.",
    );
    validateProperty(
      node.password,
      (value) => value === undefined || typeof value === "string",
      "(Moonlink.js) - Node > Invalid password value. Password must be a string.",
    );
    validateProperty(
      node.secure,
      (value) => value === undefined || typeof value === "boolean",
      "(Moonlink.js) - Node > Invalid secure value. Secure must be a boolean.",
    );
    validateProperty(
      node.sessionId,
      (value) => value === undefined || typeof value === "string",
      "(Moonlink.js) - Node > Invalid sessionId value. SessionId must be a string.",
    );
    validateProperty(
      node.id,
      (value) => value === undefined || typeof value === "number",
      "(Moonlink.js) - Node > Invalid id value. Id must be a number.",
    );
    validateProperty(
      node.identifier,
      (value) => value === undefined || typeof value === "string",
      "(Moonlink.js) - Node > Invalid identifier value. Identifier must be a string.",
    );
    validateProperty(
      node.regions,
      (value) => value === undefined || Array.isArray(value),
      "(Moonlink.js) - Node > Invalid regions value. Regions must be an array.",
    );
    validateProperty(
      node.retryDelay,
      (value) => value === undefined || value >= 0,
      "(Moonlink.js) - Node > Invalid retryDelay value. ReconnectTimeout must be a number greater than or equal to 0.",
    );
    validateProperty(
      node.retryAmount,
      (value) => value === undefined || value >= 0,
      "(Moonlink.js) - Node > Invalid retryAmount value. ReconnectAmount must be a number greater than or equal to 0.",
    );
  }
  public init(): void {
    this.cache.forEach((node) => {
      node.connect();
    });
  }
  public add(node: INode): void {
    this.check(node);
    this.cache.set(node.identifier ?? node.host, new (Structure.get("Node"))(this.manager, node));

    this.manager.emit(
      "nodeCreate",
      this.cache.get(node.identifier ?? node.host),
    );
    this.manager.emit(
      "debug",
      `NodeManager > Node with identifier ${node.identifier ?? node.host} has been created.`,
    );
  }
  public remove(identifier: string): void {
    this.cache.get(identifier)?.destroy();
    this.cache.delete(identifier);
    this.manager.emit("nodeDestroy", identifier);
    this.manager.emit(
      "debug",
      `NodeManager > Node with identifier ${identifier} has been destroyed.`,
    );
  }
  public get(identifier: string | number): Node {
    if (identifier == "default" && this.cache.size === 1)
      return this.cache.values().next().value;
    if (!this.cache.has(identifier))
      throw new Error(
        `(Moonlink.js) - Node > Node with identifier ${identifier} not found.`,
      );
    return this.cache.get(identifier);
  }
  public get best(): Node {
    return [...this.cache.values()]
      .filter((node) => node.connected === true)
      .sort((a, b) => a.stats.players - b.stats.players)[0];
  }
  public sortByUsage(sortType: TSortTypeNode): Node {
    let nodes = [...this.cache.values()].filter(
      (node) => node.connected === true,
    );
    if (!nodes) throw new Error("(Moonlink.js) - Node > No available nodes");

    switch (sortType) {
      case "players":
        return nodes.sort((a, b) => a.stats.players - b.stats.players)[0];
      case "playingPlayers":
        return nodes.sort(
          (a, b) => a.stats.playingPlayers - b.stats.playingPlayers,
        )[0];
      case "memory":
        return nodes.sort(
          (a, b) => a.stats.memory.used - b.stats.memory.used,
        )[0];
      case "cpuLavalink":
        return nodes.sort(
          (a, b) => a.stats.cpu.lavalinkLoad - b.stats.cpu.lavalinkLoad,
        )[0];
      case "cpuSystem":
        return nodes.sort(
          (a, b) => a.stats.cpu.systemLoad - b.stats.cpu.systemLoad,
        )[0];
      case "uptime":
        return nodes.sort((a, b) => a.stats.uptime - b.stats.uptime)[0];
      case "random":
        return nodes[Math.floor(Math.random() * nodes.length)];
    }
  }
}
