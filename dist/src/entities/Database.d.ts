import { Manager } from "../../index";
export declare class Database {
    private disabled;
    private data;
    private id;
    constructor(manager: Manager);
    set<T>(key: string, value: T): void;
    get<T>(key: string): T | undefined;
    push<T>(key: string, value: T): void;
    delete(key: string): boolean;
    private modifyData;
    private loadData;
    private saveData;
    private getFilePath;
}
