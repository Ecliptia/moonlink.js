import { EventEmitter } from "node:events";
import { Players, Nodes } from "../@Utils/Structure";
import { INodes, IOptions } from "../@Typings";

export class MoonlinkManager extends EventEmittir {
    public readonly _nodes: INodes[];
    public readonly _SPayload: Function;
    public readonly players: Players;
    public readonly nodes: Nodes;
    public readonly version: number = require("../../index").version;
    public options: IOptions;
    public initiated: boolean = false;

    constructor(nodes: INodes[], options: IOptions, SPayload: Function) {
        this._nodes = nodes;
        this._SPayload = SPayload;
        this.players = new Players(this);
        this.nodes = new Nodes(this);
        this.options = options;
    }
    public init(clientId?: number): this {
        if (this.initiated) return this;
        if (!clientId && this.options.clientId)
            throw new TypeError(
                '[ @Moonlink/Manager ]: "clientId" option is required.'
            );
        this.clientId = this.options.clientId;
        this.nodes.init();
        this.initated = true;
        return this;
    }
}
