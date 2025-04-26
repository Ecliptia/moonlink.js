export default class Spotify {
    name: string;
    constructor();
    search(query: string, options: any): Promise<any>;
    load(url: string, options: any): Promise<any>;
    resolve(url: string, options: any): Promise<any>;
}
