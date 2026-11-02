import type { ConsolaReporter, LogObject } from 'consola';
import { type FormatterOptions } from './LogFormatter';
export declare class ConsoleReporter implements ConsolaReporter {
    private readonly options;
    writePanel(content: string): void;
    constructor(options?: FormatterOptions);
    log(logObject: LogObject): void;
}
