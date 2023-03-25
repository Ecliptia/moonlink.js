export class MoonlinkManager extends EventEmitter {
    static "__#4@#attemptConnection"(Manager: any, guildId: any, map: any): boolean;
    constructor(lavalinks: any, options: any, sPayload: any);
    _nodes: any;
    _sPayload: any;
    options: any;
    version: any;
    nodes: Map<any, any>;
    spotify: Spotify;
    init(clientId: any): void;
    clientId: any;
    addNodes(node_object: any): MoonlinkNodes;
    get leastUsedNodes(): any;
    packetUpdate(packet: any): boolean;
    search(...options: any[]): Promise<any>;
    get players(): {
        get: any;
        create: any;
        all: any;
        has: any;
        edit: any;
    };
    #private;
}
import { EventEmitter } from "events";
import Spotify = require("../@sources/Spotify.js");
import { MoonlinkNodes } from "./MoonlinkNodes.js";
