import type { Manager } from "../core/Manager";
export declare class Memory {
    private store;
    init(_manager: Manager, _options?: any): Promise<void>;
    private parts;
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T): Promise<void>;
    has(key: string): Promise<boolean>;
    remove(key: string): Promise<boolean>;
    keys(pattern?: string): Promise<string[]>;
    clear(): Promise<void>;
    shutdown(): Promise<void>;
}
