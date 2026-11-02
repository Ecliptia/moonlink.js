import type { BackendAdapter } from './BackendAdapter';
export declare class BackendDetector {
    static detect(info: unknown, headers?: Record<string, unknown>, capabilities?: Set<string>): BackendAdapter | undefined;
}
