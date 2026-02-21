import { ITrack, ITrackInfo } from "../typings/Interfaces";
import { Structure } from "../Util";
import { TPartialTrackProperties } from "../typings/types";

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
    private isPartial: boolean = false;

    constructor(data: ITrack | Record<string, any>, requester?: any, origin?: string) {
        const manager = Structure.getManager();
        const partialTrackOptions = manager?.options?.trackPartial;
        const normalized = this.normalizeTrackData(data);

        this.encoded = normalized.encoded;
        this.requester = requester || normalized.userData?.requester;
        this.origin = origin;
        this.pluginInfo = normalized.pluginInfo ?? {};
        this.userData = normalized.userData ?? {};

        const trackProps = this.createPropertySetters(normalized.info);

        if (partialTrackOptions && Array.isArray(partialTrackOptions) && partialTrackOptions.length > 0) {
            this.isPartial = true;
            trackProps.title();
            trackProps.author();
            
            partialTrackOptions.forEach(prop => {
                if (prop in trackProps) {
                    trackProps[prop as keyof typeof trackProps]();
                }
            });
        } else {
            Object.values(trackProps).forEach(setter => setter());
        }

        if (this.requester) {
            if (!this.userData) this.userData = {};
            this.userData.requester = this.requester;
        }

        Object.keys(this).forEach(key => {
            if (this[key as keyof this] === undefined) {
                delete this[key as keyof this];
            }
        });
    }

    private normalizeTrackData(data: ITrack | Record<string, any>): ITrack {
        if (data && typeof data === "object" && "info" in data && data.info) {
            const withInfo = data as ITrack;
            return {
                encoded: withInfo.encoded,
                info: withInfo.info,
                pluginInfo: withInfo.pluginInfo ?? {},
                userData: withInfo.userData ?? {},
            };
        }

        const flat = data as Record<string, any>;
        return {
            encoded: flat.encoded,
            info: {
                title: flat.title,
                author: flat.author,
                length: flat.duration ?? flat.length,
                identifier: flat.identifier,
                isSeekable: flat.isSeekable,
                isStream: flat.isStream,
                uri: flat.uri ?? null,
                artworkUrl: flat.artworkUrl ?? null,
                isrc: flat.isrc ?? null,
                sourceName: flat.sourceName,
                position: flat.position ?? 0,
            },
            pluginInfo: flat.pluginInfo ?? {},
            userData: flat.userData ?? {},
        };
    }

    private createPropertySetters(info: ITrackInfo): Record<string, () => void> {
        return {
            title: () => (this.title = info.title),
            author: () => (this.author = info.author),
            duration: () => (this.duration = info.length),
            identifier: () => (this.identifier = info.identifier),
            isSeekable: () => (this.isSeekable = info.isSeekable),
            isStream: () => (this.isStream = info.isStream),
            uri: () => (this.uri = info.uri),
            artworkUrl: () => (this.artworkUrl = info.artworkUrl || null),
            isrc: () => (this.isrc = info.isrc || null),
            sourceName: () => (this.sourceName = info.sourceName),
            position: () => (this.position = info.position || 0),
            time: () => (this.time = 0)
        };
    }

    public isPartialTrack(): boolean {
        return this.isPartial;
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
        if (this.requester) {
            if(!this.userData) this.userData = {};
            this.userData.requester = this.requester;
        }
        return this;
    }

    public setPosition(position: number): this {
        this.position = position;
        return this;
    }

    public clone(): Track {
        const newTrack = new (Structure.get("Track"))(this.toJSON(), this.requester, this.origin);
        newTrack.userData = JSON.parse(JSON.stringify(this.userData));
        return newTrack;
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
