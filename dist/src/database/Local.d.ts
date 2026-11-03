import type { Manager } from '../core/Manager';
import { Memory } from './Memory';
export declare class Local extends Memory {
    private snapshotPath;
    private logPath;
    private tail;
    private closing;
    private shutdownPromise?;
    private compactionTimer?;
    init(manager: Manager, options?: {
        path?: string;
    }): Promise<void>;
    private enqueue;
    set<T>(key: string, value: T, log?: boolean): Promise<void>;
    remove(key: string, log?: boolean): Promise<boolean>;
    clear(): Promise<void>;
    get<T>(key: string): Promise<T | undefined>;
    keys(pattern?: string): Promise<string[]>;
    has(key: string): Promise<boolean>;
    flush(): Promise<void>;
    private compact;
    shutdown(): Promise<void>;
}
