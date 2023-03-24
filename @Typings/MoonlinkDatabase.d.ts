export = MoonlinkDB;
declare class MoonlinkDB {
    data: {};
    set(key: any, value: any): any;
    get(key: any): any;
    push(key: any, value: any): any;
    delete(key: any): void;
    fetch(): void;
    save(): void;
}
