import type { Manager } from '../core/Manager';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Memory } from './Memory';

type Operation = { op: 'set' | 'delete' | 'clear'; key?: string; value?: unknown };

/** Serialized, single-process snapshot/WAL storage. Awaited writes are not fsync guarantees. */
export class Local extends Memory {
  private snapshotPath: string;
  private logPath: string;
  private tail: Promise<unknown> = Promise.resolve();
  private closing = false;
  private shutdownPromise?: Promise<void>;
  private compactionTimer?: NodeJS.Timeout;

  public async init(manager: Manager, options?: { path?: string }): Promise<void> {
    if (!/^[\w-]+$/.test(manager.clientId)) throw new TypeError('Invalid local database client ID');
    const directory = options?.path ?? manager.options.database?.options?.path
      ?? process.env.MOONLINK_DB_PATH ?? path.join(process.cwd(), '.moonlink', 'data');
    this.snapshotPath = path.join(directory, `data.${manager.clientId}.json`);
    this.logPath = path.join(directory, `data.${manager.clientId}.wal`);
    await fs.mkdir(directory, { recursive: true });
    try {
      const snapshot = JSON.parse(await fs.readFile(this.snapshotPath, 'utf8'));
      if (!snapshot.data || typeof snapshot.data !== 'object' || Array.isArray(snapshot.data)) throw new TypeError('Invalid snapshot');
      this.store = snapshot.data;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        await fs.rename(this.snapshotPath, `${this.snapshotPath}.corrupted.${Date.now()}`);
        manager.emit('debug', `NyxLink > Local > Invalid snapshot preserved; replaying WAL: ${error.message}`);
      }
      this.store = Object.create(null);
    }
    let wal = '';
    try { wal = await fs.readFile(this.logPath, 'utf8'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    for (const line of wal.split('\n')) {
      if (!line) continue;
      let entry: Operation;
      try {
        if (line.startsWith('{')) entry = JSON.parse(line);
        else {
          const [op, key, ...value] = line.split('|');
          if (op !== 's' && op !== 'd') continue;
          entry = { op: op === 's' ? 'set' : 'delete', key, value: op === 's' ? JSON.parse(value.join('|')) : undefined };
        }
        if (entry.op === 'clear') await super.clear();
        else if (entry.op === 'set' && typeof entry.key === 'string') await super.set(entry.key, entry.value);
        else if (entry.op === 'delete' && typeof entry.key === 'string') await super.remove(entry.key);
      } catch {
        manager.emit('debug', 'NyxLink > Local > Ignoring malformed or unsafe WAL entry');
      }
    }
    // Isolate a torn final record so the next acknowledged write remains replayable.
    await fs.appendFile(this.logPath, wal && !wal.endsWith('\n') ? '\n' : '', { mode: 0o600 });
    this.compactionTimer = setInterval(() => {
      void this.enqueue(() => this.compact()).catch(error => manager.emit('debug', `NyxLink > Local > Compaction failed: ${error.message}`));
    }, 60000);
    this.compactionTimer.unref();
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    if (this.closing) return Promise.reject(new Error('Local database is shutting down'));
    const result = this.tail.then(operation);
    this.tail = result.catch(() => undefined);
    return result;
  }

  public set<T>(key: string, value: T, log = true): Promise<void> {
    return this.enqueue(async () => {
      if (!key) return;
      // Validate paths and serialization before either disk or visible state changes.
      this.parts(key);
      const entry = JSON.stringify({ op: value === undefined ? 'delete' : 'set', key, value });
      if (log) await fs.appendFile(this.logPath, `${entry}\n`);
      await super.set(key, JSON.parse(entry).value);
    });
  }

  public remove(key: string, log = true): Promise<boolean> {
    return this.enqueue(async () => {
      if (!key) return false;
      this.parts(key);
      if (await super.get(key) === undefined) return false;
      if (log) await fs.appendFile(this.logPath, `${JSON.stringify({ op: 'delete', key })}\n`);
      return super.remove(key);
    });
  }

  public clear(): Promise<void> {
    return this.enqueue(async () => {
      await fs.appendFile(this.logPath, `${JSON.stringify({ op: 'clear' })}\n`);
      await super.clear();
      await this.compact();
    });
  }

  public async get<T>(key: string): Promise<T | undefined> { await this.tail; return super.get<T>(key); }
  public async keys(pattern?: string): Promise<string[]> { await this.tail; return super.keys(pattern); }
  public async has(key: string): Promise<boolean> { return await this.get(key) !== undefined; }
  public async flush(): Promise<void> { await this.tail; }

  private async compact(): Promise<void> {
    // Serialize all writes around snapshot replacement; no timers can mutate the WAL here.
    // Node fs promises: https://nodejs.org/docs/latest-v22.x/api/fs.html#fspromisesrenameoldpath-newpath
    const temporary = `${this.snapshotPath}.tmp`;
    await fs.writeFile(temporary, JSON.stringify({ data: this.store }), { mode: 0o600 });
    await fs.rename(temporary, this.snapshotPath);
    await fs.writeFile(this.logPath, '', { mode: 0o600 });
  }

  public shutdown(): Promise<void> {
    if (!this.shutdownPromise) {
      this.closing = true;
      if (this.compactionTimer) clearInterval(this.compactionTimer);
      this.shutdownPromise = this.tail.then(() => this.compact());
    }
    return this.shutdownPromise;
  }
}
