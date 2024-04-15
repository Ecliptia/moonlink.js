import { EventEmitter } from "node:events";
import {
    IEvents,
    IConfigManager,
    IOptionsManager,
} from "../typings/Interfaces";
import { NodeManager } from "../../index";

export declare interface MoonlinkManager {
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
    public clientId: string;
    public readonly options: IOptionsManager;
    public readonly sendPayload: Function;
    public nodes: NodeManager;
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
}
