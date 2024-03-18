export interface INode {
    host: string;
    id?: number;
    identifier?: string;
    port: number;
    password?: string;
    reconnectTimeout?: number;
    reconnectAmount?: number;
    secure?: boolean;
    sessionId?: string;
}
export interface IDataManager {
    nodes: INode[];
    options: IOptionsManager;
}
export interface IOptionsManager {
    clientame?: string;
    clientId?: string;
    defaultPlaformSearch?: string;
    plugins?: any;
    partialTrack?: any;
    sendPayload: Function;
}
