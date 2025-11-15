"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const MemoryDatabase_1 = require("../database/MemoryDatabase");
const LMDBDatabase_1 = require("../database/LMDBDatabase");
class DatabaseManager {
    database;
    constructor(options) {
        if (options.provider === "lmdb") {
            this.database = new LMDBDatabase_1.LMDBDatabase(options);
        }
        else {
            this.database = new MemoryDatabase_1.MemoryDatabase(options);
        }
    }
    get(key) {
        return this.database.get(key);
    }
    async set(key, value) {
        await this.database.set(key, value);
    }
    async delete(key) {
        await this.database.delete(key);
    }
    has(key) {
        return this.database.has(key);
    }
    async clear() {
        await this.database.clear();
    }
    async all() {
        return this.database.all();
    }
    async close() {
        await this.database.close();
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=DatabaseManager.js.map