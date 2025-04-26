import { Manager, ISource } from '../../index';
export default class Spotify implements ISource {
    name: string;
    private manager;
    private accessToken;
    private clientToken;
    private tokenInitialized;
    private static TOTP_SECRET;
    constructor(manager: Manager);
    match(url: string): boolean;
    private generateTotp;
    private initTokens;
    private apiRequest;
    private getLinkType;
    private buildTrack;
    private recommendations;
    search(query: string): Promise<any>;
    load(url: string): Promise<any>;
    resolve(url: string): Promise<any>;
}
