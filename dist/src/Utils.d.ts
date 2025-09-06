import http from "node:http";
import type { ITrack, ITrackInfo } from "./typings/Interfaces";
export declare const structures: Record<string, any>;
export declare const sources: {
    youtube: string;
    youtubemusic: string;
    soundcloud: string;
    local: string;
};
export declare abstract class Structure {
    static manager: any;
    static setManager(manager: any): void;
    static getManager(): any;
    static get(name: string): any;
    static extend(name: string, extender: any): void;
}
export declare function validateProperty<T>(prop: T | undefined, validator: (value: T) => boolean, errorMessage: string): void;
export declare function delay(ms: number): Promise<void>;
export declare function decodeTrack(encoded: string): ITrack;
export declare function encodeTrack(track: ITrackInfo): string;
export declare function generateUUID(host: string, port: number): string;
export declare function Log(message: string, LogPath: string): void;
export declare function makeRequest<T = any>(url: string, options: http.RequestOptions & {
    body?: any;
}, timeout?: number, retries?: number, retryDelay?: number): Promise<T | undefined>;
export declare function compareVersions(current: string, required: string): number;
export declare function stringifyWithReplacer(obj: any): string;
export declare class Plugin {
    name: string;
    version: string;
    description?: string;
    author?: string | Record<string, any>;
    minVersion?: string;
    load(manager: any): void;
    unload(manager: any): void;
}
export declare function isSourceBlacklisted(manager: any, sourceName: string): boolean;
export declare function isValidDiscordId(id: string): boolean;
