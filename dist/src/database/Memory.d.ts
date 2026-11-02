import type { Manager } from "../core/Manager";
import type { StorageAdapter } from './StorageAdapter';
export declare class Memory implements StorageAdapter {
    protected store: Record<string, any>;
    init(_manager: Manager, _options?: any): Promise<void>;
    protected parts(key: string): string[];
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T): Promise<void>;
    has(key: string): Promise<boolean>;
    remove(key: string): Promise<boolean>;
    keys(pattern?: string): Promise<string[]>;
    clear(): Promise<void>;
    shutdown(): Promise<void>;
}
