import { Manager } from "../core/Manager";
import { Memory } from "../database/Memory";
import { Local } from "../database/Local";
type DatabaseProvider = Memory | Local;
export declare class DatabaseManager {
    provider: DatabaseProvider;
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
    shutdown(): Promise<void>;
}
export {};
