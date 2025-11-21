import { Manager } from "../core/Manager";
import { Memory } from "../database/Memory";
import { Local } from "../database/Local";

type DatabaseProvider = Memory | Local;

export class DatabaseManager {
  public provider: DatabaseProvider;
  private manager: Manager;

  constructor(manager: Manager) {
    this.manager = manager;
    const dbConfig = this.manager.options.database || { type: 'memory' };
    
    switch (dbConfig.type) {
      case 'local':
        this.provider = new Local();
        break;
      case 'memory':
      default:
        this.provider = new Memory();
        break;
    }

    this.provider.init(this.manager, dbConfig.options);
  }

  public async get<T>(key: string): Promise<T | undefined> {
    return this.provider.get(key);
  }

  public async set<T>(key: string, value: T): Promise<void> {
    return this.provider.set(key, value);
  }

  public async remove(key: string): Promise<boolean> {
    return this.provider.remove(key);
  }

  public async has(key: string): Promise<boolean> {
    return this.provider.has(key);
  }

  public async keys(pattern?: string): Promise<string[]> {
    return this.provider.keys(pattern);
  }

  public async clear(): Promise<void> {
    return this.provider.clear();
  }

  public async shutdown(): Promise<void> {
    return this.provider.shutdown();
  }
}
