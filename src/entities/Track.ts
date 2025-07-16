import { ITrack, ITrackInfo, IChapter } from "../typings/Interfaces";
import { Structure, decodeTrack } from "../Utils";
import { TPartialTrackProperties, YoutubeThumbnailQuality } from "../typings/types";

export class Track {
  public encoded: string;
  public url?: string;
  public author: string;
  public duration: number;
  public title: string;
  public position: number;
  public identifier?: string;
  public isSeekable: boolean;
  public isStream: boolean;
  public artworkUrl?: string;
  public isrc?: string;
  public time?: number = 0;
  public sourceName?: string;
  public origin?: string;
  public requestedBy?: Object | string;
  public pluginInfo: Record<string, any> = {};
  public chapters?: IChapter[] = [];
  public currentChapterIndex?: number = -1;
  private isPartial: boolean = false;

  constructor(trackData: ITrack, requester?: Object | string) {
    const manager = Structure.getManager();
    const partialTrackOptions = manager?.options?.partialTrack;

    this.encoded = trackData.encoded;
    this.title = trackData.info.title;
    this.author = trackData.info.author;
    this.pluginInfo = trackData.pluginInfo ?? {};

    const trackProps = this.createPropertySetters(trackData.info);

    if (partialTrackOptions && Array.isArray(partialTrackOptions) && partialTrackOptions.length > 0) {
      this.isPartial = true;
      partialTrackOptions.forEach(prop => {
        if (prop in trackProps) trackProps[prop]();
      });
    } else {
      Object.values(trackProps).forEach(setter => setter());
    }

    this.origin = trackData.origin;

    if (requester) this.requestedBy = typeof requester === 'string' ? { id: requester } : requester;

    Object.keys(this).forEach(key => {
      if (this[key] === undefined) {
        delete this[key];
      }
    });
  }

  private createPropertySetters(info: ITrackInfo): Record<TPartialTrackProperties, () => void> {
    return {
      url: () => info.uri && (this.url = info.uri),
      duration: () => info.length && (this.duration = info.length),
      position: () => info.position && (this.position = info.position),
      identifier: () => info.identifier && (this.identifier = info.identifier),
      isSeekable: () => (this.isSeekable = info.isSeekable),
      isStream: () => (this.isStream = info.isStream),
      artworkUrl: () => info.artworkUrl && (this.artworkUrl = info.artworkUrl),
      isrc: () => info.isrc && (this.isrc = info.isrc),
      sourceName: () => info.sourceName && (this.sourceName = info.sourceName)
    };
  }

  public setPosition(position: number): void {
    this.position = position;
  }

  public setTime(time: number): void {
    this.time = time;
  }

  public setChapters(chapters: IChapter[]): void {
    this.chapters = chapters;
  }

  public setRequester(requester: Object | string): void {
    this.requestedBy = typeof requester === 'string' ? { id: requester } : requester;
  }

  public async resolve(): Promise<boolean> {
    if (this.pluginInfo.MoonlinkInternal) {
      let track = await Structure.getManager().search({
        query: `${this.title} ${this.author}`,
        source: Structure.getManager().options.defaultPlatformSearch
      });
      if (track.loadType === "empty" || track.loadType === "error") return false;
      this.encoded = track.tracks[0].encoded;
      return track.tracks.length > 0;
    } else return false;
  }

  public resolveData(): Track {
    this.isPartial = false;
    const info = decodeTrack(this.encoded).info;
    Object.values(this.createPropertySetters(info)).forEach(setter => setter());
    return this;
  }

  public isPartialTrack(): boolean {
    return this.isPartial;
  }

  public raw(): ITrack {
    const track = decodeTrack(this.encoded);

    return track;
  }

  public getThumbnailUrl(quality: string = "default"): string | undefined {
    if (this.sourceName === "youtube" && this.identifier) {
      const validQualities: YoutubeThumbnailQuality[] = ["default", "hqdefault", "mqdefault", "sddefault", "maxresdefault"];
      const selectedQuality: YoutubeThumbnailQuality = validQualities.includes(quality as YoutubeThumbnailQuality) ? (quality as YoutubeThumbnailQuality) : "maxresdefault";
      return `https://img.youtube.com/vi/${this.identifier}/${selectedQuality}.jpg`;
    }
    return this.artworkUrl;
  }

  public static async unresolvedTrack(options: {
    title: string,
    author: string,
    duration?: number,
    source?: string
  }): Promise<Track> {
    const manager = Structure.getManager();
    if (!manager) throw new Error("Manager is not initialized");

    const search = await manager.search({
      query: `${options.title} ${options.author}`,
      source: options.source || manager.options.defaultPlatformSearch
    });

    if (search.tracks.length) {
      if (search.tracks.length === 1) return search.tracks[0];

      if (options.duration) {
        return search.tracks.reduce((prev, curr) =>
          Math.abs(curr.duration - options.duration) < Math.abs(prev.duration - options.duration) ? curr : prev
        );
      }

      return search.tracks[0];
    }

    return null;
  }
}