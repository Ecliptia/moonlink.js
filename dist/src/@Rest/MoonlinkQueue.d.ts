import { MoonlinkDatabase } from "./MoonlinkDatabase";
import { MoonlinkTrack } from "./MoonlinkTrack";
export declare class MoonlinkQueue {
    db: MoonlinkDatabase;
    guildId: string;
    private manager;
    constructor(manager: any, data: any);
    add(data: MoonlinkTrack): void;
    first(): any;
    clear(): boolean;
    get size(): BigInt;
    remove(position: number): boolean;
    get all(): any;
}
