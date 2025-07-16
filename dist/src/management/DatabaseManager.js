"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const LocalDB_1 = require("../database/LocalDB");
const MemoryDB_1 = require("../database/MemoryDB");
const MongooseDB_1 = require("../database/MongooseDB");
class DatabaseManager {
    provider;
    manager;
    constructor(manager) {
        this.manager = manager;
        const dbConfig = this.manager.options.database;
        if (typeof dbConfig?.provider === 'function') {
            this.provider = new dbConfig.provider();
        }
        else if (dbConfig?.provider === 'mongoose') {
            this.provider = new MongooseDB_1.MongooseDB();
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
    async set(key, value) {
        await this.provider.set(key, value);
    }
    async get(key) {
        return await this.provider.get(key);
    }
    async remove(key) {
        return await this.provider.remove(key);
    }
    async has(key) {
        return await this.provider.has(key);
    }
    async keys() {
        return await this.provider.keys();
    }
    async clear() {
        await this.provider.clear();
    }
    async shutdown() {
        await this.provider.shutdown();
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=DatabaseManager.js.map