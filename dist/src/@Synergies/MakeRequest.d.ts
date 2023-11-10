export type headers = {
    Authorization?: string | null;
    "Content-Type"?: string | null;
    "User-Agent"?: string | null;
};
export declare function makeRequest(uri: string, options: any, data?: any): Promise<any>;
