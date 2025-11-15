import { ITrack } from "../typings/interfaces";

export class Track {
    public readonly encoded: string;
    public title: string;
    public author: string;
    public duration: number;
    public identifier: string;
    public isSeekable: boolean;
    public isStream: boolean;
    public uri: string | null;
    public artworkUrl: string | null;
    public isrc: string | null;
    public sourceName: string;
    public position: number;
    public time: number;
    public requester: any;
    public origin?: string;
    public pluginInfo: Record<string, any>;
    public userData: Record<string, any>;
    public retries: number = 0;

    constructor(data: ITrack, requester?: any, origin?: string) {
        this.encoded = data.encoded;
        this.title = data.info.title;
        this.author = data.info.author;
        this.duration = data.info.length;
        this.identifier = data.info.identifier;
        this.isSeekable = data.info.isSeekable;
        this.isStream = data.info.isStream;
        this.uri = data.info.uri;
        this.artworkUrl = data.info.artworkUrl || null;
        this.isrc = data.info.isrc || null;
        this.sourceName = data.info.sourceName;
        this.position = data.info.position || 0;
        this.time = 0;
        this.requester = requester;
        this.origin = origin;
        this.pluginInfo = data.pluginInfo || {};
        this.userData = data.userData || {};
    }

    public get thumbnail(): string | null {
        if (this.artworkUrl) return this.artworkUrl;
        if (this.sourceName === "youtube") {
            return `https://img.youtube.com/vi/${this.identifier}/mqdefault.jpg`;
        }
        return null;
    }

    public setRequester(requester: any): this {
        this.requester = requester;
        return this;
    }

    public setPosition(position: number): this {
        this.position = position;
        return this;
    }

    public toJSON(): ITrack {
        return {
            encoded: this.encoded,
            info: {
                title: this.title,
                author: this.author,
                length: this.duration,
                identifier: this.identifier,
                isSeekable: this.isSeekable,
                isStream: this.isStream,
                uri: this.uri,
                artworkUrl: this.artworkUrl,
                isrc: this.isrc,
                sourceName: this.sourceName,
                position: this.position,
            },
            pluginInfo: this.pluginInfo,
            userData: this.userData,
        };
    }
}
