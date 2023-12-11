import { EventEmitter } from "node:events";
import { Structure } from "../../index";
import { Players, Nodes } from "../@Utils/Structure";
import { INode, IOptions } from "../@Typings";

export class MoonlinkManager extends EventEmittir {
    public readonly _nodes: INode[];
    public readonly _SPayload: Function;
    public readonly players: Players;
    public readonly nodes: Nodes;
    public readonly version: number = require("../../index").version;
    public options: IOptions;
    public initiated: boolean = false;

    constructor(nodes: INode[], options: IOptions, SPayload: Function) {
        super();
        this._nodes = nodes;
        this._SPayload = SPayload;
        this.players = new Structure.get("Players");
        this.nodes = new Structure.get("Nodes");
        this.options = options;
    }
    public init(clientId?: number): this {
        if (this.initiated) return this;
        if (!clientId && !this.options.clientId)
            throw new TypeError(
                '[ @Moonlink/Manager ]: "clientId" option is required.'
            );
        this.clientId = this.options.clientId;
        Structure.init(this);
        this.nodes.init();
        this.players.init();
        this.initated = true;
        return this;
    }
}
