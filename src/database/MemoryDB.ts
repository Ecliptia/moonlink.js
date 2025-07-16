import { Manager } from "../../index";
import { AbstractDatabase } from "./AbstractDatabase";

export class MemoryDB extends AbstractDatabase {
  private store: Map<string, any> = new Map();

  public async init(manager: Manager): Promise<void> {}

  public set(key: string, value: any): void {
    this.store.set(key, value);
  }

  public get<T>(key: string): T | undefined {
    return this.store.get(key);
  }

  public remove(key: string): boolean {
    return this.store.delete(key);
  }

  public has(key: string): boolean {
    return this.store.has(key);
  }

  public keys(): string[] {
    return [...this.store.keys()];
  }

  public clear(): void {
    this.store.clear();
  }

  public async shutdown(): Promise<void> {}
}
