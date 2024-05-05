"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Structure = void 0;
const index_1 = require("../../index");
const structures = {
    PlayerManager: index_1.PlayerManager,
    NodeManager: index_1.NodeManager,
    Node: index_1.Node,
    Player: index_1.Player,
    Rest: index_1.Rest,
    Queue: index_1.Queue,
    Track: index_1.Track
};
class Structure {
    static manager;
    initialize(manager) {
        Structure.manager = manager;
    }
    static extend(name, extender) {
        const extended = extender(structures[name]);
        structures[name] = extended;
        return extended;
    }
    static get(name) {
        return structures[name];
    }
    static setManager(manager) {
        console.log(structures);
        Structure.manager = manager;
    }
    static getManager() {
        return Structure.manager;
    }
}
exports.Structure = Structure;
//# sourceMappingURL=Structure.js.map