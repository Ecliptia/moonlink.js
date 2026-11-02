"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleReporter = void 0;
const LogFormatter_1 = require("./LogFormatter");
class ConsoleReporter {
    options;
    writePanel(content) {
        process.stdout.write(content + '\n');
    }
    constructor(options = {}) {
        this.options = options;
    }
    log(logObject) {
        const formatted = (0, LogFormatter_1.formatEntry)({
            type: logObject.type,
            tag: logObject.tag,
            date: logObject.date,
            args: logObject.args,
        }, this.options);
        const stream = logObject.level <= 1 ? process.stderr : process.stdout;
        stream.write(formatted + '\n');
    }
}
exports.ConsoleReporter = ConsoleReporter;
//# sourceMappingURL=ConsoleReporter.js.map