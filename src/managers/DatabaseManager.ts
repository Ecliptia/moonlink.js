import { Manager } from "../core/Manager";
import { Memory } from "../database/Memory";
import { Local } from "../database/Local";
import type { StorageAdapter } from '../database/StorageAdapter';

export class DatabaseManager {
  public provider: StorageAdapter;
  private tail: Promise<unknown> = Promise.resolve();
  private closing = false;
  private shutdownPromise?: Promise<void>;
  private manager: Manager;
  private dbConfig: { type: 'memory' | 'local'; options?: any; };

  constructor(manager: Manager) {
    this.manager = manager;
    this.dbConfig = this.manager.options.database || { type: 'memory' };
    if (this.manager.options.database?.adapter) {
      this.provider = this.manager.options.database.adapter;
      return;
    }
    
    switch (this.dbConfig.type) {
      case 'local':
        this.provider = new Local();
        break;
      case 'memory':
      default:
        this.provider = new Memory();
        break;
    }
  }

  public async initialize(): Promise<void> {
    await this.provider.init(this.manager, this.dbConfig.options);
  }

  public async get<T>(key: string): Promise<T | undefined> {
    await this.tail;
    return this.provider.get(key);
  }

  public set<T>(key: string, value: T): Promise<void> {
    return this.mutate(() => this.provider.set(key, value));
  }

  public remove(key: string): Promise<boolean> {
    return this.mutate(() => this.provider.remove(key));
  }

  public async has(key: string): Promise<boolean> {
    await this.tail;
    return this.provider.has(key);
  }

  public async keys(pattern?: string): Promise<string[]> {
    await this.tail;
    return this.provider.keys(pattern);
  }

  public clear(): Promise<void> {
    return this.mutate(() => this.provider.clear());
  }

  private mutate<T>(operation: () => Promise<T>): Promise<T> {
    if (this.closing) return Promise.reject(new Error('Database is shutting down'));
    const result = this.tail.then(operation);
    this.tail = result.catch(() => undefined);
    return result;
  }

  public async flush(): Promise<void> {
    await this.tail;
    await this.provider.flush?.();
  }

  public shutdown(): Promise<void> {
    if (!this.shutdownPromise) {
      this.closing = true;
      this.shutdownPromise = this.tail.then(async () => {
        const errors: unknown[] = [];
        try { await this.provider.flush?.(); } catch (error) { errors.push(error); }
        try { await this.provider.shutdown(); } catch (error) { errors.push(error); }
        if (errors.length === 1) throw errors[0];
        if (errors.length) throw new AggregateError(errors, 'Storage shutdown failed');
      });
    }
    return this.shutdownPromise;
  }
}
