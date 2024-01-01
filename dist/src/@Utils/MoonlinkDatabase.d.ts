export declare class MoonlinkDatabase {
    private data;
    private id;
    constructor(clientId: string);
    set<T>(key: string, value: T): void;
    get<T>(key: string): T | undefined;
    push<T>(key: string, value: T): void;
    delete(key: string): boolean;
    private updateData;
    private getFilePath;
    private fetch;
    private save;
}
