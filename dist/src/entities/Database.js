"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../../index");
class Database {
    data = {};
    id;
    constructor(manager) {
        this.id = manager.options.clientId;
        index_1.Structure.getManager().emit("debug", `Moonlink.js > Database initialized with clientId(${this.id})`);
        this.loadData();
    }
    set(key, value) {
        if (!key)
            throw new Error('Key cannot be empty');
        this.modifyData(key, value);
        this.saveData();
    }
    get(key) {
        if (!key)
            throw new Error('Key cannot be empty');
        return key.split(".").reduce((acc, curr) => acc?.[curr], this.data) ?? undefined;
    }
    push(key, value) {
        const arr = this.get(key) || [];
        if (!Array.isArray(arr))
            throw new Error('Key does not point to an array');
        arr.push(value);
        this.set(key, arr);
    }
    delete(key) {
        if (!key)
            throw new Error('Key cannot be empty');
        const keys = key.split(".");
        const lastKey = keys.pop();
        let current = this.data;
        for (const k of keys) {
            if (typeof current[k] !== "object")
                return false;
            current = current[k];
        }
        if (lastKey && lastKey in current) {
            delete current[lastKey];
            this.saveData();
            return true;
        }
        return false;
    }
    modifyData(key, value) {
        const keys = key.split(".");
        let current = this.data;
        keys.forEach((k, i) => {
            if (i === keys.length - 1) {
                current[k] = value;
            }
            else {
                current[k] = current[k] || {};
                current = current[k];
            }
        });
    }
    loadData() {
        const filePath = this.getFilePath();
        if (fs_1.default.existsSync(filePath)) {
            index_1.Structure.getManager().emit("debug", `Moonlink.js > Database > Loading data from ${filePath}`);
            this.data = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
        }
        else {
            index_1.Structure.getManager().emit("debug", `Moonlink.js > Database > No data found for clientId(${this.id})`);
        }
    }
    saveData() {
        try {
            const filePath = this.getFilePath();
            fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
            fs_1.default.writeFileSync(filePath, JSON.stringify(this.data, null, 2));
        }
        catch (err) {
            throw new Error("Failed to save data");
        }
    }
    getFilePath() {
        return path_1.default.resolve(__dirname, "../Datastore", `data.${this.id}.json`);
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map