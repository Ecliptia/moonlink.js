import { Manager } from "../core/Manager";

export abstract class Connector {
    public manager: Manager;

    public setManager(manager: Manager): void {
        this.manager = manager;
    }

    public abstract listen(client: any): void;
    public abstract send(guildId: string, payload: any): void;
}
