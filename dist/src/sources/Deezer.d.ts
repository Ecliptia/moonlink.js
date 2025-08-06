import { Manager, ISource } from '../../index';
export default class Deezer implements ISource {
    name: string;
    private manager;
    private licenseToken;
    private checkForm;
    private cookie;
    constructor(manager: Manager);
    match(query: string): boolean;
    private init;
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
