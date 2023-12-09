import { INodes } from "../@Typings";
export class Players {
    public _manager: MoonlinkManager;
    public map: Map<any, any>;
    constructor(manager) {
        this.map = new Map();
        this.manager = manager;
    }
}
export class Nodes {
    public readonly initiated: boolean = false;
    public _manager: MoonlinkManager;
    public map: Map<any, any>;
    constructor(manager) {
        this.map = new Map();
        this.manager = manager;
    }
    public init(): void {
        this.check();
        this.initiated = true;
    }
    public check(): void {
        if (!this._manager?._nodes)
            throw new Error('[ @Moonlink/Manager ]: "nodes" option is empty');
        if (this._manager?._nodes && !Array.isArray(this._manager?._nodes))
            throw new Error(
                '[ @Moonlink/Manager ]: the "nodes" option has to be in an array'
            );
        if (this._manager?._nodes && this._manager?._nodes.length == 0)
            throw new Error(
                '[ @Moonlink/Manager ]: there are no parameters with "node(s)" information in the object'
            );
        this._manager?._nodes.forEach(node => this.add(node));
    }
    public add(node: INodes): INodes {
        this.map.set();
    }
}

const structures = {};
export abstract class Structure {
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

    public static get<K extends keyof Extendable>(name: K): Extendable[K] {
        const structure = structures[name];
        if (!structure) {
            throw new TypeError(`"${name}" structure must be provided.`);
        }
        return structure;
    }
}
