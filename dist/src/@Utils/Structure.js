"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = exports.Structure = void 0;
const index_1 = require("../../index");
const structures = {
    MoonlinkManager: index_1.MoonlinkManager,
    MoonlinkRestFul: index_1.MoonlinkRestFul,
    MoonlinkPlayer: index_1.MoonlinkPlayer,
    MoonlinkFilters: index_1.MoonlinkFilters,
    MoonlinkDatabase: index_1.MoonlinkDatabase,
    MoonlinkQueue: index_1.MoonlinkQueue,
    MoonlinkNode: index_1.MoonlinkNode,
    MoonlinkTrack: index_1.MoonlinkTrack,
    PlayerManager: index_1.PlayerManager,
    NodeManager: index_1.NodeManager
};
class Structure {
    static manager;
    static db;
    static extend(name, extender) {
        if (!(name in structures)) {
            throw new TypeError(`"${name}" is not a valid structure`);
        }
        const extended = extender(structures[name]);
        structures[name] = extended;
        return extended;
    }
    static init(manager) {
        this.manager = manager;
        this.db = new (Structure.get("MoonlinkDatabase"))(manager.clientId);
        this.manager.emit("debug", `@Moonlink(Structure) - The main class and database are assigned to structure :)`);
    }
    static get(name) {
        const structure = structures[name];
        if (!structure) {
            throw new TypeError(`"${name}" structure must be provided.`);
        }
        return structure;
    }
}
exports.Structure = Structure;
class Plugin {
    load(manager) { }
}
exports.Plugin = Plugin;
