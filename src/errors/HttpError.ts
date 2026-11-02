/** Preserves v4 status/body: https://lavalink.dev/api/rest#error-responses */
export class HttpError extends Error {
    public readonly retryable: boolean;
    constructor(public readonly statusCode: number, public readonly body?: unknown) {
        super(`Server responded with status ${statusCode}`);
        this.name = 'HttpError';
        this.retryable = statusCode === 429 || statusCode >= 500;
    }
}
