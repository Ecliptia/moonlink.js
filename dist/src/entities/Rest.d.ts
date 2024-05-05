import { Node } from '../../index';
import { IRESTOptions } from '../typings/Interfaces';
export declare class Rest {
    node: Node;
    constructor(node: Node);
    update(data: IRESTOptions): Promise<unknown>;
    makeRequest(endpoint: string, method: string, data?: unknown): Promise<unknown>;
}
