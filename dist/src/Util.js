"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = exports.Plugin = exports.sources = exports.nodeLinkSources = exports.NODELINK_URL = exports.Structure = exports.structures = void 0;
exports.validate = validate;
exports.delay = delay;
exports.nodeLinkOnlyError = nodeLinkOnlyError;
exports.normalizeNodeLinkResponse = normalizeNodeLinkResponse;
exports.decodeTrack = decodeTrack;
exports.encodeTrack = encodeTrack;
exports.generateUUID = generateUUID;
exports.Log = Log;
exports.makeRequest = makeRequest;
exports.makeStreamRequest = makeStreamRequest;
exports.stringifyWithReplacer = stringifyWithReplacer;
exports.isSourceBlacklisted = isSourceBlacklisted;
exports.isValidDiscordId = isValidDiscordId;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_crypto_1 = require("node:crypto");
const node_http_1 = __importDefault(require("node:http"));
const node_https_1 = __importDefault(require("node:https"));
const node_zlib_1 = __importDefault(require("node:zlib"));
const node_url_1 = require("node:url");
exports.structures = {};
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
            throw new TypeError(`"${name}" structure is not registered.`);
        }
        return structure;
    }
    static register(name, structure) {
        if (typeof name !== "string" || !name) {
            throw new TypeError("Structure name must be a non-empty string.");
        }
        if (exports.structures[name]) {
            throw new TypeError(`Structure "${name}" is already registered.`);
        }
        exports.structures[name] = structure;
    }
    static extend(name, extender) {
        const baseClass = exports.structures[name];
        if (!baseClass) {
            throw new TypeError(`"${name}" is not a valid structure to extend.`);
        }
        if (typeof extender !== "function") {
            throw new TypeError(`Structure extender for "${name}" must be a function.`);
        }
        const extended = extender(baseClass);
        exports.structures[name] = extended;
    }
}
exports.Structure = Structure;
function validate(prop, validator, errorMessage) {
    if (!validator(prop)) {
        throw new TypeError(`Moonlink.js > ${errorMessage}`);
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.NODELINK_URL = "https://github.com/PerformanC/NodeLink";
function nodeLinkOnlyError(feature) {
    return new Error(`NodeLink-only feature (${feature}). This node is not NodeLink. See ${exports.NODELINK_URL}.`);
}
function normalizeNodeLinkResponse(input, fallbackLoadType) {
    if (input && typeof input === "object" && "data" in input) {
        const typed = input;
        return {
            loadType: typed.loadType ?? fallbackLoadType,
            data: typed.data,
        };
    }
    return { loadType: fallbackLoadType, data: input };
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
    const logMessage = `[${timestamp}] ${message}\n`;
    try {
        const logPathResolved = node_path_1.default.resolve(LogPath);
        const logDir = node_path_1.default.dirname(logPathResolved);
        if (!node_fs_1.default.existsSync(logDir)) {
            node_fs_1.default.mkdirSync(logDir, { recursive: true });
        }
        node_fs_1.default.appendFileSync(logPathResolved, logMessage);
    }
    catch (error) {
        console.error("Failed to write to log file:", error);
    }
}
async function makeRequest(initialUrl, options, timeout = 100000, retries = 3, retryDelay = 1000, maxRedirects = 5) {
    const { returnHeaders } = options;
    const supportsZstd = typeof node_zlib_1.default
        .createZstdDecompress === "function";
    const acceptEncoding = supportsZstd
        ? "gzip, deflate, br, zstd"
        : "gzip, deflate, br";
    let currentUrl = initialUrl;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            let redirectCount = 0;
            while (redirectCount <= maxRedirects) {
                const result = await new Promise((resolve, reject) => {
                    const urlObject = new node_url_1.URL(currentUrl);
                    const transport = urlObject.protocol === "https:" ? node_https_1.default : node_http_1.default;
                    const requestOptions = {
                        ...options,
                        hostname: urlObject.hostname,
                        port: urlObject.port || (urlObject.protocol === "https:" ? 443 : 80),
                        path: urlObject.pathname + urlObject.search,
                        headers: {
                            ...options.headers,
                            "Accept-Encoding": acceptEncoding,
                        },
                    };
                    delete requestOptions.returnHeaders;
                    delete requestOptions.headers["host"];
                    const req = transport.request(requestOptions, (res) => {
                        const { statusCode, headers } = res;
                        if (statusCode &&
                            (statusCode === 301 ||
                                statusCode === 302 ||
                                statusCode === 307 ||
                                statusCode === 308) &&
                            headers.location) {
                            req.destroy();
                            return resolve({ _redirect: headers.location });
                        }
                        if (statusCode && (statusCode < 200 || statusCode >= 300)) {
                            req.destroy();
                            return reject(new Error(`Server responded with status ${statusCode}`));
                        }
                        let stream = res;
                        const encodingHeader = res.headers["content-encoding"];
                        const encoding = Array.isArray(encodingHeader)
                            ? encodingHeader[0]
                            : encodingHeader;
                        const normalizedEncoding = typeof encoding === "string" ? encoding.toLowerCase() : undefined;
                        if (normalizedEncoding === "gzip") {
                            stream = res.pipe(node_zlib_1.default.createGunzip());
                        }
                        else if (normalizedEncoding === "deflate") {
                            stream = res.pipe(node_zlib_1.default.createInflate());
                        }
                        else if (normalizedEncoding === "br") {
                            stream = res.pipe(node_zlib_1.default.createBrotliDecompress());
                        }
                        else if (normalizedEncoding === "zstd") {
                            if (!supportsZstd) {
                                req.destroy();
                                return reject(new Error("Zstd is not supported by this Node.js runtime."));
                            }
                            stream = res.pipe(node_zlib_1.default.createZstdDecompress());
                        }
                        const chunks = [];
                        stream.on("data", (chunk) => chunks.push(chunk));
                        stream.on("error", (err) => reject(new Error(`Stream error: ${err.message}`)));
                        stream.on("end", () => {
                            const body = Buffer.concat(chunks);
                            const contentType = res.headers["content-type"] || "";
                            if (body.length === 0) {
                                if (contentType.includes("application/json")) {
                                    const emptyJson = {};
                                    return resolve(returnHeaders
                                        ? { data: emptyJson, headers: res.headers }
                                        : emptyJson);
                                }
                                const emptyText = "";
                                return resolve(returnHeaders
                                    ? { data: emptyText, headers: res.headers }
                                    : emptyText);
                            }
                            try {
                                if (contentType.includes("application/json")) {
                                    const parsedJson = JSON.parse(body.toString());
                                    return resolve(returnHeaders
                                        ? { data: parsedJson, headers: res.headers }
                                        : parsedJson);
                                }
                                const parsedText = body.toString();
                                return resolve(returnHeaders
                                    ? { data: parsedText, headers: res.headers }
                                    : parsedText);
                            }
                            catch (err) {
                                return reject(new Error(`Failed to parse response: ${err.message}`));
                            }
                        });
                    });
                    req.on("error", (err) => reject(new Error(`Request error: ${err.message}`)));
                    req.on("timeout", () => {
                        req.destroy();
                        reject(new Error("Request timed out"));
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
                if (typeof result === "object" &&
                    result !== null &&
                    result._redirect) {
                    const newLocation = result._redirect;
                    currentUrl = new node_url_1.URL(newLocation, currentUrl).href;
                    redirectCount++;
                    continue;
                }
                return result;
            }
            throw new Error("Too many redirects");
        }
        catch (error) {
            const is404 = error.message.includes('status 404');
            if (!is404) {
                console.error(`Attempt ${attempt + 1}/${retries + 1} failed for ${initialUrl}: ${error.message}`);
            }
            if (attempt < retries) {
                await delay(retryDelay * Math.pow(2, attempt));
                currentUrl = initialUrl;
            }
            else {
                return undefined;
            }
        }
    }
    return undefined;
}
async function makeStreamRequest(initialUrl, options, timeout = 100000) {
    return new Promise((resolve, reject) => {
        const urlObject = new node_url_1.URL(initialUrl);
        const transport = urlObject.protocol === "https:" ? node_https_1.default : node_http_1.default;
        const requestOptions = {
            ...options,
            hostname: urlObject.hostname,
            port: urlObject.port || (urlObject.protocol === "https:" ? 443 : 80),
            path: urlObject.pathname + urlObject.search,
        };
        delete requestOptions.headers?.["host"];
        const req = transport.request(requestOptions, (res) => {
            const statusCode = res.statusCode ?? 0;
            if (statusCode < 200 || statusCode >= 300) {
                const chunks = [];
                res.on("data", (chunk) => chunks.push(chunk));
                res.on("end", () => {
                    const body = Buffer.concat(chunks).toString();
                    reject(new Error(`Stream request failed (${statusCode}): ${body || "Unknown error"}`));
                });
                return;
            }
            resolve({
                stream: res,
                statusCode,
                headers: res.headers,
            });
        });
        req.on("error", (err) => reject(new Error(`Stream request error: ${err.message}`)));
        req.on("timeout", () => {
            req.destroy();
            reject(new Error("Stream request timed out"));
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
exports.nodeLinkSources = new Set([
    "admsearch",
    "amsearch",
    "audiomack",
    "bcsearch",
    "bilibili",
    "dzsearch",
    "flowery",
    "ftts",
    "gaanasearch",
    "gtts",
    "jssearch",
    "lfsearch",
    "mcsearch",
    "ncsearch",
    "nicovideo",
    "pdsearch",
    "shsearch",
    "speak",
    "spsearch",
    "szsearch",
    "tdsearch",
    "vksearch",
]);
exports.sources = {
    youtube: "ytsearch",
    youtubemusic: "ytmsearch",
    soundcloud: "scsearch",
    local: "local",
    admsearch: "admsearch",
    amsearch: "amsearch",
    audiomack: "audiomack",
    bcsearch: "bcsearch",
    bilibili: "bilibili",
    dzsearch: "dzsearch",
    flowery: "flowery",
    ftts: "ftts",
    gaanasearch: "gaanasearch",
    gtts: "gtts",
    jssearch: "jssearch",
    lfsearch: "lfsearch",
    mcsearch: "mcsearch",
    ncsearch: "ncsearch",
    nicovideo: "nicovideo",
    pdsearch: "pdsearch",
    shsearch: "shsearch",
    speak: "speak",
    spsearch: "spsearch",
    szsearch: "szsearch",
    tdsearch: "tdsearch",
    vksearch: "vksearch",
};
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
class EventEmitter {
    parent;
    listenerMap = {};
    constructor(parent) {
        this.parent = parent;
    }
    on(event, listener, options = {}) {
        const bucket = this.listenerMap[event] ?? new Set();
        this.listenerMap[event] = bucket;
        const entry = {
            listener,
            once: Boolean(options.once),
            priority: options.priority ?? 0,
        };
        bucket.add(entry);
        this.sortListeners(bucket);
        return () => this.off(event, listener);
    }
    once(event, listener, priority) {
        return this.on(event, listener, { once: true, priority });
    }
    off(event, listener) {
        const set = this.listenerMap[event];
        if (!set)
            return;
        for (const entry of set) {
            if (entry.listener === listener)
                set.delete(entry);
        }
        if (set.size === 0)
            delete this.listenerMap[event];
    }
    emit(event, ...args) {
        const set = this.listenerMap[event];
        if (!set)
            return;
        const removeAfter = [];
        for (const entry of [...set]) {
            try {
                entry.listener(...args);
            }
            catch (err) {
                if (event !== 'error' && this.listenerMap['error']) {
                    this.emit('error', err);
                }
                else {
                    throw err;
                }
            }
            if (entry.once)
                removeAfter.push(entry);
        }
        for (const rm of removeAfter)
            set.delete(rm);
        if (set.size === 0)
            delete this.listenerMap[event];
        if (this.parent)
            this.parent.emit(event, ...args);
    }
    removeAllListeners(event) {
        if (event)
            delete this.listenerMap[event];
        else
            Object.keys(this.listenerMap).forEach((key) => {
                delete this.listenerMap[key];
            });
    }
    listenerCount(event) {
        return this.listenerMap[event]?.size ?? 0;
    }
    createChild() {
        return new EventEmitter(this);
    }
    sortListeners(set) {
        const sorted = [...set].sort((a, b) => { return b.priority - a.priority; });
        set.clear();
        for (const entry of sorted)
            set.add(entry);
    }
}
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=Util.js.map