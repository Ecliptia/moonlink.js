import { createConsola } from 'consola';
import { ConsoleReporter } from './ConsoleReporter';
import { createBanner } from './Banner';
import { formatSystemStatus, formatFailover, type AudioNodeStatus, type FailoverReport } from './LogFormatter';
import { consolaLevels, type NyxLogLevel } from './LogLevels';
import type { Manager } from '../core/Manager';
import { NodeState } from '../typings/types';

export type LoggerOptions = {
  level?: NyxLogLevel;
  color?: boolean;
  timestamps?: boolean;
  width?: number;
};

export type DebugSource = {
  on(event: 'debug', listener: (message: string) => void): unknown;
  off?(event: 'debug', listener: (message: string) => void): unknown;
  removeListener?(event: 'debug', listener: (message: string) => void): unknown;
};

/**
 * Configurable logging facade, independent of any Discord bot.
 * Never writes automatically unless log methods are called and the level permits.
 * Default is silent: libraries shouldn't print into their host's terminal.
 */
export class Logger {
  private readonly instance: ReturnType<typeof createConsola>;
  private readonly reporter: ConsoleReporter;
  private readonly options: Required<LoggerOptions>;
  private currentLevel: NyxLogLevel;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      color: options.color ?? Boolean(process.stdout.isTTY && !process.env.NO_COLOR),
      timestamps: options.timestamps ?? true,
      width: options.width ?? 72,
      level: options.level ?? 'silent',
    };
    this.currentLevel = this.options.level!;
    this.reporter = new ConsoleReporter(this.options);
    this.instance = createConsola({
      level: consolaLevels[this.currentLevel],
      reporters: [this.reporter],
    });
  }

  setLevel(level: NyxLogLevel): void {
    this.currentLevel = level;
    this.instance.level = consolaLevels[level];
  }

  private canShowInfo(): boolean {
    return consolaLevels[this.currentLevel] >= consolaLevels.info;
  }

  for(module: string) {
    return this.instance.withTag(module);
  }

  info(module: string, message: string, ...args: unknown[]): void {
    this.for(module).info(message, ...args);
  }

  success(module: string, message: string, ...args: unknown[]): void {
    this.for(module).success(message, ...args);
  }

  warn(module: string, message: string, ...args: unknown[]): void {
    this.for(module).warn(message, ...args);
  }

  error(module: string, message: string, ...args: unknown[]): void {
    this.for(module).error(message, ...args);
  }

  debug(module: string, message: string, ...args: unknown[]): void {
    this.for(module).debug(message, ...args);
  }

  trace(module: string, message: string, ...args: unknown[]): void {
    this.for(module).trace(message, ...args);
  }

  box(module: string, title: string, fields: Record<string, unknown>): void {
    this.for(module).box(title, fields);
  }

  banner(): void {
    if (!this.canShowInfo()) return;
    this.reporter.writePanel(createBanner(this.options.color));
  }

  /** Caller provides real node stats; no simulated values are ever generated. */
  systemStatus(nodes: AudioNodeStatus[]): void {
    if (!this.canShowInfo()) return;
    this.reporter.writePanel(formatSystemStatus(nodes, this.options));
  }

  /** Only use `recovered` after verified successful recovery. */
  failover(event: FailoverReport): void {
    if (!this.canShowInfo()) return;
    this.reporter.writePanel(formatFailover(event, this.options));
  }

  /**
   * Non-invasive adapter for Moonlink's existing manager.on('debug') events.
   * Does not re-emit debug events, avoiding recursion and duplicates.
   * WARNING: legacy messages may contain credentials/tokens; control access to logs.
   */
  attachLegacyDebug(source: DebugSource): () => void {
    const handle = (message: string) => {
      const module = /^(?:Moonlink\.js|NyxLink)\s*>\s*([A-Za-z][\w]*)/.exec(message)?.[1] ?? 'Legacy';
      this.debug(module, message);
    };
    source.on('debug', handle);
    return () => {
      if (source.off) source.off('debug', handle);
      else source.removeListener?.('debug', handle);
    };
  }

  /** Show observed state only; a node without backend info is labelled Unknown. */
  managerStatus(manager: Manager): void {
    const nodes = [...manager.nodes.nodes.values()];
    this.systemStatus(nodes.map(node => ({
      name: node.identifier,
      backend: node.backend?.kind === 'nodelink' ? 'NodeLink' : node.backend?.kind === 'lavalink' ? 'Lavalink' : 'Unknown',
      state: node.connected
        ? node.state === NodeState.READY ? 'ready' : 'connected'
        : NodeState[node.state]?.toLowerCase() ?? 'disconnected',
      latencyMs: node.latency >= 0 ? node.latency : undefined,
      players: manager.players.all.filter(player => player.node === node && !player.destroyed).length,
    })));
  }

  /** Returns an idempotent disposer; it never re-emits debug messages. */
  attachManager(manager: Manager): () => void {
    const detachDebug = this.attachLegacyDebug(manager);
    const detachStatus = manager.on('nodeStateChange', () => this.managerStatus(manager));
    const detachReady = manager.on('nodeReady', () => this.managerStatus(manager));
    const detachDestroy = manager.on('nodeDestroy', () => this.managerStatus(manager));
    const detachFailover = manager.on('playerNodeFailover', (player, report) => {
      this.failover({ ...report, guildId: player.guildId });
    });
    let detached = false;
    return () => {
      if (detached) return;
      detached = true;
      detachDebug();
      detachStatus();
      detachReady();
      detachDestroy();
      detachFailover();
    };
  }
}
