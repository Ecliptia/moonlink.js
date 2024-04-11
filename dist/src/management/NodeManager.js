"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeManager = void 0;
const index_1 = require("../../index");
class NodeManager {
    nodes = new Map();
    constructor(nodes) {
        this.addNodes(nodes);
    }
    check(nodes) { }
    addNodes(nodes) {
        nodes?.forEach(async (node) => {
            await this.check(node);
            this.nodes.set(node.id ?? node.identifier ?? node.host, new index_1.Node(node));
        });
    }
}
exports.NodeManager = NodeManager;
