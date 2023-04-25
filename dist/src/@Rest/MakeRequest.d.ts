export type headers = {
    Authorization?: string | null;
    "Content-Type"?: string | null;
    "User-Agent"?: string | null;
};
export interface options {
    method?: string;
    headers?: headers;
}
export declare function makeRequest(uri: string, options: options, data?: any): Promise<unknown>;
