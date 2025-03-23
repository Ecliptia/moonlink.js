import fs from "fs";
import path from "path";
import { Manager, Structure } from "../../index";
type Data = Record<string, any>;

export class Database {
  private disabled = false;
  private data: Data = {};
  private id: string;
  
  constructor(manager: Manager) {
    this.id = manager.options.clientId;
    this.disabled = manager.options.disableDatabase && !manager.options.resume;

    if (this.disabled) {
      this.data = {};
      Structure.getManager().emit(
        "debug",
        `Moonlink.js > Database > Database is disabled, no data will be loaded/saved`
      );
      return;
    } else {
      Structure.getManager().emit(
        "debug",
        `Moonlink.js > Database > Database is enabled, loading data...`
      );
    }

    this.loadData();
  }

  set<T>(key: string, value: T): void {
    if (this.disabled) return;
    if (!key) throw new Error("Key cannot be empty");
    this.modifyData(key, value);
    this.saveData();
  }

  get<T>(key: string): T | undefined {
    if (this.disabled) return undefined;
    if (!key) throw new Error("Key cannot be empty");
    return key.split(".").reduce((acc, curr) => acc?.[curr], this.data) ?? undefined;
  }

  push<T>(key: string, value: T): void {
    if (this.disabled) return;
    const arr = this.get<T[]>(key) || [];
    if (!Array.isArray(arr)) throw new Error("Key does not point to an array");
    arr.push(value);
    this.set(key, arr);
  }

  delete(key: string): boolean {
    if (this.disabled) return false;
    if (!key) throw new Error("Key cannot be empty");
    const keys = key.split(".");
    const lastKey = keys.pop();
    let current = this.data;

    for (const k of keys) {
      if (typeof current[k] !== "object") return false;
      current = current[k];
    }

    if (lastKey && lastKey in current) {
      delete current[lastKey];
      this.saveData();
      return true;
    }

    return false;
  }

  private modifyData(key: string, value: any): void {
    if (this.disabled) return;
    const keys = key.split(".");
    let current = this.data;

    keys.forEach((k, i) => {
      if (i === keys.length - 1) {
        current[k] = value;
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    });
  }

  private loadData(): void {
    if (this.disabled) return;
    const filePath = this.getFilePath();
    if (fs.existsSync(filePath)) {
      Structure.getManager().emit(
        "debug",
        `Moonlink.js > Database > Loading data from ${filePath}`
      );
      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        this.data = JSON.parse(fileContent);
      } catch (err) {
        Structure.getManager().emit(
          "debug",
          `Moonlink.js > Database > Error loading/parsing data: ${err}`
        );
        this.data = {};
      }
    } else {
      Structure.getManager().emit(
        "debug",
        `Moonlink.js > Database > No data found for clientId(${this.id})`
      );
    }
  }

  private saveData(): void {
    if (this.disabled) return;
    try {
      const filePath = this.getFilePath();
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(this.data, null, 2));
    } catch (err) {
      Structure.getManager().emit(
        "debug",
        `Moonlink.js > Database > Failed to save data: ${err}`
      );
    }
  }

  private getFilePath(): string {
    return path.resolve(__dirname, "../datastore", `data.${this.id}.json`);
  }
}
