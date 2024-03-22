export interface INode {
    group?: number;
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
    clientame?: string;
    clientId?: string;
    defaultPlaformSearch?: string;
    plugins?: any;
    partialTrack?: any;
}

export interface IVoicePacket {
    t?: "VOICE_SERVER_UPDATE" | "VOICE_STATE_UPDATE";
    d: VoiceState | VoiceServer;
}
