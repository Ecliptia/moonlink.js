import { EventEmitter } from "node:events";
import {
    IConfigManager,
    IOptionsManager,
    IPacketVoice
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
            defaultPlataformSearch: "youtube",
            ...data.options
        };
    }
    public packetUpdate(data: IPacketVoice): void {
        if (!["VOICE_SERVER_UPDATE", "VOICE_STATE_UPDATE"].includes(data?.t))
            return;
    }
}
