import { EventEmitter } from "node:events";
import { IDataManager } from "../typings/Interfaces";
export class Manager extends EventEmitter {
    constructor(data: IDataManager) {}
}
