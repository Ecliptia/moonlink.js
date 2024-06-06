import { Node } from "../../index";
import { IRESTOptions } from "../typings/Interfaces";
export declare class Rest {
    node: Node;
    url: string;
    defaultHeaders: Record<string, string>;
    constructor(node: Node);
    loadTracks(source: string, query: string): Promise<unknown>;
    update(data: IRESTOptions): Promise<unknown>;
}
