import { Manager } from "../core/Manager";

export class Memory {
  public async init(manager: Manager, options?: any): Promise<void> {
    return Promise.resolve();
  }

  public async get<T>(): Promise<T | undefined> {
    return Promise.resolve(undefined);
  }

  public async set<T>(): Promise<void> {
    return Promise.resolve();
  }

  public async remove(): Promise<boolean> {
    return Promise.resolve(false);
  }

  public async has(): Promise<boolean> {
    return Promise.resolve(false);
  }

  public async keys(pattern?: string): Promise<string[]> {
    return Promise.resolve([]);
  }

  public async clear(): Promise<void> {
    return Promise.resolve();
  }

  public async shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
