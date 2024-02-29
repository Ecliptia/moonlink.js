import { MoonlinkManager, MoonlinkNode, INode, SortType } from "../../index";
export declare class NodeManager {
    initiated: boolean;
    _manager: MoonlinkManager;
    map: Map<any, any>;
    constructor();
    init(): void;
    check(): void;
    add(node: INode): void;
    remove(name: string): boolean;
    get(name: any): any;
    sortByUsage(sortType: SortType): MoonlinkNode[];
    private sortNodesByMemoryUsage;
    private sortNodesByLavalinkCpuLoad;
    private sortNodesBySystemCpuLoad;
    private sortNodesByCalls;
    private sortNodesByPlayingPlayers;
    private sortNodesByPlayers;
}
