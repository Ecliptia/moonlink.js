const test = require('node:test');
const assert = require('node:assert/strict');
const { formatBox, formatEntry, formatSystemStatus, formatFailover } = require('../dist/src/logging/LogFormatter.js');

test('compact log includes module and message', () => {
  const message = formatEntry({ type: 'info', tag: 'NodeManager', args: ['connected'], date: new Date('2026-11-02T10:00:00Z') }, { timestamps: false, color: false });
  assert.match(message, /INFO\s+\[NodeManager\] connected/);
});
test('color flag toggles ANSI escapes', () => {
  const log = { type: 'warn', tag: 'NodeHealth', args: ['latency high'] };
  assert.match(formatEntry(log, {timestamps:false,color:true}), /\x1b\[/);
  assert.doesNotMatch(formatEntry(log, {timestamps:false,color:false}), /\x1b\[/);
});
test('box includes title and fields', () => {
  const box = formatBox('NODE FAILOVER', {Source:'EU-1',Target:'US-2'});
  assert.match(box,/NODE FAILOVER/);
  assert.match(box,/EU-1/);
  assert.match(box,/US-2/);
});
test('box handles long content', () => {
  const box = formatBox('ERROR', {message:'x'.repeat(500)},45);
  assert.ok(box.split('\n').length > 10);
  assert.match(box,/└/);
});
test('system status shows backend, latency, players and health', () => {
  const status = formatSystemStatus([
    {backend:'Lavalink',name:'EU-1',state:'connected',latencyMs:42,players:12},
    {backend:'NodeLink',name:'US-2',state:'connected',latencyMs:68,players:8},
  ], {color:false,width:70});
  assert.match(status, /SYSTEM STATUS/);
  assert.match(status, /HEALTHY/);
  assert.match(status, /42ms/);
  assert.match(status, /12 players/);
  assert.match(status, /NODELINK/);
});
test('node status is not healthy when any node disconnected', () => {
  const status = formatSystemStatus([{backend:'Lavalink',name:'EU-1',state:'disconnected'}]);
  assert.match(status, /ATTENTION/);
  assert.doesNotMatch(status, /● HEALTHY/);
});
test('failover only claims recovered when supplied as status', () => {
  const pending = formatFailover({source:'EU-1',target:'US-2',status:'in-progress'});
  assert.match(pending,/In progress/);
  assert.doesNotMatch(pending,/Recovered/);
  const succeeded=formatFailover({source:'EU-1',target:'US-2',status:'recovered',positionMs:98000});
  assert.match(succeeded,/Recovered/);
  assert.match(succeeded,/01:38/);
});
test('status and failover keep ANSI optional', () => {
  const event={source:'EU-1',target:'US-2',status:'failed'};
  assert.match(formatFailover(event,{color:true}),/\x1b\[/);
  assert.doesNotMatch(formatFailover(event,{color:false}),/\x1b\[/);
});
test('error preserves stack text', () => {
  const x = formatEntry({type:'error',tag:'Player',args:[new Error('failed')]},{timestamps:false,color:false});
  assert.match(x,/failed/);
});
