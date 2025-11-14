import { Manager } from "../core/Manager";
import { IManagerNodeConfig } from "../typings/interfaces";
import { NodeSortStrategy } from "../typings/types";
import { Structure, validate, generateUUID } from "../Util";

export class NodeManager {
    public readonly manager: Manager;
    public readonly nodes: Map<string, any> = new Map();

    constructor(manager: Manager, nodeConfigs: IManagerNodeConfig[]) {
        this.manager = manager;
        for (const config of nodeConfigs) {
            this.add(config);
        }
    }

    public get onlineNodes(): any[] {
        return [...this.nodes.values()].filter((node) => { return node.connected; });
    }

    public get hasOnlineNodes(): boolean {
        return this.onlineNodes.length > 0;
    }

    public get leastUsedNode(): any | undefined {
        return this.findNode("players");
    }

    public get size(): number {
        return this.nodes.size;
    }

    public get all(): any[] {
        return [...this.nodes.values()];
    }

    public has(id: string): boolean {
        if (this.nodes.has(id)) return true;
        return this.all.some(node => node.identifier === id);
    }

    public getById(id: string): any | undefined {
        let node = this.nodes.get(id);
        if (!node) {
            node = this.all.find(n => n.identifier === id);
        }
        return node;
    }

    public filter(predicate: (node: any) => boolean): any[] {
        return this.all.filter(predicate);
    }

    public find(predicate: (node: any) => boolean): any | undefined {
        return this.all.find(predicate);
    }

    public map<T>(callback: (node: any) => T): T[] {
        return this.all.map(callback);
    }

    public forEach(callback: (node: any) => void): void {
        this.all.forEach(callback);
    }

    public init(): void {
        if (!this.nodes.size) {
            throw new Error("Moonlink.js > NodeManager#init: No nodes were provided to initialize.");
        }
        this.manager.emit("debug", `Moonlink.js > NodeManager#init: Initializing ${this.nodes.size} nodes.`);
        for (const node of this.nodes.values()) {
            node.connect();
        }
    }

    public add(config: IManagerNodeConfig): void {
        this._validateConfig(config);

        const node = new (Structure.get("Node"))(this.manager, config);
        
        if (this.nodes.has(node.uuid)) {
            throw new Error(`NodeManager#add: A node with the uuid "${node.uuid}" already exists.`);
        }

        this.nodes.set(node.uuid, node);
    }

    public remove(id: string): boolean {
        let nodeToRemove = this.nodes.get(id);

        if (!nodeToRemove) {
            nodeToRemove = [...this.nodes.values()].find(node => node.identifier === id);
        }

        if (!nodeToRemove) {
            this.manager.emit("debug", `Moonlink.js > NodeManager#remove: Could not find a node with id "${id}".`);
            return false;
        }

        nodeToRemove.destroy();
        this.nodes.delete(nodeToRemove.uuid);
        this.manager.emit("debug", `Moonlink.js > NodeManager#remove: Node ${nodeToRemove.identifier} destroyed.`);
        return true;
    }

    public findNode(sortBy: NodeSortStrategy = "penalty"): any | undefined {
        const onlineNodes = this.onlineNodes;
        if (!onlineNodes.length) {
            this.manager.emit("debug", `Moonlink.js > NodeManager#findNode: No online nodes available.`);
            return undefined;
        }

        if (onlineNodes.length <= 1) {
            return onlineNodes[0];
        }

        return onlineNodes.sort((a, b) => {
            switch (sortBy) {
                case "players": {
                    const aPlayers = a?.stats?.players ?? 0;
                    const bPlayers = b?.stats?.players ?? 0;
                    return aPlayers - bPlayers;
                }
                case "playingPlayers": {
                    const aPlayers = a?.stats?.playingPlayers ?? 0;
                    const bPlayers = b?.stats?.playingPlayers ?? 0;
                    return aPlayers - bPlayers;
                }
                case "memory": {
                    const aMemory = a?.stats?.memory?.used ?? 0;
                    const bMemory = b?.stats?.memory?.used ?? 0;
                    return aMemory - bMemory;
                }
                case "cpuLavalink": {
                    const aCpu = a?.stats?.cpu?.lavalinkLoad ?? 0;
                    const bCpu = b?.stats?.cpu?.lavalinkLoad ?? 0;
                    return aCpu - bCpu;
                }
                case "cpuSystem": {
                    const aCpu = a?.stats?.cpu?.systemLoad ?? 0;
                    const bCpu = b?.stats?.cpu?.systemLoad ?? 0;
                    return aCpu - bCpu;
                }
                case "uptime": {
                    const aUptime = a?.stats?.uptime ?? 0;
                    const bUptime = b?.stats?.uptime ?? 0;
                    return bUptime - aUptime;
                }
                case "random":
                    return Math.random() - 0.5;
                case "penalty":
                default: {
                    const aPenalty = (a?.stats?.players ?? 0) + ((a?.stats?.cpu?.systemLoad ?? 0) * 100);
                    const bPenalty = (b?.stats?.players ?? 0) + ((b?.stats?.cpu?.systemLoad ?? 0) * 100);
                    return aPenalty - bPenalty;
                }
            }
        })[0];
    }

    private _validateConfig(config: IManagerNodeConfig): void {
        validate(config.host, (value) => typeof value === "string" && value.length > 0, "Node config 'host' must be a non-empty string.");
        validate(config.port, (value) => typeof value === "number" && value >= 0 && value <= 65535, "Node config 'port' must be a number between 0 and 65535.");
        validate(config.password, (value) => typeof value === "string", "Node config 'password' must be a string.");
        validate(config.secure, (value) => typeof value === "boolean", "Node config 'secure' must be a boolean.");
    }
}
