import { Manager } from "../core/Manager";
import fs, { createWriteStream, WriteStream } from "fs";
import path from "path";

type AnyObject = Record<string, any>;
type Operation = { op: 'set' | 'delete'; key: string; value?: unknown };

export class Local {
  private store: AnyObject = {};
  private dir: string;
  private snapshotPath: string;
  private logPath: string;
  private walStream?: WriteStream;
  private compactionIntervalMs: number;
  private compactionTimer?: NodeJS.Timeout;
  private manager: Manager;

  private walBuffer: Operation[] = [];
  private readonly walBufferMaxSize: number = 50;
  private walFlushInterval?: NodeJS.Timeout;
  private readonly walFlushIntervalMs: number = 500;

  public async init(manager: Manager, options?: any): Promise<void> {
    this.manager = manager;
    this.compactionIntervalMs = 60000;
    this.dir = this.manager.options.database?.options?.path ?? path.resolve(__dirname, "../datastore");
    this.snapshotPath = path.join(this.dir, `data.${this.manager.clientId}.json`);
    this.logPath = path.join(this.dir, `data.${this.manager.clientId}.wal`);

    await fs.promises.mkdir(this.dir, { recursive: true });
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
    } catch (e) {
      // silent fail
    }
  }

  private async loadSnapshot(): Promise<void> {
    try {
      const raw = await fs.promises.readFile(this.snapshotPath, 'utf-8');
      const wrapper = JSON.parse(raw) as { data: AnyObject };
      this.store = wrapper.data || {};
    } catch (err: any) {
      this.store = {};
      if (err.code === 'ENOENT') {
        await fs.promises.writeFile(this.snapshotPath, JSON.stringify({ data: {} }), 'utf-8');
      }
    }
  }

  private async replayWAL(): Promise<void> {
    let walContent: string;
    try {
      walContent = await fs.promises.readFile(this.logPath, 'utf-8');
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        await fs.promises.writeFile(this.logPath, '');
      }
      return;
    }

    const lines = walContent.split('\n');
    for (const line of lines) {
      if (!line) continue;
      const entry = this._deserializeEntry(line);
      if (!entry) continue;

      if (entry.op === 'set') {
        this.set(entry.key, entry.value, false);
      } else if (entry.op === 'delete') {
        this.remove(entry.key, false);
      }
    }
  }

  private openWALStream(): void {
    try {
      this.walStream = createWriteStream(this.logPath, { flags: 'a' });
    } catch (err: any) {
      // silent fail
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
  }

  private async compact(): Promise<void> {
    this._flushWALBuffer();

    if (this.walStream) {
      await new Promise<void>(resolve => this.walStream!.end(resolve));
      this.walStream = undefined;
    }

    try {
      const wrapper = { data: this.store };
      const raw = JSON.stringify(wrapper, null, 2);
      await fs.promises.writeFile(this.snapshotPath, raw, 'utf-8');

      await fs.promises.writeFile(this.logPath, '', 'utf-8');
    } catch (err: any) {
      // silent fail
    } finally {
      this.openWALStream();
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
