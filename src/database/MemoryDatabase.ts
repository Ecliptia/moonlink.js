import { IDatabaseOptions } from "../typings/Interfaces";

export class MemoryDatabase {
    private readonly data: Map<string, any> = new Map();

    constructor(options: IDatabaseOptions) {
    }

    public get<T>(key: string): T | undefined {
        return this.data.get(key) as T;
    }

    public async set<T>(key: string, value: T): Promise<void> {
        this.data.set(key, value);
    }

    public async delete(key: string): Promise<void> {
        this.data.delete(key);
    }

    public has(key: string): boolean {
        return this.data.has(key);
    }

    public async clear(): Promise<void> {
        this.data.clear();
    }

    public async all(): Promise<Array<{ key: string; value: any }>> {
        return Array.from(this.data.entries()).map(([key, value]) => ({ key, value }));
    }

    public async close(): Promise<void> {
    }
}
