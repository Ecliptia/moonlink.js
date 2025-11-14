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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LMDBDatabase = void 0;
const lmdb_1 = require("lmdb");
const path = __importStar(require("node:path"));
const fs = __importStar(require("node:fs"));
class LMDBDatabase {
    db;
    dbPath;
    constructor(options) {
        this.dbPath = options.path ? path.resolve(options.path) : path.join(process.cwd(), "src", "datastore");
        if (!fs.existsSync(this.dbPath)) {
            try {
                fs.mkdirSync(this.dbPath, { recursive: true });
            }
            catch (error) {
                throw error;
            }
        }
        try {
            this.db = (0, lmdb_1.open)({
                path: this.dbPath,
                compression: options.compression ?? false,
                maxDbs: options.maxDbs ?? 12,
                encoding: "msgpack",
            });
        }
        catch (error) {
            throw error;
        }
    }
    get(key) {
        return this.db.get(key);
    }
    async set(key, value) {
        await this.db.put(key, value);
    }
    async delete(key) {
        await this.db.remove(key);
    }
    has(key) {
        return this.db.get(key) !== undefined;
    }
    async clear() {
        await this.db.clearAsync();
    }
    async all() {
        const allEntries = [];
        for await (const { key, value } of this.db.getRange()) {
            allEntries.push({ key: key, value });
        }
        return allEntries;
    }
    async close() {
        await this.db.close();
    }
}
exports.LMDBDatabase = LMDBDatabase;
//# sourceMappingURL=LMDBDatabase.js.map