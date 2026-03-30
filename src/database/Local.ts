import { Manager } from "../core/Manager";
import fs, { createWriteStream, WriteStream } from "fs";
import path from "path";
import os from "os";

type AnyObject = Record<string, any>;
type Operation = { op: 'set' | 'delete'; key: string; value?: unknown };

const isDocker = (): boolean => {
  try {
    if (fs.existsSync('/.dockerenv')) return true;
    if (fs.existsSync('/proc/1/cgroup')) {
      const cgroup = fs.readFileSync('/proc/1/cgroup', 'utf-8');
      if (cgroup.includes('docker') || cgroup.includes('kubepods')) return true;
    }
  } catch { }
  return false;
};

const getDefaultDataPath = (): string => {
  const envPath = process.env.MOONLINK_DB_PATH;
  if (envPath) return envPath;

  // Default to local directory for better compatibility in containers/Pterodactyl
  return path.join(process.cwd(), '.moonlink', 'data');
};

export class Local {
  private store: AnyObject = {};
  private dir: string;
  private snapshotPath: string;
  private logPath: string;
  private walStream?: WriteStream;
  private compactionIntervalMs: number;
  private compactionTimer?: NodeJS.Timeout;
  private manager: Manager;
  private isCompacting: boolean = false;

  private walBuffer: Operation[] = [];
  private readonly walBufferMaxSize: number = 50;
  private walFlushInterval?: NodeJS.Timeout;
  private readonly walFlushIntervalMs: number = 500;

  public async init(manager: Manager, options?: any): Promise<void> {
    this.manager = manager;
    this.compactionIntervalMs = 60000;

    this.dir = this.manager.options.database?.options?.path
      ?? process.env.MOONLINK_DB_PATH
      ?? getDefaultDataPath();

    this.snapshotPath = path.join(this.dir, `data.${this.manager.clientId}.json`);
    this.logPath = path.join(this.dir, `data.${this.manager.clientId}.wal`);

    await fs.promises.mkdir(this.dir, { recursive: true });

    this.manager.emit("debug", `Moonlink.js > LocalDB >> Database initialized at: ${this.dir} (Docker: ${isDocker()})`);

    await this.loadSnapshot();
    await this.replayWAL();
    this.openWALStream();
    this.compactionTimer = setInterval(() => this.compact(), this.compactionIntervalMs);
    this.walFlushInterval = setInterval(() => this._flushWALBuffer(), this.walFlushIntervalMs);
  }

  private _serializeEntry(entry: Operation): string {
    const opCode = entry.op === 'set' ? 's' : 'd';
    if (entry.op === 'set') {
      const valueStr = JSON.stringify(entry.value);
      return `${opCode}|${entry.key}|${valueStr}\n`;
    }
    return `${opCode}|${entry.key}\n`;
  }

  private _deserializeEntry(line: string): Operation | null {
    const parts = line.split('|');
    if (parts.length < 2) return null;

    const opCode = parts[0];
    const key = parts[1];

    if (opCode === 's') {
      try {
        const value = JSON.parse(parts.slice(2).join('|'));
        return { op: 'set', key, value };
      } catch (e) {
        return null;
      }
    } else if (opCode === 'd') {
      return { op: 'delete', key };
    }
    return null;
  }

  private _flushWALBuffer(): void {
    if (!this.walStream || this.walBuffer.length === 0) {
      return;
    }
    try {
      const dataToWrite = this.walBuffer.map(entry => this._serializeEntry(entry)).join('');
      this.walStream.write(dataToWrite);
      this.walBuffer = [];
    } catch (error) {
      this.manager.emit(
        "debug",
        `Moonlink.js > LocalDB >> Failed to flush WAL buffer. Error: ${(error as Error).message}`
      );
    }
  }

  private async loadSnapshot(): Promise<void> {
    try {
      if (!fs.existsSync(this.snapshotPath)) {
        this.store = {};
        await fs.promises.writeFile(this.snapshotPath, JSON.stringify({ data: {} }), 'utf-8');
        return;
      }

      const raw = await fs.promises.readFile(this.snapshotPath, 'utf-8');
      if (!raw || raw.trim().length === 0) {
        this.manager.emit("debug", `Moonlink.js > LocalDB >> Snapshot file is empty. Starting with empty store.`);
        this.store = {};
        return;
      }

      try {
        const wrapper = JSON.parse(raw) as { data: AnyObject };
        this.store = wrapper.data || {};
      } catch (parseErr: any) {
        const corruptedPath = `${this.snapshotPath}.corrupted.${Date.now()}`;
        await fs.promises.rename(this.snapshotPath, corruptedPath);
        this.manager.emit(
          "debug",
          `Moonlink.js > LocalDB >> Snapshot file is corrupted and has been moved to ${corruptedPath}. Error: ${parseErr.message}. Starting with empty store.`
        );
        this.store = {};
      }
    } catch (err: any) {
      this.manager.emit(
        "debug",
        `Moonlink.js > LocalDB >> Failed to load snapshot: ${err.message}. Starting with empty store.`
      );
      this.store = {};
    }
  }

  private async replayWAL(): Promise<void> {
    let walContent: string;
    try {
      if (!fs.existsSync(this.logPath)) {
        await fs.promises.writeFile(this.logPath, '');
        return;
      }
      walContent = await fs.promises.readFile(this.logPath, 'utf-8');
    } catch (err: any) {
      this.manager.emit(
        "debug",
        `Moonlink.js > LocalDB >> Failed to read WAL: ${err.message}`
      );
      return;
    }

    const lines = walContent.split('\n');
    let entriesReplayed = 0;
    for (const line of lines) {
      if (!line) continue;
      const entry = this._deserializeEntry(line);
      if (!entry) continue;

      if (entry.op === 'set') {
        this.set(entry.key, entry.value, false);
      } else if (entry.op === 'delete') {
        this.remove(entry.key, false);
      }
      entriesReplayed++;
    }
    if (entriesReplayed > 0) {
      this.manager.emit("debug", `Moonlink.js > LocalDB >> Replayed ${entriesReplayed} operations from WAL.`);
    }
  }

  private openWALStream(): void {
    try {
      this.walStream = createWriteStream(this.logPath, { flags: 'a' });
    } catch (err: any) {
      this.manager.emit(
        "debug",
        `Moonlink.js > LocalDB >> Failed to open WAL stream. Error: ${err.message}`
      );
    }
  }

  private appendLog(op: 'set' | 'delete', key: string, value?: unknown): void {
    const entry: Operation = { op, key, value };
    this.walBuffer.push(entry);

    if (this.walBuffer.length >= this.walBufferMaxSize) {
      this._flushWALBuffer();
    }
  }

  public async set<T>(key: string, value: T, log: boolean = true): Promise<void> {
    if (!key) return;

    const keys = key.split('.');
    let current = this.store;

    for (let i = 0; i < keys.length - 1; i++) {
      const keyPart = keys[i];
      if (typeof current[keyPart] !== 'object' || current[keyPart] === null) {
        current[keyPart] = {};
      }
      current = current[keyPart];
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;

    if (log) {
      this.appendLog('set', key, value);
    }
  }

  public async get<T>(key: string): Promise<T | undefined> {
    if (!key) return undefined;

    const parts = key.split('.');
    let value: any = this.store;

    for (const part of parts) {
      if (typeof value !== 'object' || value === null) {
        return undefined;
      }
      value = value[part];
    }
    return value as T;
  }

  public async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== undefined;
  }

  public async remove(key: string, log: boolean = true): Promise<boolean> {
    if (!key) return false;

    const keys = key.split('.');
    let obj = this.store;

    for (let i = 0; i < keys.length - 1; i++) {
      if (typeof obj[keys[i]] !== 'object' || obj[keys[i]] === null) {
        return false;
      }
      obj = obj[keys[i]];
    }

    const lastKey = keys[keys.length - 1];
    const existed = obj && Object.prototype.hasOwnProperty.call(obj, lastKey);

    if (existed) {
      delete obj[lastKey];
      if (log) {
        this.appendLog('delete', key);
      }
    }
    return existed;
  }

  public async keys(pattern?: string): Promise<string[]> {
    const allKeys: string[] = [];
    const recurse = (obj: AnyObject, prefix: string) => {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            recurse(obj[key], newPrefix);
          } else {
            allKeys.push(newPrefix);
          }
        }
      }
    }
    recurse(this.store, '');

    if (pattern && pattern !== '*') {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return allKeys.filter(key => regex.test(key));
    }

    return allKeys;
  }

  public async clear(): Promise<void> {
    this.store = {};
    this.walBuffer = [];
    if (this.walStream) {
      await new Promise<void>(resolve => this.walStream!.end(resolve));
      this.walStream = undefined;
    }
    await fs.promises.writeFile(this.logPath, '');
    await fs.promises.writeFile(this.snapshotPath, JSON.stringify({ data: {} }));
  }

  private async compact(): Promise<void> {
    if (this.isCompacting) return;
    this.isCompacting = true;

    try {
      this._flushWALBuffer();

      if (this.walStream) {
        await new Promise<void>(resolve => this.walStream!.end(resolve));
        this.walStream = undefined;
      }

      const wrapper = { data: this.store };
      const raw = JSON.stringify(wrapper, null, 2);

      // Atomic write: write to a temporary file first
      const tempPath = `${this.snapshotPath}.tmp`;
      await fs.promises.writeFile(tempPath, raw, 'utf-8');
      await fs.promises.rename(tempPath, this.snapshotPath);

      // Successfully wrote snapshot, now we can clear WAL
      await fs.promises.writeFile(this.logPath, '', 'utf-8');
    } catch (err: any) {
      this.manager.emit(
        "debug",
        `Moonlink.js > LocalDB >> Failed to compact database: ${err.message}`
      );
    } finally {
      this.openWALStream();
      this.isCompacting = false;
    }
  }

  public async shutdown(): Promise<void> {
    if (this.compactionTimer) clearInterval(this.compactionTimer);
    if (this.walFlushInterval) clearInterval(this.walFlushInterval);

    await this.compact();

    if (this.walStream) {
      await new Promise<void>(resolve => this.walStream!.end(resolve));
      this.walStream = undefined;
    }
  }
}
