"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = void 0;
class Memory {
    async init(manager, options) {
        return Promise.resolve();
    }
    async get() {
        return Promise.resolve(undefined);
    }
    async set() {
        return Promise.resolve();
    }
    async remove() {
        return Promise.resolve(false);
    }
    async has() {
        return Promise.resolve(false);
    }
    async keys(pattern) {
        return Promise.resolve([]);
    }
    async clear() {
        return Promise.resolve();
    }
    async shutdown() {
        return Promise.resolve();
    }
}
exports.Memory = Memory;
//# sourceMappingURL=Memory.js.map