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
    group;
    constructor(config) {
        this.host = config.host;
        this.port = config.port;
        this.password = config.password;
        this.reconnectTimeout = config.reconnectTimeout;
        this.reconnectAmount = config.reconnectAmount;
        this.regions = config.regions;
        this.secure = config.secure;
        this.sessionId = config.sessionId;
        this.group = config.group;
    }
}
exports.Node = Node;
