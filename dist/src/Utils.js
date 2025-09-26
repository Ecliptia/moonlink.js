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
exports.generateUUID = generateUUID;
exports.Log = Log;
exports.makeRequest = makeRequest;
exports.compareVersions = compareVersions;
exports.stringifyWithReplacer = stringifyWithReplacer;
exports.isSourceBlacklisted = isSourceBlacklisted;
exports.isValidDiscordId = isValidDiscordId;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_crypto_1 = require("node:crypto");
const node_http_1 = __importDefault(require("node:http"));
const node_https_1 = __importDefault(require("node:https"));
const node_zlib_1 = __importDefault(require("node:zlib"));
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
function generateUUID(host, port) {
    const data = `${host}:${port}`;
    const hash = (0, node_crypto_1.createHash)("sha256").update(data).digest("hex");
    return hash;
}
function Log(message, LogPath) {
    const timestamp = new Date().toISOString();
    const logmessage = `[${timestamp}] ${message}\n`;
    const logpath = node_path_1.default.resolve(LogPath);
    node_fs_1.default.exists(logpath, (exists) => {
        if (!exists) {
            try {
                node_fs_1.default.mkdirSync(node_path_1.default.dirname(logpath), { recursive: true });
                node_fs_1.default.writeFileSync(logpath, "");
            }
            catch (error) {
                console.error("Failed to create log file:", error);
                return;
            }
        }
        try {
            node_fs_1.default.appendFileSync(logpath, logmessage);
        }
        catch (error) {
            console.error("Failed to append to log file:", error);
        }
    });
}
async function makeRequest(url, options, timeout = 10000, retries = 3, retryDelay = 1000) {
    for (let i = 0; i <= retries; i++) {
        try {
            return await new Promise((resolve) => {
                const urlObject = new URL(url);
                const transport = urlObject.protocol === "https:" ? node_https_1.default : node_http_1.default;
                options.headers = options.headers || {};
                options.headers["Accept-Encoding"] = "gzip, deflate, br";
                const req = transport.request(url, options, (res) => {
                    let stream = res;
                    const encoding = res.headers["content-encoding"];
                    if (encoding === "gzip") {
                        stream = res.pipe(node_zlib_1.default.createGunzip());
                    }
                    else if (encoding === "deflate") {
                        stream = res.pipe(node_zlib_1.default.createInflate());
                    }
                    else if (encoding === "br") {
                        stream = res.pipe(node_zlib_1.default.createBrotliDecompress());
                    }
                    const chunks = [];
                    stream.on("data", (chunk) => chunks.push(chunk));
                    stream.on("error", () => resolve(undefined));
                    stream.on("end", () => {
                        const body = Buffer.concat(chunks);
                        const contentType = res.headers["content-type"] || "";
                        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                            if (body.length === 0) {
                                if (contentType.includes("application/json")) {
                                    return resolve({});
                                }
                                return resolve("");
                            }
                            try {
                                if (contentType.includes("application/json")) {
                                    return resolve(JSON.parse(body.toString()));
                                }
                                return resolve(body.toString());
                            }
                            catch {
                                return resolve(undefined);
                            }
                        }
                        resolve(undefined);
                    });
                });
                req.on("error", () => resolve(undefined));
                req.on("timeout", () => {
                    req.destroy();
                    resolve(undefined);
                });
                req.setTimeout(timeout);
                if (options.body) {
                    const bodyData = typeof options.body === "object" && options.body !== null
                        ? JSON.stringify(options.body)
                        : options.body.toString();
                    req.setHeader("Content-Length", Buffer.byteLength(bodyData));
                    req.write(bodyData);
                }
                req.end();
            });
        }
        catch (error) {
            if (i < retries) {
                await delay(retryDelay * Math.pow(2, i));
            }
            else {
                return undefined;
            }
        }
    }
    return undefined;
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
function isSourceBlacklisted(manager, sourceName) {
    if (!manager || !manager.options || !manager.options.blacklistedSources) {
        return false;
    }
    return manager.options.blacklistedSources.includes(sourceName);
}
function isValidDiscordId(id) {
    return typeof id === "string" && /^\d{17,20}$/.test(id);
}
//# sourceMappingURL=Utils.js.map