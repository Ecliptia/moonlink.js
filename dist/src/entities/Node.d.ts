export declare class Node {
    host: string;
    port: number;
    password: string;
    reconnectTimeout: number;
    reconnectAmount: number;
    regions: String[];
    secure: boolean;
    sessionId: string;
    group: number;
    constructor(config: any);
}
