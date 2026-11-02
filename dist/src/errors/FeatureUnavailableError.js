"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureUnavailableError = void 0;
class FeatureUnavailableError extends Error {
    feature;
    backend;
    statusCode;
    code = 'FEATURE_UNAVAILABLE';
    constructor(feature, backend, statusCode) {
        super(`NodeLink-only feature (${feature}) is unavailable on ${backend}${statusCode ? ` (HTTP ${statusCode})` : ''}.`);
        this.feature = feature;
        this.backend = backend;
        this.statusCode = statusCode;
        this.name = 'FeatureUnavailableError';
    }
}
exports.FeatureUnavailableError = FeatureUnavailableError;
//# sourceMappingURL=FeatureUnavailableError.js.map