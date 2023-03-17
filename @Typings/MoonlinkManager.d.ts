export class MoonlinkManager extends EventEmitter {
    static "__#5@#attemptConnection"(Manager: any, guildId: any): boolean;
    constructor(lavalinks: any, options: any, sPayload: any);
    version: any;
    spotify: Spotify;
    init(clientId: any): void;
    nodes: Nodes;
    sendWs: (json: any) => void;
    clientId: any;
    updateVoiceState(packet: any): boolean;
    request(node: any, endpoint: any, params: any): Promise<any>;
    search(...options: any[]): Promise<any>;
    get players(): {
        get: (guild: any) => import("../@Moonlink/MoonlinkPlayer.js").MoonPlayer;
        create: (t: any) => import("../@Moonlink/MoonlinkPlayer.js").MoonPlayer;
        all: () => any;
        has: (guild: any) => any;
        edit: (info: any) => import("../@Moonlink/MoonlinkPlayer.js").MoonPlayer;
    };
    #private;
}
import { EventEmitter } from "events";
import Spotify = require("../@sources/Spotify.js");
import Nodes = require("./MoonlinkNodes.js");
