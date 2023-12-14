import { INodeStats, INode, IHeaders } from "../@Typings";
import {
    MoonlinkManager,
    MoonlinkRestFul,
    Structure,
    WebSocket
} from "../../index";

export class MoonlinkNode {
    private _manager: MoonlinkManager;
    private reconnectTimeout?: NodeJS.Timeout;
    private reconnectAttempts: number = 1;
    private retryAmount: number;
    private retryDelay: number;

    public host: string;
    public identifier?: string;
    public password: string;
    public port: number | null;
    public secure: boolean;
    public http: string;
    public rest: MoonlinkRestFul;
    public connected: boolean;
    public resume?: boolean;
    public resumed?: boolean;
    public sessionId: string;
    public socket: WebSocket | null;
    public stats: INodeStats;
    public calls: number;

    constructor(node: INode) {
        this.check(node);

        this._manager = Structure.manager;
        this.host = node.host;
        this.identifier = node.identifier || null;
        this.password = node.password || "youshallnotpass";
        this.port = node.port
            ? node.port
            : node.secure
            ? node.secure == true
                ? 443
                : 80
            : null;
        this.secure = node.secure || false;
        this.http = `http${node.secure ? "s" : ""}://${this.address}/v4/`;

        this.stats = {
            players: 0,
            playingPlayers: 0,
            uptime: 0,
            memory: {
                free: 0,
                used: 0,
                allocated: 0,
                reservable: 0
            },
            cpu: {
                cores: 0,
                systemLoad: 0,
                lavalinkLoad: 0
            },
            frameStats: {
                sent: 0,
                nulled: 0,
                deficit: 0
            }
        };
        this.rest = new MoonlinkRestFul(this);
    }
    public init(): void {
        this.connect();
    }
    public get address(): string {
        return `${this.host}:${this.port}`;
    }
    public check(node: INode): void | never {
        if (typeof node.host !== "string" && typeof node.host !== "undefined")
            throw new Error(
                '[ @Moonlink/Node ]: "host" option is not configured correctly'
            );
        if (
            typeof node.password !== "string" &&
            typeof node.password !== "undefined"
        )
            throw new Error(
                '[ @Moonlink/Node ]: the option "password" is not set correctly'
            );
        if (
            (node.port && typeof node.port !== "number") ||
            node.port > 65535 ||
            node.port < 0
        )
            throw new Error(
                '[ @Moonlink/Node ]: the "port" option is not set correctly'
            );
        if (
            typeof node.retryAmount !== "undefined" &&
            typeof node.retryAmount !== "number"
        )
            throw new Error(
                '[ @Moonlink/Node ]: the "retryAmount" option is not set correctly'
            );

        if (
            typeof node.retryDelay !== "undefined" &&
            typeof node.retryDelay !== "number"
        )
            throw new Error(
                '[ @Moonlink/Node ]: the "retryDelay" option is not set correctly'
            );
    }

    public request(endpoint: string, params: any): Promise<object> {
        this.calls++;
        return this.rest.get(`${endpoint}?${params}`);
    }

    public async connect(): Promise<any> {
        if (this.connected) return;
        let headers: IHeaders = {
            Authorization: this.password,
            "User-Id": this._manager.options.clientId,
            "Client-Name": this._manager.options.clientName
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
    public open(): void {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this.connected = true;
    }
    private reconnect(): void {
        if (this.reconnectAttempts >= this.retryAmount) {
            this.socket.close(1000, "destroy");
            this.socket.removeAllListeners();
        } else {
            this.reconnectTimeout = setTimeout(() => {
                this.socket.removeAllListeners();
                this.socket = null;
                this.connected = false;
                this.connect();
                this.reconnectAttempts++;
            }, this.retryDelay);
        }
    }
    protected close(code: number, reason: any): void {
        if (code !== 1000 || reason !== "destroy") this.reconnect();
        this.connected = false;
    }
}
