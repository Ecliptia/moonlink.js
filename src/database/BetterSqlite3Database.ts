
import { IDatabaseOptions } from "../typings/Interfaces";
import * as path from "node:path";
import * as fs from "node:fs";

let Database: any;
try {
    Database = require("better-sqlite3");
} catch {
    Database = null;
}

export class BetterSqlite3Database {
    private db: any;
    private readonly dbPath: string;

    constructor(options: IDatabaseOptions) {
        if (!Database) {
            throw new Error("better-sqlite3 is not installed. Please install it to use this database provider.");
        }

        this.dbPath = options.path ? path.resolve(options.path) : path.resolve(__dirname, "../datastore", "moonlink.db");
        
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        this.db = new Database(this.dbPath);
        this.db.exec("CREATE TABLE IF NOT EXISTS moonlink (key TEXT PRIMARY KEY, value TEXT)");
    }

    public get<T>(key: string): T | undefined {
        const res = this.db.prepare("SELECT value FROM moonlink WHERE key = ?").get(key);
        return res ? JSON.parse(res.value) : undefined;
    }

    public set<T>(key: string, value: T): Promise<void> {
        this.db.prepare("INSERT OR REPLACE INTO moonlink (key, value) VALUES (?, ?)").run(key, JSON.stringify(value));
        return Promise.resolve();
    }

    public delete(key: string): Promise<void> {
        this.db.prepare("DELETE FROM moonlink WHERE key = ?").run(key);
        return Promise.resolve();
    }

    public has(key: string): boolean {
        return !!this.db.prepare("SELECT key FROM moonlink WHERE key = ?").get(key);
    }

    public clear(): Promise<void> {
        this.db.exec("DELETE FROM moonlink");
        return Promise.resolve();
    }

    public all(): Promise<Array<{ key: string; value: any }>> {
        const allEntries = this.db.prepare("SELECT * FROM moonlink").all().map(row => ({
            key: row.key,
            value: JSON.parse(row.value)
        }));
        return Promise.resolve(allEntries);
    }

    public close(): Promise<void> {
        this.db.close();
        return Promise.resolve();
    }
}
