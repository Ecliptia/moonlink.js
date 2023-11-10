export declare class MoonlinkDatabase {
    private data;
    private id;
    constructor(clientId: any);
    set(key: string, value: any): void;
    get(key: string): any;
    push(key: string, value: any): void;
    delete(key: string): boolean;
    private updateData;
    private getFilePath;
    private fetch;
    private save;
}
