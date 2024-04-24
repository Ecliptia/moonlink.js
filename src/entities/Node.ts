import WebSocket from 'ws'; 
import { INodeStats, INode } from '../typings/Interfaces';
import { Structure, Rest } from '../../index';
export class Node {
    public host: string;
    public port: number;
    public identifier: string;
    public password: string
    public connected: boolean = false;
    public destroyed: boolean = false;
    public reconnectTimeout?: NodeJS.Timeout;
    public reconnectAttempts: number = 1;
    public retryAmount: number = 6;
    public retryDelay: number = 60000;
    public regions: String[];
    public secure: boolean;
    public sessionId: string;
    public socket: WebSocket;
    public stats?: INodeStats;
    public url: string;
    public rest: Rest;
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
        this.rest = new (Structure.get("Rest"))(this);
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
    public reconnect(): void {
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, this.retryDelay);
    }
    protected open(): void {
        if(this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this.connected = true;
    }
    protected close(code: number, reason?: string): void {
        if(this.connected) this.connected = false;

        this.socket.removeAllListeners();
        this.socket.close();
        if(this.retryAmount <= this.reconnectAttempts) this.reconnect();
        else {
            this.socket = null;
            this.destroyed = true;
        }
    }
    protected async message(data: Buffer): Promise<void> {
        if (Array.isArray(data)) data = Buffer.concat(data);
        else if (data instanceof ArrayBuffer) data = Buffer.from(data);

        let payload = JSON.parse(data.toString("utf8"));
        switch (payload.op) {
            case "ready":
                this.sessionId = payload.sessionId;
                break
            case "stats":
                delete payload.op;
                this.stats = payload as INodeStats;
                break;
            case "playerUpdate":
                break;
            case "event":

                break;
        }
    }
    protected error(): void {}
    public destroy(): void {
        this.socket.close();
        this.destroyed = true;
    }
}