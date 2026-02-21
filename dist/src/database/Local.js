"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Local = void 0;
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const isDocker = () => {
    try {
        if (fs_1.default.existsSync('/.dockerenv'))
            return true;
        if (fs_1.default.existsSync('/proc/1/cgroup')) {
            const cgroup = fs_1.default.readFileSync('/proc/1/cgroup', 'utf-8');
            if (cgroup.includes('docker') || cgroup.includes('kubepods'))
                return true;
        }
    }
    catch { }
    return false;
};
const getDefaultDataPath = () => {
    const envPath = process.env.MOONLINK_DB_PATH;
    if (envPath)
        return envPath;
    return path_1.default.join(process.cwd(), '.moonlink', 'data');
};
class Local {
    store = {};
    dir;
    snapshotPath;
    logPath;
    walStream;
    compactionIntervalMs;
    compactionTimer;
    manager;
    walBuffer = [];
    walBufferMaxSize = 50;
    walFlushInterval;
    walFlushIntervalMs = 500;
    async init(manager, options) {
        this.manager = manager;
        this.compactionIntervalMs = 60000;
        this.dir = this.manager.options.database?.options?.path
            ?? process.env.MOONLINK_DB_PATH
            ?? getDefaultDataPath();
        this.snapshotPath = path_1.default.join(this.dir, `data.${this.manager.clientId}.json`);
        this.logPath = path_1.default.join(this.dir, `data.${this.manager.clientId}.wal`);
        await fs_1.default.promises.mkdir(this.dir, { recursive: true });
        this.manager.emit("debug", `Moonlink.js > LocalDB >> Database initialized at: ${this.dir} (Docker: ${isDocker()})`);
        await this.loadSnapshot();
        await this.replayWAL();
        this.openWALStream();
        this.compactionTimer = setInterval(() => this.compact(), this.compactionIntervalMs);
        this.walFlushInterval = setInterval(() => this._flushWALBuffer(), this.walFlushIntervalMs);
    }
    _serializeEntry(entry) {
        const opCode = entry.op === 'set' ? 's' : 'd';
        if (entry.op === 'set') {
            const valueStr = JSON.stringify(entry.value);
            return `${opCode}|${entry.key}|${valueStr}\n`;
        }
        return `${opCode}|${entry.key}\n`;
    }
    _deserializeEntry(line) {
        const parts = line.split('|');
        if (parts.length < 2)
            return null;
        const opCode = parts[0];
        const key = parts[1];
        if (opCode === 's') {
            try {
                const value = JSON.parse(parts.slice(2).join('|'));
                return { op: 'set', key, value };
            }
            catch (e) {
                return null;
            }
        }
        else if (opCode === 'd') {
            return { op: 'delete', key };
        }
        return null;
    }
    _flushWALBuffer() {
        if (!this.walStream || this.walBuffer.length === 0) {
            return;
        }
        try {
            const dataToWrite = this.walBuffer.map(entry => this._serializeEntry(entry)).join('');
            this.walStream.write(dataToWrite);
            this.walBuffer = [];
        }
        catch (error) {
            this.manager.emit("debug", `Moonlink.js > LocalDB >> Failed to flush WAL buffer. Error: ${error.message}`);
        }
    }
    async loadSnapshot() {
        try {
            const raw = await fs_1.default.promises.readFile(this.snapshotPath, 'utf-8');
            const wrapper = JSON.parse(raw);
            this.store = wrapper.data || {};
        }
        catch (err) {
            this.store = {};
            if (err.code === 'ENOENT') {
                await fs_1.default.promises.writeFile(this.snapshotPath, JSON.stringify({ data: {} }), 'utf-8');
            }
        }
    }
    async replayWAL() {
        let walContent;
        try {
            walContent = await fs_1.default.promises.readFile(this.logPath, 'utf-8');
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                await fs_1.default.promises.writeFile(this.logPath, '');
            }
            return;
        }
        const lines = walContent.split('\n');
        for (const line of lines) {
            if (!line)
                continue;
            const entry = this._deserializeEntry(line);
            if (!entry)
                continue;
            if (entry.op === 'set') {
                this.set(entry.key, entry.value, false);
            }
            else if (entry.op === 'delete') {
                this.remove(entry.key, false);
            }
        }
    }
    openWALStream() {
        try {
            this.walStream = (0, fs_1.createWriteStream)(this.logPath, { flags: 'a' });
        }
        catch (err) {
            this.manager.emit("debug", `Moonlink.js > LocalDB >> Failed to open WAL stream. Error: ${err.message}`);
        }
    }
    appendLog(op, key, value) {
        const entry = { op, key, value };
        this.walBuffer.push(entry);
        if (this.walBuffer.length >= this.walBufferMaxSize) {
            this._flushWALBuffer();
        }
    }
    async set(key, value, log = true) {
        if (!key)
            return;
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
    async get(key) {
        if (!key)
            return undefined;
        const parts = key.split('.');
        let value = this.store;
        for (const part of parts) {
            if (typeof value !== 'object' || value === null) {
                return undefined;
            }
            value = value[part];
        }
        return value;
    }
    async has(key) {
        return (await this.get(key)) !== undefined;
    }
    async remove(key, log = true) {
        if (!key)
            return false;
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
    async keys(pattern) {
        const allKeys = [];
        const recurse = (obj, prefix) => {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const newPrefix = prefix ? `${prefix}.${key}` : key;
                    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                        recurse(obj[key], newPrefix);
                    }
                    else {
                        allKeys.push(newPrefix);
                    }
                }
            }
        };
        recurse(this.store, '');
        if (pattern && pattern !== '*') {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return allKeys.filter(key => regex.test(key));
        }
        return allKeys;
    }
    async clear() {
        this.store = {};
        this.walBuffer = [];
        if (this.walStream) {
            await new Promise(resolve => this.walStream.end(resolve));
            this.walStream = undefined;
        }
        await fs_1.default.promises.writeFile(this.logPath, '');
    }
    async compact() {
        this._flushWALBuffer();
        if (this.walStream) {
            await new Promise(resolve => this.walStream.end(resolve));
            this.walStream = undefined;
        }
        try {
            const wrapper = { data: this.store };
            const raw = JSON.stringify(wrapper, null, 2);
            await fs_1.default.promises.writeFile(this.snapshotPath, raw, 'utf-8');
            await fs_1.default.promises.writeFile(this.logPath, '', 'utf-8');
        }
        catch (err) {
            this.manager.emit("debug", `Moonlink.js > LocalDB >> Failed to compact database. Error: ${err.message}`);
        }
        finally {
            this.openWALStream();
        }
    }
    async shutdown() {
        if (this.compactionTimer)
            clearInterval(this.compactionTimer);
        if (this.walFlushInterval)
            clearInterval(this.walFlushInterval);
        await this.compact();
        if (this.walStream) {
            await new Promise(resolve => this.walStream.end(resolve));
            this.walStream = undefined;
        }
    }
}
exports.Local = Local;
//# sourceMappingURL=Local.js.map