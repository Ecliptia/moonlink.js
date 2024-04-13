export declare class Node {
    host: string;
    port: number;
    password: string;
    reconnectTimeout: number;
    reconnectAmount: number;
    regions: String[];
    secure: boolean;
    sessionId: string;
    url: string;
    constructor(config: any);
    get adress(): string;
    connect(): void;
}
