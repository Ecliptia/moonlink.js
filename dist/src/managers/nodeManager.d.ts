import { Manager } from "../core/Manager";
import { IManagerNodeConfig } from "../typings/interfaces";
import { NodeSortStrategy } from "../typings/types";
export declare class NodeManager {
    readonly manager: Manager;
    readonly nodes: Map<string, any>;
    constructor(manager: Manager, nodeConfigs: IManagerNodeConfig[]);
    get onlineNodes(): any[];
    get hasOnlineNodes(): boolean;
    get leastUsedNode(): any | undefined;
    get size(): number;
    get all(): any[];
    has(id: string): boolean;
    getById(id: string): any | undefined;
    filter(predicate: (node: any) => boolean): any[];
    find(predicate: (node: any) => boolean): any | undefined;
    map<T>(callback: (node: any) => T): T[];
    forEach(callback: (node: any) => void): void;
    init(): void;
    add(config: IManagerNodeConfig): void;
    remove(id: string): boolean;
    findNode(sortBy?: NodeSortStrategy): any | undefined;
    private _validateConfig;
}
