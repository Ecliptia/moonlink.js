import { Manager } from "../../index";

export abstract class AbstractDatabase {
  public abstract init(manager: Manager): Promise<void>;
  public abstract set(key: string, value: any): Promise<void>;
  public abstract get<T>(key: string): Promise<T | undefined>;
  public abstract has(key: string): Promise<boolean>;
  public abstract keys(): Promise<string[]>;
  public abstract remove(key: string): Promise<boolean>;
  public abstract clear(): Promise<void>;
  public abstract shutdown(): Promise<void>;
}
