export default class Spotify {
    name: string;
    constructor();
    search(query: string, options: any): void;
    load(url: string, options: any): void;
    resolve(url: string, options: any): void;
    isLinkMatch(url: string): boolean;
}
