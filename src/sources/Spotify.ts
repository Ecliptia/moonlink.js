export default class Spotify {
    public name: string;
    constructor() {
        this.name = "Spotify";
    }
    public search(query: string, options: any) {
    }
    public load(url: string, options: any) {
    }
    public resolve(url: string, options: any) {
    }
    public isLinkMatch(url: string): boolean {
        return url.startsWith("spotify:") || url.startsWith("https://open.spotify.com/");
    }
}