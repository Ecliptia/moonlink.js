import { Plugin } from "../../index";
export interface INode {
    host: string;
    id?: number;
    identifier?: string;
    port: number;
    password?: string;
    reconnectTimeout?: number;
    reconnectAmount?: number;
    regions?: String[];
    secure?: boolean;
    sessionId?: string;
}
export interface IConfigManager {
    nodes: INode[];
    options: IOptionsManager;
    sendPayload: Function;
}
export interface IOptionsManager {
    clientName?: string;
    clientId?: string;
    defaultPlatformSearch?: string;
    plugins?: Plugin[];
    partialTrack?: any;
}
export interface IExtendable {
}
