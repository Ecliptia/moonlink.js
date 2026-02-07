import { Manager } from "../core/Manager";
export declare class SpotifySource {
    name: string;
    private readonly manager;
    private accessToken;
    private accessTokenExpiresAt;
    private tokenInitialized;
    constructor(manager: Manager);
    private get options();
    match(query: string): boolean;
    private isTokenValid;
    private setAccessToken;
    private getActiveToken;
    private fetchOfficialToken;
    private ensureTokens;
    private apiRequest;
    private buildTrack;
    search(query: string, options?: {
        limit?: number;
    }): Promise<{
        loadType: string;
        data: any;
    }>;
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
