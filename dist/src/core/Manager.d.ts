import { IManagerEvents, IManagerConfig, IManagerOptionsConfig, ISearchQuery } from "../typings/Interfaces";
import { EventEmitter } from "../Util";
import { PlayerManager } from "../managers/PlayerManager";
import { Connector } from "../connectors/Connector";
import { DatabaseManager } from "../managers/DatabaseManager";
export declare class Manager extends EventEmitter<IManagerEvents> {
    initialized: boolean;
    readonly options: IManagerOptionsConfig;
    send: (guildId: string, payload: any) => void;
    clientId: string;
    readonly nodes: any;
    readonly players: PlayerManager;
    readonly database: DatabaseManager;
    private idleCheckInterval?;
    constructor(config: IManagerConfig);
    use(connector: Connector, client: any): this;
    init(clientId: string): Promise<this>;
    private startIdleMonitoring;
    search(options: ISearchQuery): Promise<any>;
    packetUpdate(packet: any): Promise<void>;
}
