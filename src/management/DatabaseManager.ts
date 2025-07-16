import { Manager } from "../core/Manager";
import { AbstractDatabase } from "../database/AbstractDatabase";
import { LocalDB } from "../database/LocalDB";
import { MemoryDB } from "../database/MemoryDB";

export class DatabaseManager {
  public provider: AbstractDatabase;
  private manager: Manager;

  constructor(manager: Manager) {
    this.manager = manager;
    const dbConfig = this.manager.options.database;

    if (typeof dbConfig?.provider === 'function') {
      this.provider = new dbConfig.provider();
    } else if (dbConfig?.provider === 'memory') {
      this.provider = new MemoryDB();
    } else {
      this.provider = new LocalDB();
    }
  }

  public async init(): Promise<void> {
    await this.provider.init(this.manager);
  }

  public set(key: string, value: any): void {
    this.provider.set(key, value);
  }

  public get<T>(key: string): T | undefined {
    return this.provider.get(key);
  }

  public remove(key: string): boolean {
    return this.provider.remove(key);
  }

  public has(key: string): boolean {
    return this.provider.has(key);
  }

  public keys(): string[] {
    return this.provider.keys();
  }

  public clear(): void {
    this.provider.clear();
  }

  public async shutdown(): Promise<void> {
    await this.provider.shutdown();
  }
}
