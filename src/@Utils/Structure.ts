import { INode, Extendable, SortType, createOptions } from "../@Typings";

import {
    MoonlinkManager,
    MoonlinkRestFul,
    MoonlinkPlayer,
    MoonlinkFilters,
    MoonlinkDatabase,
    MoonlinkQueue,
    MoonlinkNode,
    MoonlinkTrack,
    PlayerManager,
    NodeManager
} from "../../index";

const structures: Extendable = {
    MoonlinkManager,
    MoonlinkRestFul,
    MoonlinkPlayer,
    MoonlinkFilters,
    MoonlinkDatabase,
    MoonlinkQueue,
    MoonlinkNode,
    MoonlinkTrack,
    PlayerManager,
    NodeManager
};

export abstract class Structure {
    public static manager: MoonlinkManager;
    public static db: MoonlinkDatabase;
    public static extend<K extends keyof Extendable, T extends Extendable[K]>(
        name: K,
        extender: (target: Extendable[K]) => T
    ): T {
        if (!(name in structures)) {
            throw new TypeError(`"${name}" is not a valid structure`);
        }

        const extended = extender(structures[name]);
        structures[name] = extended;
        return extended;
    }

    public static init(manager: MoonlinkManager): void {
        this.manager = manager;
        this.db = new (Structure.get("MoonlinkDatabase"))(manager.clientId);
        this.manager.emit(
            "debug",
            `@Moonlink(Structure) - The main class and database are assigned to structure :)`
        );
    }

    public static get<K extends keyof Extendable>(name: K): Extendable[K] {
        const structure = structures[name];
        if (!structure) {
            throw new TypeError(`"${name}" structure must be provided.`);
        }
        return structure;
    }
}

export class Plugin {
    public load(manager: MoonlinkManager): void {}
    public unload(manager: MoonlinkManager): void {}
}
