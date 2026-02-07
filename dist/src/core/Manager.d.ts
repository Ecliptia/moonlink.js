import { IManagerEvents, IManagerConfig, IManagerOptionsConfig, ISearchQuery, ITrack, ITrackInfo } from "../typings/Interfaces";
import type { DiscordGatewayPacket } from "../typings/types";
import { EventEmitter } from "../Util";
import { PlayerManager } from "../managers/PlayerManager";
import { DatabaseManager } from "../managers/DatabaseManager";
import { Connector } from "../connectors/Connector";
export declare class Manager extends EventEmitter<IManagerEvents> {
    initialized: boolean;
    readonly options: IManagerOptionsConfig;
    send: (guildId: string, payload: any) => void;
    clientId: string;
    readonly nodes: any;
    readonly players: PlayerManager;
    database: DatabaseManager;
    private idleCheckInterval?;
    get readyNodes(): any;
    get hasReadyNodes(): any;
    constructor(config: IManagerConfig);
    use(connector: Connector, client: any): this;
    init(clientId: string): Promise<this>;
    private startIdleMonitoring;
    search(options: ISearchQuery): Promise<any>;
    packetUpdate(packet: DiscordGatewayPacket): Promise<void>;
    decodeTrack(encoded: string): ITrack;
    encodeTrack(track: ITrackInfo): string;
}
