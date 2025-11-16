import { IDatabaseOptions } from "../typings/Interfaces";
import { open, RootDatabase } from "lmdb";
import * as path from "node:path";
import * as fs from "node:fs";

export class LMDBDatabase {
    private db: RootDatabase;
    private readonly dbPath: string;

    constructor(options: IDatabaseOptions) {
        this.dbPath = options.path ? path.resolve(options.path) : path.resolve(__dirname, "../datastore");
        if (!fs.existsSync(this.dbPath)) {
            try {
                fs.mkdirSync(this.dbPath, { recursive: true });
            } catch (error) {
                throw error;
            }
        }

        try {
            this.db = open({
                path: this.dbPath,
                compression: options.compression ?? false,
                maxDbs: options.maxDbs ?? 12,
                encoding: "msgpack",
            });
        } catch (error) {
            throw error;
        }
    }

    public get<T>(key: string): T | undefined {
        return this.db.get(key) as T;
    }

    public async set<T>(key: string, value: T): Promise<void> {
        await this.db.put(key, value);
    }

    public async delete(key: string): Promise<void> {
        await this.db.remove(key);
    }

    public has(key: string): boolean {
        return this.db.get(key) !== undefined;
    }

    public async clear(): Promise<void> {
        await this.db.clearAsync();
    }

    public async all(): Promise<Array<{ key: string; value: any }>> {
        const allEntries: Array<{ key: string; value: any }> = [];
        for await (const { key, value } of this.db.getRange()) {
            allEntries.push({ key: key as string, value });
        }
        return allEntries;
    }

    public async close(): Promise<void> {
        await this.db.close();
    }
}
