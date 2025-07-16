import { Manager } from "../core/Manager";
import { AbstractDatabase } from "../database/AbstractDatabase";
export declare class DatabaseManager {
    provider: AbstractDatabase;
    private manager;
    constructor(manager: Manager);
    init(): Promise<void>;
    set(key: string, value: any): void;
    get<T>(key: string): T | undefined;
    remove(key: string): boolean;
    has(key: string): boolean;
    keys(): string[];
    clear(): void;
    shutdown(): Promise<void>;
}
