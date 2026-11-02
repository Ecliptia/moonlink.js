import type { ConsolaReporter, LogObject } from 'consola';
import { formatEntry, type FormatterOptions } from './LogFormatter';

export class ConsoleReporter implements ConsolaReporter {
  /** Used by Logger for full-width status/failover panels and optional startup banner. */
  writePanel(content: string): void {
    process.stdout.write(content + '\n');
  }
  constructor(private readonly options: FormatterOptions = {}) {}

  log(logObject: LogObject): void {
    const formatted = formatEntry({
      type: logObject.type,
      tag: logObject.tag,
      date: logObject.date,
      args: logObject.args,
    }, this.options);
    const stream = logObject.level <= 1 ? process.stderr : process.stdout;
    stream.write(formatted + '\n');
  }
}
