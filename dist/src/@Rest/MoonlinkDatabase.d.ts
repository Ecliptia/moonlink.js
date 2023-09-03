export declare class MoonlinkDatabase {
    private data;
    constructor();
    set(key: string, value: any): void;
    get(key: string): any;
    push(key: string, value: any): void;
    delete(key: string): boolean;
    private updateData;
    private fetch;
    private save;
}
