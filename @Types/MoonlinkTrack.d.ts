export declare class MoonTrack {
  position: number;
  title: string;
  author: string;
  url: string;
  identifier: string;
  duration: number;
  isSeekable: boolean;
  track: any;
  source: string | undefined;
  requester: any;
  thumbnail: string;

  constructor(data: { info: { position: number; title: string; author: string; uri: string; identifier: string; length: number; isSeekable: boolean; sourceName: string; }; track: any; }, request: any);
}


