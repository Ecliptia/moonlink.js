export class MoonFilters {
    constructor(options: any);
    guildId: any;
    status: any;
    reset(): boolean;
    nightcore(): void;
    vaporwave(): boolean;
    bassboost(): boolean;
    pop(): boolean;
    soft(): boolean;
    treblebass(): boolean;
    eightD(): boolean;
    karaoke(): boolean;
    vibrato(): boolean;
    tremolo(): boolean;
    custom(e: any): boolean;
    sendWs(code: any): void;
    #private;
}
