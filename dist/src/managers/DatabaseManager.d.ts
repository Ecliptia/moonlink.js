import { Manager } from "../core/Manager";
import type { StorageAdapter } from '../database/StorageAdapter';
export declare class DatabaseManager {
    provider: StorageAdapter;
    private tail;
    private closing;
    private shutdownPromise?;
    private manager;
    private dbConfig;
    constructor(manager: Manager);
    initialize(): Promise<void>;
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<boolean>;
    has(key: string): Promise<boolean>;
    keys(pattern?: string): Promise<string[]>;
    clear(): Promise<void>;
    private mutate;
    flush(): Promise<void>;
    shutdown(): Promise<void>;
}
