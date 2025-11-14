import { IDatabaseOptions } from "../typings/interfaces";
export declare class LMDBDatabase {
    private db;
    private readonly dbPath;
    constructor(options: IDatabaseOptions);
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
    has(key: string): boolean;
    clear(): Promise<void>;
    all(): Promise<Array<{
        key: string;
        value: any;
    }>>;
    close(): Promise<void>;
}
