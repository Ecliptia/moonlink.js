import { Manager } from "../core/Manager";
import { AbstractDatabase } from "../database/AbstractDatabase";
import { LocalDB } from "../database/LocalDB";
import { MemoryDB } from "../database/MemoryDB";
import { MongooseDB } from "../database/MongooseDB";

export class DatabaseManager {
  public provider: AbstractDatabase;
  private manager: Manager;

  constructor(manager: Manager) {
    this.manager = manager;
    const dbConfig = this.manager.options.database;

    if (typeof dbConfig?.provider === 'function') {
      this.provider = new dbConfig.provider();
    } else if (dbConfig?.provider === 'mongoose') {
      this.provider = new MongooseDB();
    } else if (dbConfig?.provider === 'memory') {
      this.provider = new MemoryDB();
    } else {
      this.provider = new LocalDB();
    }
  }

  public async init(): Promise<void> {
    await this.provider.init(this.manager);
  }

  public async set(key: string, value: any): Promise<void> {
    await this.provider.set(key, value);
  }

  public async get<T>(key: string): Promise<T | undefined> {
    return await this.provider.get(key);
  }

  public async remove(key: string): Promise<boolean> {
    return await this.provider.remove(key);
  }

  public async has(key: string): Promise<boolean> {
    return await this.provider.has(key);
  }

  public async keys(): Promise<string[]> {
    return await this.provider.keys();
  }

  public async clear(): Promise<void> {
    await this.provider.clear();
  }

  public async shutdown(): Promise<void> {
    await this.provider.shutdown();
  }
}
