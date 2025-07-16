"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryDB = void 0;
const AbstractDatabase_1 = require("./AbstractDatabase");
class MemoryDB extends AbstractDatabase_1.AbstractDatabase {
    store = new Map();
    async init(manager) { }
    set(key, value) {
        this.store.set(key, value);
    }
    get(key) {
        return this.store.get(key);
    }
    remove(key) {
        return this.store.delete(key);
    }
    has(key) {
        return this.store.has(key);
    }
    keys() {
        return [...this.store.keys()];
    }
    clear() {
        this.store.clear();
    }
    async shutdown() { }
}
exports.MemoryDB = MemoryDB;
//# sourceMappingURL=MemoryDB.js.map