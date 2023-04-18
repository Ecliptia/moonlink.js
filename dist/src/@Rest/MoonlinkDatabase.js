"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkDatabase = void 0;
const fs_1 = __importDefault(require("fs"));
class MoonlinkDatabase {
    data = {};
    constructor() {
        this.fetch();
    }
    set(key, value) {
        this.fetch();
        const keys = key.split('.');
        const obj = (data, _key) => {
            if (_key.length === 1)
                data[_key[0]] = value;
            else {
                if (typeof data[_key[0]] !== 'object')
                    data[_key[0]] = {};
                data[_key[0]] = { ...data[_key[0]] };
                obj(data[_key[0]], _key.slice(1));
            }
        };
        obj(this.data, keys);
        this.save();
        return this.get(keys[0]);
    }
    get(key) {
        this.save();
        const data = key.split('.').reduce((acc, curr) => acc?.[curr], this.data);
        return data;
    }
    push(key, value) {
        this.save();
        const old_array = this.get(key) ?? [];
        if (!(Array.isArray(old_array)) && old_array !== undefined)
            return;
        old_array.push(value);
        this.set(key, old_array);
        this.save();
        return this.get(key.split('.')[0]);
    }
    delete(key) {
        this.save();
        const data = this.get(key);
        key.split('.').reduce((o, curr, i, arr) => {
            if (i === arr.length - 1)
                delete o?.[curr];
            else
                return o?.[curr];
        }, this.data);
        this.save();
        return true;
    }
    fetch() {
        try {
            let data = JSON.parse(fs_1.default.readFileSync(__dirname + '/database.json').toString(), (key, value) => {
                return value;
            });
            if (!data)
                data = {};
            this.data = data;
        }
        catch (err) {
            if (err.code == 'ENOENT')
                this.data = {};
        }
    }
    save() {
        try {
            fs_1.default.writeFileSync(__dirname + '/database.json', JSON.stringify(this.data, null, 2));
            this.fetch();
        }
        catch (e) {
            console.log(e);
        }
    }
}
exports.MoonlinkDatabase = MoonlinkDatabase;
//# sourceMappingURL=MoonlinkDatabase.js.map