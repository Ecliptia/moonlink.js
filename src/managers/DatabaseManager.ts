import { IDatabaseOptions } from "../typings/Interfaces";
import { MemoryDatabase } from "../database/MemoryDatabase";
import { LMDBDatabase } from "../database/LMDBDatabase";

export class DatabaseManager {
    private database: MemoryDatabase | LMDBDatabase;

    constructor(options: IDatabaseOptions) {
        if (options.provider === "lmdb") {
            this.database = new LMDBDatabase(options);
        } else {
            this.database = new MemoryDatabase(options);
        }
    }

    public get<T>(key: string): T | undefined {
        return this.database.get<T>(key);
    }

    public async set<T>(key: string, value: T): Promise<void> {
        await this.database.set<T>(key, value);
    }

    public async delete(key: string): Promise<void> {
        await this.database.delete(key);
    }

    public has(key: string): boolean {
        return this.database.has(key);
    }

    public async clear(): Promise<void> {
        await this.database.clear();
    }

    public async all(): Promise<Array<{ key: string; value: any }>> {
        return this.database.all();
    }

    public async close(): Promise<void> {
        await this.database.close();
    }
}
