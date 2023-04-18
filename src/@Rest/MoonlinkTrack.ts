export interface MoonlinkTrackOptionsInfo {
	identifier: string;
	isSeekable: boolean;
	author: string;
	isStream: boolean;
	length: number;
	position: number;
	title: string;
	uri?: string;
  thumbnail?: string | null;
	sourceName: string;
}
export interface MoonlinkTrackOptions {
  info: MoonlinkTrackOptionsInfo;
	track?: string;
	encoded?: string;
	trackEncoded: string;
}
export class MoonlinkTrack {
  public track: string | null;
	public encoded: string | null;
	public trackEncoded: string | null;
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
	constructor(data: MoonlinkTrackOptions) { 
    data.track ? this.track = data.track : data.encoded ? this.encoded = data.encoded : data.trackEncoded ? this.trackEncoded = data.trackEncoded : null;
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
  }
	get thumbnail(): string | null {
     if(this.sourceName === 'youtube') return `https://img.youtube.com/vi/${this.identifier}/sddefault.jpg`
	   return null;
	}
	setRequester(data: any) {  
     this.requester = data;
  }
}