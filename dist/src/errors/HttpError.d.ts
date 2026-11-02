export declare class HttpError extends Error {
    readonly statusCode: number;
    readonly body?: unknown;
    readonly retryable: boolean;
    constructor(statusCode: number, body?: unknown);
}
