export declare class PlayerCommandQueue {
    private tail;
    enqueue<T>(operation: () => Promise<T>): Promise<T>;
}
