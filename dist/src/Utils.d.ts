/// <reference types="node" />
import { Manager } from "../index";
export declare function validateProperty<T>(prop: T | undefined, validator: (value: T) => boolean, errorMessage: string): void;
export declare function makeRequest<T>(url: string, options: RequestInit): Promise<T>;
export declare const sources: {
    youtube: string;
    youtubemusic: string;
    soundcloud: string;
    local: string;
};
export declare class Plugin {
    name: string;
    load(manager: Manager): void;
    unload(manager: Manager): void;
}
