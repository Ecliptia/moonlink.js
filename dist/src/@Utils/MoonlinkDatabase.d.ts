type Data = Record<string, any>;
export declare class MoonlinkDatabase {
    data: Data;
    id: string;
    doNotSaveToFiles: boolean;
    constructor(clientId: string);
    set<T>(key: string, value: T): void;
    get<T>(key: string): T | undefined;
    push<T>(key: string, value: T): void;
    delete(key: string): boolean;
    private updateData;
    private getFilePath;
    fetch(): void;
    private save;
}
export {};
