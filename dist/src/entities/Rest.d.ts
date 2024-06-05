import { Node } from '../../index';
import { IRESTOptions } from '../typings/Interfaces';
export declare class Rest {
    node: Node;
    constructor(node: Node);
    loadTracks(source: string, query: string): Promise<unknown>;
    update(data: IRESTOptions): Promise<unknown>;
    makeRequest(endpoint: string, method: string, data?: any): Promise<unknown>;
}
