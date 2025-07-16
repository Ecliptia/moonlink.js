import { Manager } from "../../index";
import { AbstractDatabase } from "./AbstractDatabase";
export declare class MemoryDB extends AbstractDatabase {
    private store;
    init(manager: Manager): Promise<void>;
    set(key: string, value: any): void;
    get<T>(key: string): T | undefined;
    remove(key: string): boolean;
    has(key: string): boolean;
    keys(): string[];
    clear(): void;
    shutdown(): Promise<void>;
}
