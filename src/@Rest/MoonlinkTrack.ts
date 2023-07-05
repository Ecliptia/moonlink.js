export interface TrackInfo {
 identifier: string;
 isSeekable: boolean;
 author: string;
 isStream: boolean;
 length: number;
 position: number;
 title: string;
 uri?: string;
 artworkUrl?: string | null;
 sourceName: string;
 isrc?: string;
}
export interface MoonlinkTrackOptions {
 info: TrackInfo;
 encoded?: string;
 pluginInfo?: object;
}
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
 constructor(data: MoonlinkTrackOptions) {
  this.encoded = data.encoded
  this.title = data.info.title;
  this.author = data.info.author;
  this.url = data.info.uri;
  this.duration = data.info.length;
  this.position = data.info.position;
  this.identifier = data.info.identifier;
  this.isSeekable = Boolean(data.info.isSeekable);
  this.isStream = Boolean(data.info.isStream);
  this.requester = null;
  this.sourceName = data.info.sourceName || null;
	this.artworkUrl = data.info.artworkUrl;
	this.isrc = data.info.isrc;
 }
 setRequester(data: any) {
  this.requester = data;
 }
}
