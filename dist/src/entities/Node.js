"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
class Node {
    host;
    port;
    password;
    reconnectTimeout;
    reconnectAmount;
    regions;
    secure;
    sessionId;
    url;
    constructor(config) {
        this.host = config.host;
        this.port = config.port;
        this.password = config.password;
        this.reconnectTimeout = config.reconnectTimeout;
        this.reconnectAmount = config.reconnectAmount;
        this.regions = config.regions;
        this.secure = config.secure;
        this.sessionId = config.sessionId;
        this.url = `${this.secure ? 'https' : 'http'}://${this.adress}`;
        this.connect();
    }
    get adress() {
        return `${this.host}:${this.port}`;
    }
    connect() {
    }
}
exports.Node = Node;
