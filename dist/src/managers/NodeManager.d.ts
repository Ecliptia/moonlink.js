import { Manager } from "../core/Manager";
import { IManagerNodeConfig } from "../typings/Interfaces";
export declare class NodeManager {
    readonly manager: Manager;
    readonly nodes: Map<string, any>;
    private readonly nodeConfigs;
    constructor(manager: Manager, nodeConfigs: IManagerNodeConfig[]);
    init(): void;
    add(config: IManagerNodeConfig): void;
    remove(identifier: string): boolean;
    get onlineNodes(): any[];
    get hasOnlineNodes(): boolean;
    get leastUsedNode(): any | undefined;
    findNode(): any | undefined;
    private _validateConfig;
}
