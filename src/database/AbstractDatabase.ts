import { Manager } from "../../index";

export abstract class AbstractDatabase {
  public abstract init(manager: Manager): Promise<void>;
  public abstract set(key: string, value: any): void;
  public abstract get<T>(key: string): T | undefined;
  public abstract has(key: string): boolean;
  public abstract keys(): string[];
  public abstract remove(key: string): boolean;
  public abstract clear(): void;
  public abstract shutdown(): Promise<void>;
}
