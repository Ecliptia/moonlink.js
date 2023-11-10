import { MoonlinkDatabase, MoonlinkManager, MoonlinkTrack } from "../../index";
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
