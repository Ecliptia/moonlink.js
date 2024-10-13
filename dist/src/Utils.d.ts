import { Manager, Extendable } from "../index";
export declare function validateProperty<T>(prop: T | undefined, validator: (value: T) => boolean, errorMessage: string): void;
export declare function makeRequest<T>(url: string, options: RequestInit): Promise<T>;
export declare const sources: {
    youtube: string;
    youtubemusic: string;
    soundcloud: string;
    local: string;
};
export declare const structures: Extendable;
export declare abstract class Structure {
    static manager: Manager;
    static setManager(manager: Manager): void;
    static getManager(): Manager;
    static get<K extends keyof Extendable>(name: K): Extendable[K];
    static extend<K extends keyof Extendable>(name: K, extender: Extendable[K]): void;
}
export declare class Plugin {
    name: string;
    load(manager: Manager): void;
    unload(manager: Manager): void;
}
