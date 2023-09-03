import { MoonlinkDatabase } from "./MoonlinkDatabase";
import { MoonlinkManager } from "../@Moonlink/MoonlinkManager";
import { MoonlinkTrack } from "./MoonlinkTrack";
export declare class MoonlinkQueue {
    db: MoonlinkDatabase;
    private guildId;
    private manager;
    constructor(manager: MoonlinkManager, data: {
        guildId: string;
    });
    add(data: MoonlinkTrack, position?: number): void;
    first(): any;
    clear(): boolean;
    get size(): number;
    remove(position: number): boolean;
    get all(): any;
    private getQueue;
    private setQueue;
}
