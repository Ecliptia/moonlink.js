"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocket = void 0;
const node_net_1 = __importDefault(require("node:net"));
const node_tls_1 = __importDefault(require("node:tls"));
const node_https_1 = __importDefault(require("node:https"));
const node_http_1 = __importDefault(require("node:http"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_events_1 = __importDefault(require("node:events"));
const node_url_1 = require("node:url");
function parsePacket(data) {
    let payloadStartIndex = 2;
    const opcode = data[0] & 0b00001111;
    if (opcode == 0x0)
        payloadStartIndex += 2;
    let payloadLength = data[1] & 0b01111111;
    if (payloadLength == 126) {
        payloadStartIndex += 2;
        payloadLength = data.readUInt16BE(2);
    }
    else if (payloadLength == 127) {
        payloadStartIndex += 8;
        payloadLength = Number(data.readBigUInt64BE(2));
    }
    return data.subarray(payloadStartIndex);
}
class WebSocket extends node_events_1.default {
    url;
    options;
    socket;
    constructor(url, options) {
        super();
        this.url = url;
        this.options = options;
        this.socket = null;
        this.connect();
        return this;
    }
    connect() {
        const parsedUrl = new node_url_1.URL(this.url);
        const isSecure = parsedUrl.protocol == "wss:";
        const agent = isSecure ? node_https_1.default : node_http_1.default;
        const key = node_crypto_1.default.randomBytes(16).toString("base64");
        const request = agent.request((isSecure ? "https://" : "http://") +
            parsedUrl.hostname +
            parsedUrl.pathname, {
            port: parsedUrl.port || (isSecure ? 443 : 80),
            timeout: 5000,
            createConnection: (options) => {
                if (isSecure) {
                    options.path = undefined;
                    if (!options.servername &&
                        options.servername !== "") {
                        options.servername = node_net_1.default.isIP(options.host)
                            ? ""
                            : options.host;
                    }
                    return node_tls_1.default.connect(options);
                }
                else {
                    options.path = options.socketPath;
                    return node_net_1.default.connect(options);
                }
            },
            headers: {
                "Sec-WebSocket-Key": key,
                "Sec-WebSocket-Version": 13,
                Upgrade: "websocket",
                Connection: "Upgrade",
                ...(this.options.headers || {}),
            },
            method: "GET",
        });
        request.on("error", (err) => {
            this.emit("error", err);
            this.emit("close");
        });
        request.on("upgrade", (res, socket, _head) => {
            this.emit("open");
            if (res.headers.upgrade &&
                res.headers.upgrade.toLowerCase() != "websocket") {
                socket.destroy();
                return;
            }
            const digest = node_crypto_1.default
                .createHash("sha1")
                .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
                .digest("base64");
            if (res.headers["sec-websocket-accept"] != digest) {
                socket.destroy();
                return;
            }
            socket.on("data", (data) => this.emit("message", parsePacket(data).toString()));
            socket.on("close", () => this.emit("close"));
            this.socket = socket;
        });
        request.end();
    }
    sendFrame(data, options) {
        if (!this.socket)
            return false;
        let startIndex = 2;
        if (options.len >= 65536) {
            startIndex += 8;
            options.len = 127;
        }
        else if (options.len > 125) {
            startIndex += 2;
            options.len = 126;
        }
        const header = Buffer.allocUnsafe(startIndex);
        header[0] = options.fin ? options.opcode | 0x80 : options.opcode;
        header[1] = options.len;
        if (options.len == 126) {
            header.writeUInt16BE(options.len, 2);
        }
        else if (options.len == 127) {
            header[2] = header[3] = 0;
            header.writeUIntBE(options.len, 4, 6);
        }
        if (!this.socket.write(Buffer.concat([header, data]))) {
            this.socket.end();
            return false;
        }
        return true;
    }
    close(code, reason) {
        const data = Buffer.allocUnsafe(2 + Buffer.byteLength(reason || "normal close"));
        data.writeUInt16BE(code || 1000);
        data.write(reason || "normal close", 2);
        this.sendFrame(data, { len: data.length, fin: true, opcode: 0x08 });
        return true;
    }
}
exports.WebSocket = WebSocket;
//# sourceMappingURL=PerforCWebsocket.js.map