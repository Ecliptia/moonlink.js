export declare class FeatureUnavailableError extends Error {
    readonly feature: string;
    readonly backend: string;
    readonly statusCode?: number;
    readonly code = "FEATURE_UNAVAILABLE";
    constructor(feature: string, backend: string, statusCode?: number);
}
