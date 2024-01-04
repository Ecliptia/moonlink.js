/// <reference types="node" />
/// <reference types="node" />
import * as http from "http";
import * as https from "https";
export declare function makeRequest<T>(uri: string, options: http.RequestOptions | (https.RequestOptions & {
    method?: string;
}), data?: Record<string, any>): Promise<T>;
