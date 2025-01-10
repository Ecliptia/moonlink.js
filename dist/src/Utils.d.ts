import { Manager, Extendable, ITrack, ITrackInfo } from "../index";
export declare function validateProperty<T>(prop: T | undefined, validator: (value: T) => boolean, errorMessage: string): void;
export declare function delay(ms: number): Promise<void>;
export declare function decodeTrack(encoded: string): ITrack;
export declare function encodeTrack(track: ITrackInfo): string;
export declare function generateShortUUID(host: string, port: number, identifier?: string): string;
export declare function Log(message: string, LogPath: string): void;
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
