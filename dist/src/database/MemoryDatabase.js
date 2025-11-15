"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryDatabase = void 0;
class MemoryDatabase {
    data = new Map();
    constructor(options) {
    }
    get(key) {
        return this.data.get(key);
    }
    async set(key, value) {
        this.data.set(key, value);
    }
    async delete(key) {
        this.data.delete(key);
    }
    has(key) {
        return this.data.has(key);
    }
    async clear() {
        this.data.clear();
    }
    async all() {
        return Array.from(this.data.entries()).map(([key, value]) => ({ key, value }));
    }
    async close() {
    }
}
exports.MemoryDatabase = MemoryDatabase;
//# sourceMappingURL=MemoryDatabase.js.map