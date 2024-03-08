"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRequest = void 0;
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const http2 = __importStar(require("http2"));
const zlib = __importStar(require("zlib"));
const index_1 = require("../../index");
function makeRequest(uri, options, data) {
    return new Promise(resolve => {
        const url = new URL(uri);
        if (index_1.Structure.manager.options.http2 === true) {
            let client = http2.connect(url.origin, {
                protocol: url.protocol === "https:" ? "https:" : "http:",
                rejectUnauthorized: false
            });
            const reqOptions = {
                ":method": options.method,
                ":path": url.pathname + url.search,
                "User-Agent": "Moonlink(Bot)",
                "Content-Type": "application/json",
                ...(options.headers || {})
            };
            let chunks = "";
            const req = client.request(reqOptions);
            req.on("error", error => {
                index_1.Structure.manager.emit("debug", `@Moonlink(MakeRequest[HTTP/2]) - An error occurred when requesting the ${url}: ${error}`);
                client.close();
                resolve(error);
            });
            req.on("response", headers => {
                req.setEncoding("utf8");
                req.on("data", chunk => (chunks += chunk));
                req.on("end", () => {
                    client.close();
                    try {
                        const parsedData = JSON.parse(chunks);
                        resolve(parsedData);
                    }
                    catch (parseError) {
                        resolve(parseError);
                    }
                });
                req.on("error", error => {
                    index_1.Structure.manager.emit("debug", `@Moonlink(MakeRequest[HTTP/2]) - An error occurred when requesting the ${url}: ${error}`);
                    client.close();
                    resolve(error);
                });
            });
            data ? req.end(JSON.stringify(data)) : req.end();
        }
        else {
            let requestModule = http;
            if (url.protocol === "https:") {
                requestModule = https;
            }
            options.headers = {
                "Content-Type": "application/json",
                "Accept-Encoding": "br",
                ...(options.headers || {})
            };
            const reqOptions = {
                host: url.hostname,
                port: url.port
                    ? parseInt(url.port)
                    : url.protocol === "https:"
                        ? 443
                        : 80,
                path: url.pathname + url.search,
                method: options.method || "GET",
                ...options
            };
            const req = requestModule.request(url, reqOptions, async (res) => {
                let newStream = res;
                if (res.headers["content-encoding"] === "br") {
                    newStream = res.pipe(zlib.createBrotliDecompress());
                }
                const chunks = [];
                newStream.on("data", async (chunk) => {
                    chunks.push(chunk);
                });
                newStream.on("end", async () => {
                    try {
                        const responseData = Buffer.concat(chunks).toString();
                        if (reqOptions.path == "/version")
                            resolve(responseData);
                        const parsedData = JSON.parse(responseData);
                        resolve(parsedData);
                    }
                    catch (err) {
                        resolve(err);
                    }
                });
                res.on("error", (err) => {
                    resolve(err);
                });
            });
            if (data) {
                req.write(JSON.stringify(data));
            }
            req.end();
        }
    });
}
exports.makeRequest = makeRequest;
