import { Manager } from "../core/Manager";
export declare abstract class Connector {
    manager: Manager;
    setManager(manager: Manager): void;
    abstract listen(client: any): void;
    abstract send(guildId: string, payload: any): void;
}
