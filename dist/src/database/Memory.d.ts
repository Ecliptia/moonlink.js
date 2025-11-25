import { Manager } from "../core/Manager";
export declare class Memory {
    init(manager: Manager, options?: any): Promise<void>;
    get<T>(): Promise<T | undefined>;
    set<T>(): Promise<void>;
    remove(): Promise<boolean>;
    has(): Promise<boolean>;
    keys(pattern?: string): Promise<string[]>;
    clear(): Promise<void>;
    shutdown(): Promise<void>;
}
