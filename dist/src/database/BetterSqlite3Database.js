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
exports.BetterSqlite3Database = void 0;
const path = __importStar(require("node:path"));
const fs = __importStar(require("node:fs"));
let Database;
try {
    Database = require("better-sqlite3");
}
catch {
    Database = null;
}
class BetterSqlite3Database {
    db;
    dbPath;
    constructor(options) {
        if (!Database) {
            throw new Error("better-sqlite3 is not installed. Please install it to use this database provider.");
        }
        this.dbPath = options.path ? path.resolve(options.path) : path.resolve(__dirname, "../datastore", "moonlink.db");
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        this.db = new Database(this.dbPath);
        this.db.exec("CREATE TABLE IF NOT EXISTS moonlink (key TEXT PRIMARY KEY, value TEXT)");
    }
    get(key) {
        const res = this.db.prepare("SELECT value FROM moonlink WHERE key = ?").get(key);
        return res ? JSON.parse(res.value) : undefined;
    }
    set(key, value) {
        this.db.prepare("INSERT OR REPLACE INTO moonlink (key, value) VALUES (?, ?)").run(key, JSON.stringify(value));
        return Promise.resolve();
    }
    delete(key) {
        this.db.prepare("DELETE FROM moonlink WHERE key = ?").run(key);
        return Promise.resolve();
    }
    has(key) {
        return !!this.db.prepare("SELECT key FROM moonlink WHERE key = ?").get(key);
    }
    clear() {
        this.db.exec("DELETE FROM moonlink");
        return Promise.resolve();
    }
    all() {
        const allEntries = this.db.prepare("SELECT * FROM moonlink").all().map(row => ({
            key: row.key,
            value: JSON.parse(row.value)
        }));
        return Promise.resolve(allEntries);
    }
    close() {
        this.db.close();
        return Promise.resolve();
    }
}
exports.BetterSqlite3Database = BetterSqlite3Database;
//# sourceMappingURL=BetterSqlite3Database.js.map