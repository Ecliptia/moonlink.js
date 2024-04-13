"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Structure = void 0;
const structures = {};
class Structure {
    manager;
    initialize(manager) {
        this.manager = manager;
    }
    static extend(name, extender) {
        const extended = extender(structures[name]);
        structures[name] = extended;
        return extended;
    }
    static get(name) {
        return structures[name];
    }
}
exports.Structure = Structure;
