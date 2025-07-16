"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryDB = void 0;
const AbstractDatabase_1 = require("./AbstractDatabase");
class MemoryDB extends AbstractDatabase_1.AbstractDatabase {
    store = new Map();
    async init(manager) { }
    async set(key, value) {
        this.store.set(key, value);
    }
    async get(key) {
        return this.store.get(key);
    }
    async remove(key) {
        return this.store.delete(key);
    }
    async has(key) {
        return this.store.has(key);
    }
    async keys() {
        return [...this.store.keys()];
    }
    async clear() {
        this.store.clear();
    }
    async shutdown() { }
}
exports.MemoryDB = MemoryDB;
//# sourceMappingURL=MemoryDB.js.map