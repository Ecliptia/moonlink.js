import { inspect } from 'node:util';
import { logColors } from './LogLevels';

export type LogEntry = {
  type: string;
  tag?: string;
  args: unknown[];
  date?: Date;
};

export type FormatterOptions = {
  color?: boolean;
  timestamps?: boolean;
  width?: number;
};

export function ansi(text: string, code: number, enabled: boolean): string {
  return enabled ? `\x1b[${code}m${text}\x1b[0m` : text;
}

export function formatValue(value: unknown): string {
  if (value instanceof Error) return value.stack || value.message;
  if (typeof value === 'string') return value;
  return inspect(value, { depth: 5, colors: false, compact: true, breakLength: 110 });
}

export function formatArgs(args: unknown[]): string {
  return args.map(formatValue).join(' ');
}

function padRight(text: string, length: number): string {
  return text + ' '.repeat(Math.max(0, length - [...text].length));
}

function splitToWidth(text: string, width: number): string[] {
  const output: string[] = [];
  for (const originalLine of text.split(/\r?\n/)) {
    let line = originalLine;
    if (!line) { output.push(''); continue; }
    while ([...line].length > width) {
      const codepoints = [...line];
      const candidate = codepoints.slice(0, width).join('');
      const lastSpace = candidate.lastIndexOf(' ');
      const splitAt = lastSpace > width / 2 ? lastSpace : width;
      output.push(codepoints.slice(0, splitAt).join('').trimEnd());
      line = codepoints.slice(splitAt).join('').trimStart();
    }
    output.push(line);
  }
  return output;
}

export function formatBox(title: string, details: Record<string, unknown> = {}, width = 70): string {
  const innerWidth = Math.max(30, Math.min(108, Math.floor(width) - 4));
  const lines = [title.toUpperCase(), ''];
  for (const [key, value] of Object.entries(details)) {
    const label = key.padEnd(13, ' ');
    lines.push(`${label}: ${formatValue(value)}`);
  }
  const inner = lines.flatMap((line) => splitToWidth(line, innerWidth));
  const output = [`┌${'─'.repeat(innerWidth + 2)}┐`];
  for (const line of inner) output.push(`│ ${padRight(line, innerWidth)} │`);
  output.push(`└${'─'.repeat(innerWidth + 2)}┘`);
  return output.join('\n');
}

export function formatEntry(entry: LogEntry, options: FormatterOptions = {}): string {
  const color = options.color ?? false;
  const type = (entry.type || 'log').toUpperCase();
  const time = options.timestamps === false ? '' : `[${(entry.date ?? new Date()).toLocaleTimeString('en-GB', { hour12: false })}] `;
  const tag = entry.tag ? `[${entry.tag}] ` : '';
  const label = type.padEnd(7, ' ');
  const prefix = `${ansi(time, 90, color)}${ansi(label, logColors[type] ?? 37, color)} ${ansi(tag, 36, color)}`;
  const msg = formatArgs(entry.args);
  if (type === 'BOX') {
    const [title, detail] = entry.args;
    return `${prefix}\n${ansi(formatBox(formatValue(title), (detail && typeof detail === 'object' && !Array.isArray(detail) && !(detail instanceof Error)) ? detail as Record<string, unknown> : {}, options.width ?? 70), logColors.BOX, color)}`;
  }
  const indent = ' '.repeat(time.length + 8 + (entry.tag ? entry.tag.length + 3 : 0));
  return prefix + msg.split(/\r?\n/).join(`\n${indent}`);
}


/** Visual status panel. The numbers are supplied by the caller, never invented by Logger. */
export type AudioNodeStatus = {
  name: string;
  backend: 'Lavalink' | 'NodeLink' | string;
  state: 'connected' | 'ready' | 'connecting' | 'disconnected' | 'degraded' | string;
  latencyMs?: number;
  players?: number;
};

/** Callers must report `recovered` only after the player was actually restored. */
export type FailoverReport = {
  source: string;
  target: string;
  status: 'recovered' | 'failed' | 'in-progress' | 'cancelled';
  positionMs?: number;
  guildId?: string;
  reason?: string;
};

function panel(title: string, content: string[], width: number): string {
  const w = Math.max(44, Math.min(106, Math.floor(width)));
  const lineWidth = w - 4;
  const header = `┌─ ${title} ${'─'.repeat(Math.max(0, w - title.length - 5))}┐`;
  const rows = content.flatMap(x => splitToWidth(x, lineWidth)).map(s => `│ ${padRight(s, lineWidth)} │`);
  return [header, ...rows, `└${'─'.repeat(w-2)}┘`].join('\n');
}

function tint(text: string, word: string, code: number, enabled: boolean): string {
  if (!enabled) return text;
  if (word === 'CONNECTED') return text.replace(/\bCONNECTED\b/g, ansi(word, code, true));
  return text.replaceAll(word, ansi(word, code, true));
}

export function formatSystemStatus(nodes: AudioNodeStatus[], options: FormatterOptions = {}): string {
  const readyStates = new Set(['ready', 'connected']);
  const allReady = nodes.length > 0 && nodes.every(x => readyStates.has(x.state.toLowerCase()));
  const readyCount = nodes.filter(x=>readyStates.has(x.state.toLowerCase())).length;
  const lines: string[] = [
    `${allReady ? '● HEALTHY' : '● ATTENTION'}   ${readyCount}/${nodes.length} nodes connected`,
    '',
  ];
  if (!nodes.length) lines.push('No audio nodes configured');
  for (const node of nodes) {
    lines.push(`${node.backend.toUpperCase()} · ${node.name}`);
    const latency = node.latencyMs == null ? 'latency --' : `${node.latencyMs}ms`;
    const players = node.players == null ? 'players --' : `${node.players} players`;
    lines.push(`  ${node.state.toUpperCase()}   ${latency} · ${players}`);
    lines.push('');
  }
  if (lines[lines.length - 1] === '') lines.pop();
  let output = panel('NYXLINK • SYSTEM STATUS', lines, options.width ?? 72);
  const color = options.color ?? false;
  output = tint(output,'● HEALTHY',92,color);
  output = tint(output,'● ATTENTION',93,color);
  for (const state of ['CONNECTED','READY']) output=tint(output,state,92,color);
  for (const state of ['CONNECTING','DEGRADED']) output=tint(output,state,93,color);
  output=tint(output,'DISCONNECTED',91,color);
  return output;
}

export function formatFailover(event: FailoverReport, options: FormatterOptions = {}): string {
  const states: Record<FailoverReport['status'],string> = {
    recovered:'Recovered', failed:'Failed', 'in-progress':'In progress', cancelled:'Cancelled'
  };
  const lines=[
    `Source       ${event.source}`,
    `Target       ${event.target}`,
    ...event.positionMs===undefined ? [] : [`Position     ${formatDuration(event.positionMs)}`],
    ...event.guildId ? [`Guild        ${event.guildId}`] : [],
    ...event.reason ? [`Reason       ${event.reason}`] : [],
    `Status       ${states[event.status]}`,
  ];
  let output=panel('NYXLINK • NODE FAILOVER',lines, options.width ?? 72);
  const color=options.color ?? false;
  output=tint(output,'Recovered',92,color);
  output=tint(output,'Failed',91,color);
  output=tint(output,'In progress',93,color);
  output=tint(output,'Cancelled',90,color);
  return output;
}

function formatDuration(ms: number): string {
  const secs=Math.max(0, Math.floor(ms / 1000));
  const minutes=Math.floor(secs/60), seconds=secs%60;
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}
