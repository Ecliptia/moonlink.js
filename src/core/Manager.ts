import { EventEmitter } from "node:events";
import {
    IConfigManager,
    IOptionsManager,
} from "../typings/Interfaces";
export class Manager extends EventEmitter {
    public clientId: string;
    public options: IOptionsManager;
    public sendPayload: Function;
    public version: string;
    constructor(data: IConfigManager) {
        super();
        this.sendPayload = data?.sendPayload;
        this.options = {
            clientName: `Moonlink.js/${this.version} (https://github.com/Ecliptia/moonlink.js)`,
            defaultPlatformSearch: "youtube",
            ...data.options
        };
    }
}
