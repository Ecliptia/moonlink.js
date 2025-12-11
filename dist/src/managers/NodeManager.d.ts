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
    get ready(): any[];
    get hasReady(): boolean;
    get leastUsedNode(): any | undefined;
    get stats(): Record<string, any>;
    findNode(options?: {
        exclude?: string[];
    }): any | undefined;
    eject(identifier: string): Promise<boolean>;
    private _validateConfig;
}
