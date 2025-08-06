import { Manager, ISource } from '../../index';
export default class Spotify implements ISource {
    name: string;
    private manager;
    private accessToken;
    private clientId;
    private clientSecret;
    private tokenInitialized;
    constructor(manager: Manager);
    match(url: string): boolean;
    private initTokens;
    private apiRequest;
    private buildTrack;
    search(query: string, options?: {
        limit?: number;
    }): Promise<{
        loadType: string;
        data: any;
    }>;
    private recommendations;
    load(rawUrl: string, options?: {
        limit?: number;
    }): Promise<{
        loadType: string;
        data: any;
    }>;
    private getLinkType;
    resolve(url: string): Promise<{
        loadType: string;
        data: any;
    }>;
}
