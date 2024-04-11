import { EventEmitter } from "node:events";
import {
    IConfigManager,
    IOptionsManager,
} from "../typings/Interfaces";
import { NodeManager } from "index";
export class Manager extends EventEmitter {
    public clientId: string;
    public options: IOptionsManager;
    public sendPayload: Function;
    public nodes: NodeManager;
    public version: string;
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
