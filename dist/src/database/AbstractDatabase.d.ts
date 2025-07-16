import { Manager } from "../../index";
export declare abstract class AbstractDatabase {
    abstract init(manager: Manager): Promise<void>;
    abstract set(key: string, value: any): void;
    abstract get<T>(key: string): T | undefined;
    abstract has(key: string): boolean;
    abstract keys(): string[];
    abstract remove(key: string): boolean;
    abstract clear(): void;
    abstract shutdown(): Promise<void>;
}
