/** A rejected operation is reported to its caller without blocking later commands. */
export class PlayerCommandQueue {
    private tail: Promise<void> = Promise.resolve();

    public enqueue<T>(operation: () => Promise<T>): Promise<T> {
        const result = this.tail.then(operation);
        this.tail = result.then(() => undefined, () => undefined);
        return result;
    }
}
