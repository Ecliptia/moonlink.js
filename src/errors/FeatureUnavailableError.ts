export class FeatureUnavailableError extends Error {
    public readonly code = 'FEATURE_UNAVAILABLE';
    constructor(public readonly feature: string, public readonly backend: string, public readonly statusCode?: number) {
        super(`NodeLink-only feature (${feature}) is unavailable on ${backend}${statusCode ? ` (HTTP ${statusCode})` : ''}.`);
        this.name = 'FeatureUnavailableError';
    }
}
