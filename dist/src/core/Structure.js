"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Structure = void 0;
const index_1 = require("../../index");
const structures = {
    Node: index_1.Node,
    Rest: index_1.Rest,
    Player: index_1.Player,
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
        Structure.manager = manager;
    }
    static getManager() {
        return Structure.manager;
    }
}
exports.Structure = Structure;
//# sourceMappingURL=Structure.js.map