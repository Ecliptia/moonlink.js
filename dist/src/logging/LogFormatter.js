"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ansi = ansi;
exports.formatValue = formatValue;
exports.formatArgs = formatArgs;
exports.formatBox = formatBox;
exports.formatEntry = formatEntry;
exports.formatSystemStatus = formatSystemStatus;
exports.formatFailover = formatFailover;
const node_util_1 = require("node:util");
const LogLevels_1 = require("./LogLevels");
function ansi(text, code, enabled) {
    return enabled ? `\x1b[${code}m${text}\x1b[0m` : text;
}
function formatValue(value) {
    if (value instanceof Error)
        return value.stack || value.message;
    if (typeof value === 'string')
        return value;
    return (0, node_util_1.inspect)(value, { depth: 5, colors: false, compact: true, breakLength: 110 });
}
function formatArgs(args) {
    return args.map(formatValue).join(' ');
}
function padRight(text, length) {
    return text + ' '.repeat(Math.max(0, length - [...text].length));
}
function splitToWidth(text, width) {
    const output = [];
    for (const originalLine of text.split(/\r?\n/)) {
        let line = originalLine;
        if (!line) {
            output.push('');
            continue;
        }
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
function formatBox(title, details = {}, width = 70) {
    const innerWidth = Math.max(30, Math.min(108, Math.floor(width) - 4));
    const lines = [title.toUpperCase(), ''];
    for (const [key, value] of Object.entries(details)) {
        const label = key.padEnd(13, ' ');
        lines.push(`${label}: ${formatValue(value)}`);
    }
    const inner = lines.flatMap((line) => splitToWidth(line, innerWidth));
    const output = [`┌${'─'.repeat(innerWidth + 2)}┐`];
    for (const line of inner)
        output.push(`│ ${padRight(line, innerWidth)} │`);
    output.push(`└${'─'.repeat(innerWidth + 2)}┘`);
    return output.join('\n');
}
function formatEntry(entry, options = {}) {
    const color = options.color ?? false;
    const type = (entry.type || 'log').toUpperCase();
    const time = options.timestamps === false ? '' : `[${(entry.date ?? new Date()).toLocaleTimeString('en-GB', { hour12: false })}] `;
    const tag = entry.tag ? `[${entry.tag}] ` : '';
    const label = type.padEnd(7, ' ');
    const prefix = `${ansi(time, 90, color)}${ansi(label, LogLevels_1.logColors[type] ?? 37, color)} ${ansi(tag, 36, color)}`;
    const msg = formatArgs(entry.args);
    if (type === 'BOX') {
        const [title, detail] = entry.args;
        return `${prefix}\n${ansi(formatBox(formatValue(title), (detail && typeof detail === 'object' && !Array.isArray(detail) && !(detail instanceof Error)) ? detail : {}, options.width ?? 70), LogLevels_1.logColors.BOX, color)}`;
    }
    const indent = ' '.repeat(time.length + 8 + (entry.tag ? entry.tag.length + 3 : 0));
    return prefix + msg.split(/\r?\n/).join(`\n${indent}`);
}
function panel(title, content, width) {
    const w = Math.max(44, Math.min(106, Math.floor(width)));
    const lineWidth = w - 4;
    const header = `┌─ ${title} ${'─'.repeat(Math.max(0, w - title.length - 5))}┐`;
    const rows = content.flatMap(x => splitToWidth(x, lineWidth)).map(s => `│ ${padRight(s, lineWidth)} │`);
    return [header, ...rows, `└${'─'.repeat(w - 2)}┘`].join('\n');
}
function tint(text, word, code, enabled) {
    if (!enabled)
        return text;
    if (word === 'CONNECTED')
        return text.replace(/\bCONNECTED\b/g, ansi(word, code, true));
    return text.replaceAll(word, ansi(word, code, true));
}
function formatSystemStatus(nodes, options = {}) {
    const readyStates = new Set(['ready', 'connected']);
    const allReady = nodes.length > 0 && nodes.every(x => readyStates.has(x.state.toLowerCase()));
    const readyCount = nodes.filter(x => readyStates.has(x.state.toLowerCase())).length;
    const lines = [
        `${allReady ? '● HEALTHY' : '● ATTENTION'}   ${readyCount}/${nodes.length} nodes connected`,
        '',
    ];
    if (!nodes.length)
        lines.push('No audio nodes configured');
    for (const node of nodes) {
        lines.push(`${node.backend.toUpperCase()} · ${node.name}`);
        const latency = node.latencyMs == null ? 'latency --' : `${node.latencyMs}ms`;
        const players = node.players == null ? 'players --' : `${node.players} players`;
        lines.push(`  ${node.state.toUpperCase()}   ${latency} · ${players}`);
        lines.push('');
    }
    if (lines[lines.length - 1] === '')
        lines.pop();
    let output = panel('NYXLINK • SYSTEM STATUS', lines, options.width ?? 72);
    const color = options.color ?? false;
    output = tint(output, '● HEALTHY', 92, color);
    output = tint(output, '● ATTENTION', 93, color);
    for (const state of ['CONNECTED', 'READY'])
        output = tint(output, state, 92, color);
    for (const state of ['CONNECTING', 'DEGRADED'])
        output = tint(output, state, 93, color);
    output = tint(output, 'DISCONNECTED', 91, color);
    return output;
}
function formatFailover(event, options = {}) {
    const states = {
        recovered: 'Recovered', failed: 'Failed', 'in-progress': 'In progress', cancelled: 'Cancelled'
    };
    const lines = [
        `Source       ${event.source}`,
        `Target       ${event.target}`,
        ...event.positionMs === undefined ? [] : [`Position     ${formatDuration(event.positionMs)}`],
        ...event.guildId ? [`Guild        ${event.guildId}`] : [],
        ...event.reason ? [`Reason       ${event.reason}`] : [],
        `Status       ${states[event.status]}`,
    ];
    let output = panel('NYXLINK • NODE FAILOVER', lines, options.width ?? 72);
    const color = options.color ?? false;
    output = tint(output, 'Recovered', 92, color);
    output = tint(output, 'Failed', 91, color);
    output = tint(output, 'In progress', 93, color);
    output = tint(output, 'Cancelled', 90, color);
    return output;
}
function formatDuration(ms) {
    const secs = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(secs / 60), seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
//# sourceMappingURL=LogFormatter.js.map