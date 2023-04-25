export declare class MoonlinkDatabase {
    data: object;
    constructor();
    set(key: string, value: any): any;
    get(key: string): any;
    push(key: string, value: any): any;
    delete(key: string): boolean;
    fetch(): void;
    save(): void;
}
