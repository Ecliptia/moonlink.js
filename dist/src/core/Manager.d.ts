/// <reference types="node" />
import { EventEmitter } from "node:events";
import { IConfigManager, IOptionsManager } from "../typings/Interfaces";
import { NodeManager } from "index";
export declare class Manager extends EventEmitter {
    clientId: string;
    options: IOptionsManager;
    sendPayload: Function;
    nodes: NodeManager;
    version: string;
    constructor(config: IConfigManager);
}
