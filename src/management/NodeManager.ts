import { INode } from "../typings/Interfaces";
import {
  Structure,
  Manager,
  Node,
  TSortTypeNode,
  validateProperty,
  generateUUID,
  Track,
} from "../../index";
export class NodeManager {
  public readonly manager: Manager;
  public cache: Map<string | number, Node> = new Map();
  private healthCheckInterval?: NodeJS.Timeout;
  constructor(manager: Manager, nodes: INode[]) {
    this.manager = manager;
    nodes.forEach(node => {
      this.add(node);
    });
  }
  public check(node: INode): boolean {
    if (!node.host) {
      this.manager.emit("debug", "(Moonlink.js) - Node > Host is required");
      return false;
    }
    if (node.port !== undefined && (node.port < 0 || node.port > 65535)) {
      this.manager.emit("debug", "(Moonlink.js) - Node > Invalid port value. Port must be a number between 0 and 65535.");
      return false;
    }
    if (node.password !== undefined && typeof node.password !== "string") {
      this.manager.emit("debug", "(Moonlink.js) - Node > Invalid password value. Password must be a string.");
      return false;
    }
    if (node.secure !== undefined && typeof node.secure !== "boolean") {
      this.manager.emit("debug", "(Moonlink.js) - Node > Invalid secure value. Secure must be a boolean.");
      return false;
    }
    if (node.sessionId !== undefined && typeof node.sessionId !== "string") {
      this.manager.emit("debug", "(Moonlink.js) - Node > Invalid sessionId value. SessionId must be a string.");
      return false;
    }
    if (node.id !== undefined && typeof node.id !== "number") {
      this.manager.emit("debug", "(Moonlink.js) - Node > Invalid id value. Id must be a number.");
      return false;
    }
    if (node.identifier !== undefined && typeof node.identifier !== "string") {
      this.manager.emit("debug", "(Moonlink.js) - Node > Invalid identifier value. Identifier must be a string.");
      return false;
    }
    if (node.regions !== undefined && !Array.isArray(node.regions)) {
      this.manager.emit("debug", "(Moonlink.js) - Node > Invalid regions value. Regions must be an array.");
      return false;
    }
    if (node.retryDelay !== undefined && node.retryDelay < 0) {
      this.manager.emit("debug", "(Moonlink.js) - Node > Invalid retryDelay value. ReconnectTimeout must be a number greater than or equal to 0.");
      return false;
    }
    if (node.retryAmount !== undefined && node.retryAmount < 0) {
      this.manager.emit("debug", "(Moonlink.js) - Node > Invalid retryAmount value. ReconnectAmount must be a number greater than or equal to 0.");
      return false;
    }
    return true;
  }
  public init(): void {
    this.cache.forEach(node => {
      node.connect();
    });
    if (this.manager.options.nodeHealthCheckInterval) {
      this.healthCheckInterval = setInterval(() => this._checkNodesHealth(), this.manager.options.nodeHealthCheckInterval);
    }
  }

  private async _checkNodesHealth(): Promise<void> {
    this.manager.emit("debug", "Moonlink.js > NodeManager > Running periodic node health check.");
    for (const node of this.cache.values()) {
        if (!node.connected) {
            this.manager.emit("debug", `Moonlink.js > NodeManager > Node ${node.identifier} is disconnected, skipping health check.`);
            continue;
        }

        const status = await node.getNodeStatus();

        if (!status.health.responding || status.health.performance === 'poor' || status.health.needsRestart) {
            this.manager.emit(
                "debug",
                `Moonlink.js > NodeManager > Node ${node.identifier} is unhealthy. Responding: ${status.health.responding}, Performance: ${status.health.performance}, Needs Restart: ${status.health.needsRestart}. Attempting to migrate players.`
            );
            await node.migrateAllPlayers();
        } else {
            this.manager.emit("debug", `Moonlink.js > NodeManager > Node ${node.identifier} is healthy.`);
        }
    }
  }
  public add(node: INode): void {
    if (!this.check(node)) return;
    let uuid = generateUUID(node.host, node.port);
    this.manager.emit("debug", `Moonlink.js > NodeManager > Adding node: ${node.identifier}, UUID: ${uuid}`);
    const newNode = new (Structure.get("Node"))(this.manager, node);
    this.cache.set(node.identifier ?? uuid, newNode);

    this.manager.emit("nodeCreate", newNode);
  }
  public remove(identifier: string): void {
    const node = this.cache.get(identifier);
    if (!node) return;
    node.destroy();
    this.cache.delete(identifier);
    this.manager.emit("nodeDestroy", identifier);
    this.manager.emit(
      "debug",
      `NodeManager > Node with identifier ${identifier} has been destroyed.`
    );
  }
  public get(identifier: string | number): Node | undefined {
    if (identifier === "default" && this.cache.size === 1) return this.cache.values().next().value;
    if (!this.cache.has(identifier)) {
      this.manager.emit("debug", `(Moonlink.js) - Node > Node with identifier ${identifier} not found.`);
      return undefined;
    }
    return this.cache.get(identifier);
  }

  public getConnected(): Node[] {
    return [...this.cache.values()].filter(node => node.connected);
  }

  public get best(): Node | undefined {
    return this.sortByUsage("players");
  }

  public hasConnected(): boolean {
    return [...this.cache.values()].some(node => node.connected);
  }

  public getNodeWithCapability(capability: string, preferredNodeIdentifier?: string): Node | undefined {
    let nodes = this.getConnected().filter(node => node.capabilities.has(capability));

    if (preferredNodeIdentifier) {
      const preferredNode = nodes.find(node => node.identifier === preferredNodeIdentifier);
      if (preferredNode) {
        return preferredNode;
      }
    }

    if (!nodes.length) {
      this.manager.emit("debug", `(Moonlink.js) - Node > No available nodes with capability: ${capability}`);
      return undefined;
    }

    return nodes.sort((a, b) => {
      if (a.priority !== b.priority) {
        return (b.priority || 0) - (a.priority || 0);
      }
      return a.getPlayersCount - b.getPlayersCount; 
    })[0];
  }

  public getBestNodeForTrack(track: Track): Node | undefined {
    if (track.origin) {
      const originNode = this.getNodeWithCapability(`search:${track.sourceName}`, track.origin);
      if (originNode) {
        return originNode;
      }
    }

    if (track.sourceName) {
      const nodeWithSource = this.getNodeWithCapability(`search:${track.sourceName}`);
      if (nodeWithSource) {
        return nodeWithSource;
      }
    }
    
    return this.best;
  }

  public sortByUsage(sortType: TSortTypeNode, region?: string): Node | undefined {
    let nodes = this.getConnected();
    if (!nodes.length) {
      this.manager.emit("debug", "(Moonlink.js) - Node > No available nodes");
      return undefined;
    }

    if (region) {
      const regionalNodes = nodes.filter(node => node.regions && node.regions.includes(region));
      if (regionalNodes.length > 0) {
        nodes = regionalNodes;
      }
    }

    return nodes.sort((a, b) => {
      if (a.priority !== b.priority) {
        return (b.priority || 0) - (a.priority || 0);
      }
      switch (sortType) {
        case "players":
          return a.stats.players - b.stats.players;
        case "playingPlayers":
          return a.stats.playingPlayers - b.stats.playingPlayers;
        case "memory":
          return a.stats.memory.used - b.stats.memory.used;
        case "cpuLavalink":
          return a.stats.cpu.lavalinkLoad - b.stats.cpu.lavalinkLoad;
        case "cpuSystem":
          return a.stats.cpu.systemLoad - b.stats.cpu.systemLoad;
        case "uptime":
          return a.stats.uptime - b.stats.uptime;
        case "random":
          return Math.random() - 0.5;
        default:
          return a.stats.players - b.stats.players;
      }
    })[0];
  }
}