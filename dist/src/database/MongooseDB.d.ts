import { Manager } from "../../index";
import { AbstractDatabase } from "./AbstractDatabase";
export declare class MongooseDB extends AbstractDatabase {
    private manager;
    init(manager: Manager): Promise<void>;
    set(key: string, value: any): Promise<void>;
    get<T>(key: string): Promise<T | undefined>;
    remove(key: string): Promise<boolean>;
    has(key: string): Promise<boolean>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
    shutdown(): Promise<void>;
}
