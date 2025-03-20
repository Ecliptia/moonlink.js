"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = exports.Structure = exports.sources = exports.structures = void 0;
exports.validateProperty = validateProperty;
exports.delay = delay;
exports.decodeTrack = decodeTrack;
exports.encodeTrack = encodeTrack;
exports.generateShortUUID = generateShortUUID;
exports.Log = Log;
exports.makeRequest = makeRequest;
exports.compareVersions = compareVersions;
exports.stringifyWithReplacer = stringifyWithReplacer;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
exports.structures = {};
exports.sources = {
    youtube: "ytsearch",
    youtubemusic: "ytmsearch",
    soundcloud: "scsearch",
    local: "local",
};
class Structure {
    static manager;
    static setManager(manager) {
        this.manager = manager;
    }
    static getManager() {
        return this.manager;
    }
    static get(name) {
        const structure = exports.structures[name];
        if (!structure) {
            throw new TypeError(`"${name}" structure must be provided.`);
        }
        return structure;
    }
    static extend(name, extender) {
        exports.structures[name] = extender;
    }
}
exports.Structure = Structure;
function validateProperty(prop, validator, errorMessage) {
    if (!validator(prop)) {
        throw new Error(errorMessage);
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function decodeTrack(encoded) {
    const buffer = Buffer.from(encoded, "base64");
    let position = 0;
    const read = {
        byte: () => buffer[position++],
        ushort: () => {
            const value = buffer.readUInt16BE(position);
            position += 2;
            return value;
        },
        int: () => {
            const value = buffer.readInt32BE(position);
            position += 4;
            return value;
        },
        long: () => {
            const value = buffer.readBigInt64BE(position);
            position += 8;
            return value;
        },
        utf: () => {
            const length = read.ushort();
            const value = buffer.toString("utf8", position, position + length);
            position += length;
            return value;
        },
    };
    const firstInt = read.int();
    const isVersioned = ((firstInt & 0xc0000000) >> 30) & 1;
    const version = isVersioned ? read.byte() : 1;
    return {
        encoded: encoded,
        info: {
            title: read.utf(),
            author: read.utf(),
            length: Number(read.long()),
            identifier: read.utf(),
            isSeekable: true,
            isStream: !!read.byte(),
            uri: version >= 2 && read.byte() ? read.utf() : null,
            artworkUrl: version === 3 && read.byte() ? read.utf() : null,
            isrc: version === 3 && read.byte() ? read.utf() : null,
            sourceName: read.utf(),
            position: Number(read.long()),
        },
        pluginInfo: {},
        userData: {},
    };
}
function encodeTrack(track) {
    const bufferArray = [];
    function write(type, value) {
        if (type === "byte")
            bufferArray.push(Buffer.from([value]));
        if (type === "ushort") {
            const buf = Buffer.alloc(2);
            buf.writeUInt16BE(value);
            bufferArray.push(buf);
        }
        if (type === "int") {
            const buf = Buffer.alloc(4);
            buf.writeInt32BE(value);
            bufferArray.push(buf);
        }
        if (type === "long") {
            const buf = Buffer.alloc(8);
            buf.writeBigInt64BE(BigInt(value));
            bufferArray.push(buf);
        }
        if (type === "utf") {
            const strBuf = Buffer.from(value, "utf8");
            write("ushort", strBuf.length);
            bufferArray.push(strBuf);
        }
    }
    const version = track.artworkUrl || track.isrc ? 3 : track.uri ? 2 : 1;
    const isVersioned = version > 1 ? 1 : 0;
    const firstInt = isVersioned << 30;
    write("int", firstInt);
    if (isVersioned) {
        write("byte", version);
    }
    write("utf", track.title);
    write("utf", track.author);
    write("long", track.length);
    write("utf", track.identifier);
    write("byte", track.isStream ? 1 : 0);
    if (version >= 2) {
        write("byte", track.uri ? 1 : 0);
        if (track.uri)
            write("utf", track.uri);
    }
    if (version === 3) {
        write("byte", track.artworkUrl ? 1 : 0);
        if (track.artworkUrl)
            write("utf", track.artworkUrl);
        write("byte", track.isrc ? 1 : 0);
        if (track.isrc)
            write("utf", track.isrc);
    }
    write("utf", track.sourceName);
    write("long", track.position);
    return Buffer.concat(bufferArray).toString("base64");
}
function generateShortUUID(host, port) {
    const data = `${host}:${port}`;
    const hash = (0, crypto_1.createHash)("sha256").update(data).digest("hex");
    return parseInt(hash.slice(0, 8), 16).toString(36).padEnd(8, "0");
}
function Log(message, LogPath) {
    const timestamp = new Date().toISOString();
    const logmessage = `[${timestamp}] ${message}\n`;
    const logpath = path_1.default.resolve(LogPath);
    fs_1.default.exists(logpath, (exists) => {
        if (!exists) {
            fs_1.default.mkdirSync(path_1.default.dirname(logpath), { recursive: true });
            fs_1.default.writeFileSync(logpath, "");
        }
        try {
            fs_1.default.appendFileSync(logpath, logmessage);
        }
        catch (error) {
            return false;
        }
    });
}
function makeRequest(url, options) {
    let request = fetch(url, options)
        .then(res => res.json().catch(() => res.text()))
        .then(json => json);
    if (!request)
        return;
    return request;
}
function compareVersions(current, required) {
    const curr = current.split(".").map(Number);
    const req = required.split(".").map(Number);
    const len = Math.max(curr.length, req.length);
    for (let i = 0; i < len; i++) {
        const a = curr[i] || 0;
        const b = req[i] || 0;
        if (a !== b)
            return a - b;
    }
    return 0;
}
function stringifyWithReplacer(obj) {
    const cache = new Set();
    return JSON.stringify(obj, (_key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                return "[Circular Refs]";
            }
            cache.add(value);
        }
        return value;
    });
}
class Plugin {
    name;
    version;
    description;
    author;
    minVersion;
    load(manager) { }
    unload(manager) { }
}
exports.Plugin = Plugin;
//# sourceMappingURL=Utils.js.map