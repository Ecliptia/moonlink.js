"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkDatabase = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MoonlinkDatabase {
    data = {};
    id;
    constructor(clientId) {
        this.fetch();
        this.id = clientId;
    }
    set(key, value) {
        if (!key)
            throw new Error('@Moonlink(Database) - "key" is empty');
        const keys = key.split(".");
        if (keys.length === 0)
            return;
        this.updateData(this.data, keys, value);
        this.save();
    }
    get(key) {
        if (!key)
            throw new Error('[ @Moonlink(Database) - "key" is empty');
        if (Object.keys(this.data).length === 0)
            this.fetch();
        return (key.split(".").reduce((acc, curr) => acc?.[curr], this.data) ?? null);
    }
    push(key, value) {
        if (!key)
            throw new Error('@Moonlink(Database) - "key" is empty');
        const oldArray = this.get(key) || [];
        if (Array.isArray(oldArray)) {
            oldArray.push(value);
            this.set(key, oldArray);
        }
        else {
            throw new Error("@Moonlink(Database) - Key does not point to an array");
        }
    }
    delete(key) {
        if (!key)
            throw new Error('@Moonlink(Database) - "key" is empty');
        const keys = key.split(".");
        if (keys.length === 0)
            return false;
        const lastKey = keys.pop() || "";
        let currentObj = this.data;
        keys.forEach(k => {
            if (typeof currentObj[k] === "object") {
                currentObj = currentObj[k];
            }
            else {
                throw new Error(`@Moonlink(Database) - Key path "${key}" does not exist`);
            }
        });
        if (currentObj && lastKey in currentObj) {
            delete currentObj[lastKey];
            this.save();
            return true;
        }
        return false;
    }
    updateData(data, keys, value) {
        let currentObj = data;
        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                currentObj[key] = value;
            }
            else {
                if (typeof currentObj[key] !== "object") {
                    currentObj[key] = {};
                }
                currentObj = currentObj[key];
            }
        });
    }
    getFilePath() {
        return path_1.default.join(__dirname, "../@Datastore", `database-${this.id}.json`);
    }
    fetch() {
        try {
            const directory = path_1.default.join(__dirname, "../@Datastore");
            if (!fs_1.default.existsSync(directory)) {
                fs_1.default.mkdirSync(directory, { recursive: true });
            }
            const filePath = this.getFilePath();
            const fileDescriptor = fs_1.default.openSync(filePath, "r");
            const rawData = fs_1.default.readFileSync(fileDescriptor, "utf-8");
            this.data = JSON.parse(rawData) || {};
            fs_1.default.closeSync(fileDescriptor);
        }
        catch (err) {
            if (err.code === "ENOENT") {
                this.data = {};
            }
            else {
                throw new Error("@Moonlink(Database) - Failed to fetch data (Error):", err);
            }
        }
    }
    save() {
        try {
            const filePath = this.getFilePath();
            const fileDescriptor = fs_1.default.openSync(filePath, "w");
            fs_1.default.writeFileSync(fileDescriptor, JSON.stringify(this.data, null, 2));
            fs_1.default.closeSync(fileDescriptor);
        }
        catch (error) {
            throw new Error("@Moonlink(Database) - Failed to save data, error: ", error);
        }
    }
}
exports.MoonlinkDatabase = MoonlinkDatabase;
