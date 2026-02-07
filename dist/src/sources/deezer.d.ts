import { Manager } from "../core/Manager";
export declare class DeezerSource {
    name: string;
    private readonly manager;
    constructor(manager: Manager);
    private get options();
    match(query: string): boolean;
    private resolveShortLink;
    private apiRequest;
    search(query: string, options?: {
        limit?: number;
    }): Promise<any>;
    load(query: string, options?: {
        limit?: number;
    }): Promise<any>;
    private buildTrack;
    resolve(query: string): Promise<any>;
}
