"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
class HttpError extends Error {
    statusCode;
    body;
    retryable;
    constructor(statusCode, body) {
        super(`Server responded with status ${statusCode}`);
        this.statusCode = statusCode;
        this.body = body;
        this.name = 'HttpError';
        this.retryable = statusCode === 429 || statusCode >= 500;
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=HttpError.js.map