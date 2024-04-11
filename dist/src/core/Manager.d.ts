/// <reference types="node" />
import { EventEmitter } from "node:events";
import { IConfigManager, IOptionsManager } from "../typings/Interfaces";
export declare class Manager extends EventEmitter {
    clientId: string;
    options: IOptionsManager;
    sendPayload: Function;
    version: string;
    constructor(data: IConfigManager);
}
