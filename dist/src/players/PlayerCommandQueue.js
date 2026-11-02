"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerCommandQueue = void 0;
class PlayerCommandQueue {
    tail = Promise.resolve();
    enqueue(operation) {
        const result = this.tail.then(operation);
        this.tail = result.then(() => undefined, () => undefined);
        return result;
    }
}
exports.PlayerCommandQueue = PlayerCommandQueue;
//# sourceMappingURL=PlayerCommandQueue.js.map