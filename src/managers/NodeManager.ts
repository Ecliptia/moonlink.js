import { Manager } from "../core/Manager";
import { IManagerNodeConfig } from "../typings/Interfaces";
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

    public init(): void {
        for (const node of this.nodes.values()) {
            node.connect();
        }
    }

    public add(config: IManagerNodeConfig): void {
        this._validateConfig(config);
        const identifier = config.identifier || `${config.host}:${config.port}`;
        if (this.nodes.has(identifier)) {
            throw new Error(`Node with identifier '${identifier}' already exists.`);
        }
        const node = new (Structure.get("Node"))(this.manager, { ...config, identifier });
        this.nodes.set(identifier, node);
        this.manager.emit("debug", `Moonlink.js > NodeManager#add: Node added. Identifier: ${identifier}`);
    }

    public remove(identifier: string): boolean {
        const node = this.nodes.get(identifier);
        if (!node) return false;
        node.destroy();
        return this.nodes.delete(identifier);
    }

    public get onlineNodes(): any[] {
        return [...this.nodes.values()].filter((node) => { return node.connected; });
    }

    public get hasOnlineNodes(): boolean {
        return this.onlineNodes.length > 0;
    }

    public get leastUsedNode(): any | undefined {
        return this.findNode();
    }

    public findNode(): any | undefined {
        const nodeOptions = this.manager.options.node;
        const sortBy = nodeOptions?.selectionStrategy ?? "penalty";

        let nodes = this.onlineNodes;
        if (!nodes.length) {
            this.manager.emit("debug", `Moonlink.js > NodeManager#findNode: No online nodes available.`);
            return undefined;
        }

        if (nodeOptions?.avoidUnhealthyNodes) {
            const healthyNodes = nodes.filter(node => {
                if (!node.stats) return true;
                const cpuLoad = node.stats.cpu.systemLoad * 100;
                const memoryUsage = (node.stats.memory.used / node.stats.memory.allocated) * 100;
                
                const isHealthy = cpuLoad < (nodeOptions.maxCpuLoad ?? 80) && memoryUsage < (nodeOptions.maxMemoryUsage ?? 90);
                if (!isHealthy) {
                    this.manager.emit("debug", `Moonlink.js > NodeManager#findNode: Node ${node.identifier} is unhealthy. CPU: ${cpuLoad.toFixed(2)}%, Memory: ${memoryUsage.toFixed(2)}%`);
                }
                return isHealthy;
            });

            if (healthyNodes.length) {
                nodes = healthyNodes;
            } else {
                this.manager.emit("debug", `Moonlink.js > NodeManager#findNode: No healthy nodes available, falling back to all online nodes.`);
            }
        }

        if (nodes.length <= 1) {
            return nodes[0];
        }

        return nodes.sort((a, b) => {
            switch (sortBy) {
                case "leastPlayers":
                case "players":
                    return (a.stats?.players ?? 0) - (b.stats?.players ?? 0);
                case "playingPlayers":
                    return (a.stats?.playingPlayers ?? 0) - (b.stats?.playingPlayers ?? 0);
                case "memory":
                    return (a.stats?.memory?.used ?? 0) - (b.stats?.memory?.used ?? 0);
                case "cpuLavalink":
                    return (a.stats?.cpu?.lavalinkLoad ?? 0) - (b.stats?.cpu?.lavalinkLoad ?? 0);
                case "cpuSystem":
                    return (a.stats?.cpu?.systemLoad ?? 0) - (b.stats?.cpu?.systemLoad ?? 0);
                case "uptime":
                    return (b.stats?.uptime ?? 0) - (a.stats?.uptime ?? 0);
                case "random":
                    return Math.random() - 0.5;
                case "priority":
                    return (a.priority ?? 0) - (b.priority ?? 0);
                case "leastLoad":
                case "penalty":
                default:
                    const aPenalty = (a.stats?.players ?? 0) + ((a.stats?.cpu?.systemLoad ?? 0) * 100);
                    const bPenalty = (b.stats?.players ?? 0) + ((b.stats?.cpu?.systemLoad ?? 0) * 100);
                    return aPenalty - bPenalty;
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
