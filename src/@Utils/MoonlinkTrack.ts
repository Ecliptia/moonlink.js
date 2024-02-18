import { MoonlinkTrackOptions } from "../@Typings";
export class MoonlinkTrack {
    public encoded: string | null;
    public identifier: string;
    public title: string;
    public author: string;
    public url: string;
    public duration: number;
    public position: number;
    public isSeekable: boolean;
    public isStream: boolean;
    public sourceName: string;
    public requester: any;
    public artworkUrl: string;
    public isrc: string;
    public time?: number = 0;
    constructor(data: MoonlinkTrackOptions, requester?: string | any) {
        this.encoded = data.encoded;
        this.title = data.info.title;
        this.author = data.info.author;
        this.url = data.info.uri;
        this.duration = data.info.length;
        this.position = data.info.position;
        this.identifier = data.info.identifier;
        this.isSeekable = Boolean(data.info.isSeekable);
        this.isStream = Boolean(data.info.isStream);
        this.sourceName = data.info.sourceName || null;
        this.requester = requester;
        this.artworkUrl = data.info.artworkUrl;
        this.isrc = data.info.isrc;
    }

    get calculateRealTimePosition(): number {
        if (this.position >= this.duration) {
            return this.duration;
        }

        if (this.time) {
            const elapsed = Date.now() - this.time;
            const calculatedPosition = this.position + elapsed / 1000;

            if (calculatedPosition >= this.duration) {
                return this.duration;
            }

            return calculatedPosition;
        }

        return this.position;
    }

    public setPosition(data: number): this {
        this.position = data;
        return this;
    }
    public setTime(data: number): this {
        this.time = data;
        return this
    }
}
