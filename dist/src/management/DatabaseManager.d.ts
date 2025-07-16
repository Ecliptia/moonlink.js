import { Manager } from "../core/Manager";
import { AbstractDatabase } from "../database/AbstractDatabase";
export declare class DatabaseManager {
    provider: AbstractDatabase;
    private manager;
    constructor(manager: Manager);
    init(): Promise<void>;
    set(key: string, value: any): Promise<void>;
    get<T>(key: string): Promise<T | undefined>;
    remove(key: string): Promise<boolean>;
    has(key: string): Promise<boolean>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
    shutdown(): Promise<void>;
}
