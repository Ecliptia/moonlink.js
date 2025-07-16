"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const LocalDB_1 = require("../database/LocalDB");
const MemoryDB_1 = require("../database/MemoryDB");
class DatabaseManager {
    provider;
    manager;
    constructor(manager) {
        this.manager = manager;
        const dbConfig = this.manager.options.database;
        if (typeof dbConfig?.provider === 'function') {
            this.provider = new dbConfig.provider();
        }
        else if (dbConfig?.provider === 'memory') {
            this.provider = new MemoryDB_1.MemoryDB();
        }
        else {
            this.provider = new LocalDB_1.LocalDB();
        }
    }
    async init() {
        await this.provider.init(this.manager);
    }
    set(key, value) {
        this.provider.set(key, value);
    }
    get(key) {
        return this.provider.get(key);
    }
    remove(key) {
        return this.provider.remove(key);
    }
    has(key) {
        return this.provider.has(key);
    }
    keys() {
        return this.provider.keys();
    }
    clear() {
        this.provider.clear();
    }
    async shutdown() {
        await this.provider.shutdown();
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=DatabaseManager.js.map