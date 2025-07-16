import { Manager } from "../../index";
import { AbstractDatabase } from "./AbstractDatabase";

export class MemoryDB extends AbstractDatabase {
  private store: Map<string, any> = new Map();

  public async init(manager: Manager): Promise<void> {}

  public async set(key: string, value: any): Promise<void> {
    this.store.set(key, value);
  }

  public async get<T>(key: string): Promise<T | undefined> {
    return this.store.get(key);
  }

  public async remove(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  public async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  public async keys(): Promise<string[]> {
    return [...this.store.keys()];
  }

  public async clear(): Promise<void> {
    this.store.clear();
  }

  public async shutdown(): Promise<void> {}
}
