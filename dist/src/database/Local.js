"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Local = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const Memory_1 = require("./Memory");
class Local extends Memory_1.Memory {
    snapshotPath;
    logPath;
    tail = Promise.resolve();
    closing = false;
    shutdownPromise;
    compactionTimer;
    async init(manager, options) {
        if (!/^[\w-]+$/.test(manager.clientId))
            throw new TypeError('Invalid local database client ID');
        const directory = options?.path ?? manager.options.database?.options?.path
            ?? process.env.MOONLINK_DB_PATH ?? node_path_1.default.join(process.cwd(), '.moonlink', 'data');
        this.snapshotPath = node_path_1.default.join(directory, `data.${manager.clientId}.json`);
        this.logPath = node_path_1.default.join(directory, `data.${manager.clientId}.wal`);
        await node_fs_1.promises.mkdir(directory, { recursive: true });
        try {
            const snapshot = JSON.parse(await node_fs_1.promises.readFile(this.snapshotPath, 'utf8'));
            if (!snapshot.data || typeof snapshot.data !== 'object' || Array.isArray(snapshot.data))
                throw new TypeError('Invalid snapshot');
            this.store = snapshot.data;
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                await node_fs_1.promises.rename(this.snapshotPath, `${this.snapshotPath}.corrupted.${Date.now()}`);
                manager.emit('debug', `NyxLink > Local > Invalid snapshot preserved; replaying WAL: ${error.message}`);
            }
            this.store = Object.create(null);
        }
        let wal = '';
        try {
            wal = await node_fs_1.promises.readFile(this.logPath, 'utf8');
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
        }
        for (const line of wal.split('\n')) {
            if (!line)
                continue;
            let entry;
            try {
                if (line.startsWith('{'))
                    entry = JSON.parse(line);
                else {
                    const [op, key, ...value] = line.split('|');
                    if (op !== 's' && op !== 'd')
                        continue;
                    entry = { op: op === 's' ? 'set' : 'delete', key, value: op === 's' ? JSON.parse(value.join('|')) : undefined };
                }
                if (entry.op === 'clear')
                    await super.clear();
                else if (entry.op === 'set' && typeof entry.key === 'string')
                    await super.set(entry.key, entry.value);
                else if (entry.op === 'delete' && typeof entry.key === 'string')
                    await super.remove(entry.key);
            }
            catch {
                manager.emit('debug', 'NyxLink > Local > Ignoring malformed or unsafe WAL entry');
            }
        }
        await node_fs_1.promises.appendFile(this.logPath, wal && !wal.endsWith('\n') ? '\n' : '', { mode: 0o600 });
        this.compactionTimer = setInterval(() => {
            void this.enqueue(() => this.compact()).catch(error => manager.emit('debug', `NyxLink > Local > Compaction failed: ${error.message}`));
        }, 60000);
        this.compactionTimer.unref();
    }
    enqueue(operation) {
        if (this.closing)
            return Promise.reject(new Error('Local database is shutting down'));
        const result = this.tail.then(operation);
        this.tail = result.catch(() => undefined);
        return result;
    }
    set(key, value, log = true) {
        return this.enqueue(async () => {
            if (!key)
                return;
            this.parts(key);
            const entry = JSON.stringify({ op: value === undefined ? 'delete' : 'set', key, value });
            if (log)
                await node_fs_1.promises.appendFile(this.logPath, `${entry}\n`);
            await super.set(key, JSON.parse(entry).value);
        });
    }
    remove(key, log = true) {
        return this.enqueue(async () => {
            if (!key)
                return false;
            this.parts(key);
            if (await super.get(key) === undefined)
                return false;
            if (log)
                await node_fs_1.promises.appendFile(this.logPath, `${JSON.stringify({ op: 'delete', key })}\n`);
            return super.remove(key);
        });
    }
    clear() {
        return this.enqueue(async () => {
            await node_fs_1.promises.appendFile(this.logPath, `${JSON.stringify({ op: 'clear' })}\n`);
            await super.clear();
            await this.compact();
        });
    }
    async get(key) { await this.tail; return super.get(key); }
    async keys(pattern) { await this.tail; return super.keys(pattern); }
    async has(key) { return await this.get(key) !== undefined; }
    async flush() { await this.tail; }
    async compact() {
        const temporary = `${this.snapshotPath}.tmp`;
        await node_fs_1.promises.writeFile(temporary, JSON.stringify({ data: this.store }), { mode: 0o600 });
        await node_fs_1.promises.rename(temporary, this.snapshotPath);
        await node_fs_1.promises.writeFile(this.logPath, '', { mode: 0o600 });
    }
    shutdown() {
        if (!this.shutdownPromise) {
            this.closing = true;
            if (this.compactionTimer)
                clearInterval(this.compactionTimer);
            this.shutdownPromise = this.tail.then(() => this.compact());
        }
        return this.shutdownPromise;
    }
}
exports.Local = Local;
//# sourceMappingURL=Local.js.map