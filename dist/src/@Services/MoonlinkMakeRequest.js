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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRequest = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const http2 = __importStar(require("http2"));
function makeRequest(uri, options, data) {
    return new Promise(resolve => {
        const url = new URL(uri);
        if (!options.method) {
            options.method = "GET";
        }
        let requestModule;
        if (url.protocol === "https:") {
            requestModule = http2.auto === undefined ? https_1.default : http2;
        }
        else {
            requestModule = http_1.default;
        }
        const opts = {
            port: url.port ? url.port : url.protocol === "https:" ? 443 : 80,
            ...options
        };
        const req = requestModule.request(url, opts, async (res) => {
            const chunks = [];
            res.on("data", async (chunk) => {
                chunks.push(chunk);
            });
            res.on("end", async () => {
                try {
                    const responseData = Buffer.concat(chunks).toString();
                    resolve(JSON.parse(responseData));
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
    });
}
exports.makeRequest = makeRequest;
//# sourceMappingURL=MoonlinkMakeRequest.js.map