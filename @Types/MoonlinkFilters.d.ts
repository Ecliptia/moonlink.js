
  export class MoonFilters {
    guildId: string;
    status: {
      nightcore: boolean,
      vaporweve: boolean,
      bassboost: boolean,
      pop: boolean,
      soft: boolean,
      treblebass: boolean,
      eightD: boolean,
      karaoke: boolean,
      vibrato: boolean,
      tremolo: boolean,
      custom: any
    };

    constructor(options: { guildId: string, sendWs: (json: any) => void });
    reset(): boolean;
    nightcore(): boolean;
    vaporwave(): boolean;
    bassboost(): boolean;
    pop(): boolean;
    soft(): boolean;
    treblebass(): boolean;
    eightD(): boolean;
    karaoke(): boolean;
    vibrato(): boolean;
    tremolo(): boolean;
    custom(json: any): boolean;
  }

