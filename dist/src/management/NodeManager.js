"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeManager = void 0;
const index_1 = require("../../index");
const Utils_1 = require("src/Utils");
class NodeManager {
    cache = new Map();
    constructor(nodes) {
        this.addNodes(nodes);
    }
    check(node) {
        (0, Utils_1.validateProperty)(node.host, (value) => !!value, '(Moonlink.js) - Node > Host is required');
        (0, Utils_1.validateProperty)(node.port, (value) => value === undefined || (value >= 0 && value <= 65535), '(Moonlink.js) - Node > Invalid port value. Port must be a number between 0 and 65535.');
        (0, Utils_1.validateProperty)(node.password, (value) => value === undefined || typeof value === 'string', '(Moonlink.js) - Node > Invalid password value. Password must be a string.');
        (0, Utils_1.validateProperty)(node.secure, (value) => value === undefined || typeof value === 'boolean', '(Moonlink.js) - Node > Invalid secure value. Secure must be a boolean.');
        (0, Utils_1.validateProperty)(node.sessionId, (value) => value === undefined || typeof value === 'string', '(Moonlink.js) - Node > Invalid sessionId value. SessionId must be a string.');
        (0, Utils_1.validateProperty)(node.id, (value) => value === undefined || typeof value === 'number', '(Moonlink.js) - Node > Invalid id value. Id must be a number.');
        (0, Utils_1.validateProperty)(node.identifier, (value) => value === undefined || typeof value === 'string', '(Moonlink.js) - Node > Invalid identifier value. Identifier must be a string.');
        (0, Utils_1.validateProperty)(node.regions, (value) => value === undefined || Array.isArray(value), '(Moonlink.js) - Node > Invalid regions value. Regions must be an array.');
        (0, Utils_1.validateProperty)(node.reconnectTimeout, (value) => value === undefined || value >= 0, '(Moonlink.js) - Node > Invalid reconnectTimeout value. ReconnectTimeout must be a number greater than or equal to 0.');
        (0, Utils_1.validateProperty)(node.reconnectAmount, (value) => value === undefined || value >= 0, '(Moonlink.js) - Node > Invalid reconnectAmount value. ReconnectAmount must be a number greater than or equal to 0.');
    }
    addNodes(nodes) {
        nodes?.forEach(node => {
            this.check(node);
            this.cache.set(node.id ?? node.identifier ?? node.host, new index_1.Node(node));
        });
    }
}
exports.NodeManager = NodeManager;
