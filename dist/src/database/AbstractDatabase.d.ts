import { Manager } from "../../index";
export declare abstract class AbstractDatabase {
    abstract init(manager: Manager): Promise<void>;
    abstract set(key: string, value: any): Promise<void>;
    abstract get<T>(key: string): Promise<T | undefined>;
    abstract has(key: string): Promise<boolean>;
    abstract keys(): Promise<string[]>;
    abstract remove(key: string): Promise<boolean>;
    abstract clear(): Promise<void>;
    abstract shutdown(): Promise<void>;
}
