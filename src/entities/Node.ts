export class Node {
    public host: string;
    public port: number;
    public password: string;
    public reconnectTimeout: number;
    public reconnectAmount: number;
    public regions: String[];
    public secure: boolean;
    public sessionId: string;
    public group: number;
    constructor(config) {
        this.host = config.host;
        this.port = config.port;
        this.password = config.password;
        this.reconnectTimeout = config.reconnectTimeout;
        this.reconnectAmount = config.reconnectAmount;
        this.regions = config.regions;
        this.secure = config.secure;
        this.sessionId = config.sessionId;
        this.group = config.group;
    }
}