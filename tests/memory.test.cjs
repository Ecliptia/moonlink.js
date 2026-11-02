const test = require('node:test');
const assert = require('node:assert/strict');
const { Memory } = require('../dist/src/database/Memory');

test('memory storage retains node sessions and dotted player updates', async () => {
  const memory = new Memory();
  await memory.set('nodes.audio', { sessionId: 'session' });
  await memory.set('players.guild', { volume: 100, queue: [] });
  await memory.set('players.guild.volume', 35);
  assert.deepEqual(await memory.get('nodes.audio'), { sessionId: 'session' });
  assert.equal((await memory.get('players.guild')).volume, 35);
  assert.equal(await memory.has('nodes.audio.sessionId'), true);
  assert.deepEqual(await memory.keys('nodes.*'), ['nodes.audio.sessionId']);
  assert.equal(await memory.remove('nodes.audio'), true);
  assert.equal(await memory.has('nodes.audio'), false);
  await memory.shutdown();
  assert.deepEqual(await memory.keys(), []);
});

test('memory storage rejects prototype paths and never reads inherited object properties', async () => {
  const memory = new Memory();
  await assert.rejects(memory.set('__proto__.polluted', true), TypeError);
  await memory.set('safe', {});
  assert.equal(await memory.get('safe.constructor'), undefined);
  assert.equal({}.polluted, undefined);
});

test('memory key patterns escape regular-expression punctuation', async () => {
  const memory = new Memory();
  await memory.set('what?', 1);
  await memory.set('what', 2);
  assert.deepEqual(await memory.keys('what?'), ['what?']);
});
