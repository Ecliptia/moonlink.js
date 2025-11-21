"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const Memory_1 = require("../database/Memory");
const Local_1 = require("../database/Local");
class DatabaseManager {
    provider;
    manager;
    dbConfig;
    constructor(manager) {
        this.manager = manager;
        this.dbConfig = this.manager.options.database || { type: 'memory' };
        switch (this.dbConfig.type) {
            case 'local':
                this.provider = new Local_1.Local();
                break;
            case 'memory':
            default:
                this.provider = new Memory_1.Memory();
                break;
        }
    }
    async initialize() {
        await this.provider.init(this.manager, this.dbConfig.options);
    }
    async get(key) {
        return this.provider.get(key);
    }
    async set(key, value) {
        return this.provider.set(key, value);
    }
    async remove(key) {
        return this.provider.remove(key);
    }
    async has(key) {
        return this.provider.has(key);
    }
    async keys(pattern) {
        return this.provider.keys(pattern);
    }
    async clear() {
        return this.provider.clear();
    }
    async shutdown() {
        return this.provider.shutdown();
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=DatabaseManager.js.map