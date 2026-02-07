import http from "node:http";
import type { ITrack, ITrackInfo } from "./typings/Interfaces";
export declare const structures: Record<string, any>;
export declare abstract class Structure {
    static manager: any;
    static setManager(manager: any): void;
    static getManager(): any;
    static get(name: string): any;
    static register(name: string, structure: any): void;
    static extend(name: string, extender: (baseClass: any) => any): void;
}
export declare function validate<T>(prop: T | undefined, validator: (value: T) => boolean, errorMessage: string): void;
export declare function delay(ms: number): Promise<void>;
export declare const NODELINK_URL = "https://github.com/PerformanC/NodeLink";
export declare function nodeLinkOnlyError(feature: string): Error;
export type NodeLinkResponse<T> = {
    loadType?: string;
    data: T;
};
export declare function normalizeNodeLinkResponse<T>(input: T | {
    loadType?: string;
    data?: T;
}, fallbackLoadType?: string): NodeLinkResponse<T>;
export declare function decodeTrack(encoded: string): ITrack;
export declare function encodeTrack(track: ITrackInfo): string;
export declare function generateUUID(host: string, port: number): string;
export declare function Log(message: string, LogPath: string): void;
export type ResponseWithHeaders<T> = {
    data: T;
    headers: http.IncomingHttpHeaders;
};
export declare function makeRequest<T = any>(initialUrl: string, options: http.RequestOptions & {
    body?: any;
    returnHeaders: true;
}, timeout?: number, retries?: number, retryDelay?: number, maxRedirects?: number): Promise<ResponseWithHeaders<T> | undefined>;
export declare function makeRequest<T = any>(initialUrl: string, options: http.RequestOptions & {
    body?: any;
    returnHeaders?: false;
}, timeout?: number, retries?: number, retryDelay?: number, maxRedirects?: number): Promise<T | undefined>;
export type StreamResponse = {
    stream: http.IncomingMessage;
    statusCode: number;
    headers: http.IncomingHttpHeaders;
};
export declare function makeStreamRequest(initialUrl: string, options: http.RequestOptions & {
    body?: any;
}, timeout?: number): Promise<StreamResponse>;
export declare function stringifyWithReplacer(obj: any): string;
export declare const nodeLinkSources: Set<string>;
export declare const sources: {
    youtube: string;
    youtubemusic: string;
    soundcloud: string;
    local: string;
    admsearch: string;
    amsearch: string;
    audiomack: string;
    bcsearch: string;
    bilibili: string;
    dzsearch: string;
    flowery: string;
    ftts: string;
    gaanasearch: string;
    gtts: string;
    jssearch: string;
    lfsearch: string;
    mcsearch: string;
    ncsearch: string;
    nicovideo: string;
    pdsearch: string;
    shsearch: string;
    speak: string;
    spsearch: string;
    szsearch: string;
    tdsearch: string;
    vksearch: string;
};
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
export declare class EventEmitter<E extends {
    [K in keyof E]: (...args: any[]) => void;
}> {
    private readonly parent?;
    private readonly listenerMap;
    constructor(parent?: EventEmitter<E>);
    on<K extends keyof E>(event: K, listener: E[K], options?: EmitterListenerOptions): () => void;
    once<K extends keyof E>(event: K, listener: E[K], priority?: number): () => void;
    off<K extends keyof E>(event: K, listener: E[K]): void;
    emit<K extends keyof E>(event: K, ...args: Parameters<E[K]>): void;
    removeAllListeners<K extends keyof E>(event?: K): void;
    listenerCount<K extends keyof E>(event: K): number;
    createChild(): EventEmitter<E>;
    private sortListeners;
}
interface EmitterListenerOptions {
    once?: boolean;
    priority?: number;
}
export {};
