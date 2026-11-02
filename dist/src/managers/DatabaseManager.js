"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const Memory_1 = require("../database/Memory");
const Local_1 = require("../database/Local");
class DatabaseManager {
    provider;
    tail = Promise.resolve();
    closing = false;
    shutdownPromise;
    manager;
    dbConfig;
    constructor(manager) {
        this.manager = manager;
        this.dbConfig = this.manager.options.database || { type: 'memory' };
        if (this.manager.options.database?.adapter) {
            this.provider = this.manager.options.database.adapter;
            return;
        }
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
        await this.tail;
        return this.provider.get(key);
    }
    set(key, value) {
        return this.mutate(() => this.provider.set(key, value));
    }
    remove(key) {
        return this.mutate(() => this.provider.remove(key));
    }
    async has(key) {
        await this.tail;
        return this.provider.has(key);
    }
    async keys(pattern) {
        await this.tail;
        return this.provider.keys(pattern);
    }
    clear() {
        return this.mutate(() => this.provider.clear());
    }
    mutate(operation) {
        if (this.closing)
            return Promise.reject(new Error('Database is shutting down'));
        const result = this.tail.then(operation);
        this.tail = result.catch(() => undefined);
        return result;
    }
    async flush() {
        await this.tail;
        await this.provider.flush?.();
    }
    shutdown() {
        if (!this.shutdownPromise) {
            this.closing = true;
            this.shutdownPromise = this.tail.then(async () => {
                const errors = [];
                try {
                    await this.provider.flush?.();
                }
                catch (error) {
                    errors.push(error);
                }
                try {
                    await this.provider.shutdown();
                }
                catch (error) {
                    errors.push(error);
                }
                if (errors.length === 1)
                    throw errors[0];
                if (errors.length)
                    throw new AggregateError(errors, 'Storage shutdown failed');
            });
        }
        return this.shutdownPromise;
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=DatabaseManager.js.map