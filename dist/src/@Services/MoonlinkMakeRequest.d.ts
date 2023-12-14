export type Headers = {
    Authorization?: string | null;
};
export declare function makeRequest(uri: string, options: any, data?: any): Promise<any>;
