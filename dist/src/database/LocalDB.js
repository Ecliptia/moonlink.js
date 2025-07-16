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
exports.LocalDB = void 0;
const AbstractDatabase_1 = require("./AbstractDatabase");
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
class LocalDB extends AbstractDatabase_1.AbstractDatabase {
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
    async init(manager) {
        this.manager = manager;
        this.compactionIntervalMs = 60000;
        this.dir = manager.options.database?.options?.path ?? path_1.default.resolve(__dirname, "../datastore");
        this.snapshotPath = path_1.default.join(this.dir, `data.${manager.options.clientId}.json`);
        this.logPath = path_1.default.join(this.dir, `data.${manager.options.clientId}.wal`);
        this.manager.emit("debug", `Moonlink.js > Database > Mode set to WAL`);
        await fs_1.default.promises.mkdir(this.dir, { recursive: true });
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
                this.manager.emit("debug", `Moonlink.js > Database > Failed to deserialize WAL entry: ${e.message}`);
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
            this.walStream.write(dataToWrite, (err) => {
                if (err) {
                    this.manager.emit("debug", `Moonlink.js > Database > Failed to write to WAL stream: ${err.message}`);
                }
            });
            this.walBuffer = [];
        }
        catch (e) {
            this.manager.emit("debug", `Moonlink.js > Database > Failed to flush WAL buffer: ${e.message}`);
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
                await fs_1.default.promises.writeFile(this.snapshotPath, JSON.stringify({ data: {} }), 'utf-8').catch((writeErr) => {
                    this.manager.emit("debug", `Moonlink.js > Database > Failed to write initial snapshot file: ${writeErr.message}`);
                });
            }
            else {
                this.manager.emit("debug", `Moonlink.js > Database > Failed to load snapshot: ${err.message}`);
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
                await fs_1.default.promises.writeFile(this.logPath, '').catch((writeErr) => {
                    this.manager.emit("debug", `Moonlink.js > Database > Failed to write initial WAL file: ${writeErr.message}`);
                });
            }
            else {
                this.manager.emit("debug", `Moonlink.js > Database > Failed to replay WAL: ${err.message}`);
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
            this.walStream.on('error', (err) => {
                this.manager.emit("debug", `Moonlink.js > Database > WAL stream error: ${err.message}`);
            });
        }
        catch (err) {
            this.manager.emit("debug", `Moonlink.js > Database > Failed to open WAL stream: ${err.message}`);
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
            throw new Error("Key cannot be empty.");
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
        const existingValue = current[lastKey];
        if (typeof existingValue === 'object' && existingValue !== null && !Array.isArray(existingValue) &&
            typeof value === 'object' && value !== null && !Array.isArray(value)) {
            current[lastKey] = { ...existingValue, ...value };
        }
        else {
            current[lastKey] = value;
        }
        if (log) {
            this.appendLog('set', key, value);
        }
    }
    async get(key) {
        if (!key)
            throw new Error("Key cannot be empty.");
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
            throw new Error("Key cannot be empty.");
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
    async keys() {
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
            this.manager.emit("debug", `Moonlink.js > Database > Failed to compact database: ${err.message}`);
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
exports.LocalDB = LocalDB;
//# sourceMappingURL=LocalDB.js.map