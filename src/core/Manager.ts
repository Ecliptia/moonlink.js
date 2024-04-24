import { EventEmitter } from "node:events";
import {
    IEvents,
    IConfigManager,
    IOptionsManager,
} from "../typings/Interfaces";
import { NodeManager, PlayerManager, Structure } from "../../index";

export declare interface Manager {
    on<K extends keyof IEvents>(
        event: K,
        listener: IEvents[K]
    ): this;
    once<K extends keyof IEvents>(
        event: K,
        listener: IEvents[K]
    ): this;
    emit<K extends keyof IEvents>(
        event: K,
        ...args: Parameters<IEvents[K]>
    ): boolean;
    off<K extends keyof IEvents>(
        event: K,
        listener: IEvents[K]
    ): this;
} 

export class Manager extends EventEmitter {
    public initialize: boolean = false;
    public readonly options: IOptionsManager;
    public readonly sendPayload: Function;
    public nodes: NodeManager;
    public players: PlayerManager = new PlayerManager();
    public version: string = require("../../index").version;
    constructor(config: IConfigManager) {
        super();
        this.sendPayload = config?.sendPayload;
        this.options = {
            clientName: `Moonlink.js/${this.version} (https://github.com/Ecliptia/moonlink.js)`,
            defaultPlatformSearch: "youtube",
            ...config.options
        };

        this.nodes = new NodeManager(config.nodes);
    }
    public init(clientId: string): void {
        if (this.initialize) return;
        this.options.clientId = clientId;
        Structure.setManager(this);
        this.nodes.init();
        this.initialize = true;
    }
    public packetHandler(packet: any): void {
        if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t)) return;
        if (!packet.d.session_id && !packet.session_id) return;
        
        const player = this.players.get(packet.d.guild_id);
        
    }
    public attemptConnection(): void {

    }
}
