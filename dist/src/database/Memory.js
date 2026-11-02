"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = void 0;
class Memory {
    store = Object.create(null);
    async init(_manager, _options) { }
    parts(key) {
        const parts = key.split('.');
        if (parts.some(part => !part || ['__proto__', 'prototype', 'constructor'].includes(part))) {
            throw new TypeError('Invalid memory storage path');
        }
        return parts;
    }
    async get(key) {
        if (!key)
            return undefined;
        let value = this.store;
        let parts;
        try {
            parts = this.parts(key);
        }
        catch {
            return undefined;
        }
        for (const part of parts) {
            if (!value || typeof value !== 'object' || !Object.hasOwn(value, part))
                return undefined;
            value = value[part];
        }
        return value;
    }
    async set(key, value) {
        if (!key)
            return;
        const parts = this.parts(key);
        let current = this.store;
        for (const part of parts.slice(0, -1)) {
            if (!Object.hasOwn(current, part) || !current[part] || typeof current[part] !== 'object')
                current[part] = Object.create(null);
            current = current[part];
        }
        current[parts.at(-1)] = value;
    }
    async has(key) { return await this.get(key) !== undefined; }
    async remove(key) {
        if (!key)
            return false;
        const parts = this.parts(key);
        let current = this.store;
        for (const part of parts.slice(0, -1)) {
            if (!current || typeof current !== 'object' || !Object.hasOwn(current, part))
                return false;
            current = current[part];
        }
        const last = parts.at(-1);
        if (!current || typeof current !== 'object' || !Object.hasOwn(current, last))
            return false;
        delete current[last];
        return true;
    }
    async keys(pattern) {
        const keys = [];
        const ancestors = new Set();
        const visit = (object, prefix) => {
            ancestors.add(object);
            for (const [key, value] of Object.entries(object)) {
                const full = prefix ? `${prefix}.${key}` : key;
                if (value && typeof value === 'object' && !Array.isArray(value) && !ancestors.has(value))
                    visit(value, full);
                else
                    keys.push(full);
            }
            ancestors.delete(object);
        };
        visit(this.store, '');
        if (!pattern || pattern === '*')
            return keys;
        const escaped = pattern.split('*').map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
        const matcher = new RegExp(`^${escaped}$`);
        return keys.filter(key => matcher.test(key));
    }
    async clear() { this.store = Object.create(null); }
    async shutdown() { await this.clear(); }
}
exports.Memory = Memory;
//# sourceMappingURL=Memory.js.map