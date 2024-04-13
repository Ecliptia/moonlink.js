import WebSocket from 'ws'; 
import { INodeStats, INode } from '../typings/Interfaces';
import { Structure } from '../../index';
export class Node {
    public host: string;
    public port: number;
    public identifier: string;
    public password: string
    public connected: boolean;
    public reconnectTimeout?: NodeJS.Timeout;
    public reconnectAmount: number = 1;
    public retryAmount: number = 6;
    public retryDelay: number = 60000;
    public regions: String[];
    public secure: boolean;
    public sessionId: string;
    public socket: WebSocket;
    public stats: INodeStats;
    public url: string;
    constructor(config: INode) {
        this.host = config.host;
        this.port = config.port;
        this.identifier = config.identifier;
        this.password = config.password;
        this.regions = config.regions;
        this.retryDelay = config.retryDelay;
        this.retryAmount = config.retryAmount;
        this.secure = config.secure;
        this.sessionId = config.sessionId;
        this.url = `${this.secure ? 'https' : 'http'}://${this.address}/v4/`;

        this.connect();
    }
    public get address(): string {
        return `${this.host}:${this.port}`;
    }
    public connect(): void {
        let headers = {
            Authorization: this.password,
            "User-Id": Structure.manager.options.clientId,
            "Client-Name": Structure.manager.options.clientName
        };
        this.socket = new WebSocket(
            `ws${this.secure ? "s" : ""}://${this.address}/v4/websocket`,
            { headers }
        );
        this.socket.on("open", this.open.bind(this));
        this.socket.on("close", this.close.bind(this));
        this.socket.on("message", this.message.bind(this));
        this.socket.on("error", this.error.bind(this));
    }
    public open(): void {}
    public close(): void {}
    public message(): void {}
    public error(): void {}
}