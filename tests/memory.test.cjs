const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { Memory } = require('../dist/src/database/Memory.js');
const { DatabaseManager } = require('../dist/src/managers/DatabaseManager.js');
const { Manager, Node } = require('../dist/index.js');
const { Structure } = require('../dist/src/Util.js');

function database() {
  const manager = new Manager({
    nodes: [{ host: '127.0.0.1', port: 2333, password: 'test-only' }],
    send() {}, options: { database: { type: 'memory' }, resume: false },
  });
  manager.database = new DatabaseManager(manager);
  return manager;
}

test('memory retains node sessions and dotted player updates through DatabaseManager', async t => {
  const manager = database();
  const db = manager.database;
  t.after(() => db.shutdown());
  await db.initialize();
  await db.set('nodes.audio', { sessionId: 'session' });
  await db.set('players.guild', { volume: 100, queue: [] });
  await db.set('players.guild.volume', 35);

  assert.deepEqual(await db.get('nodes.audio'), { sessionId: 'session' });
  assert.equal(await db.get('players.guild.volume'), 35);
  assert.equal(await db.has('nodes.audio.sessionId'), true);
  assert.deepEqual(await db.get('players.guild'), { volume: 35, queue: [] });
});

test('a stored ready session is included in the next WebSocket handshake', async t => {
  const manager = database();
  const node = new Node(manager, { identifier: 'audio', host: '127.0.0.1', port: 2333, password: 'test-only' });
  t.after(async () => { await node.destroy(); await manager.database.shutdown(); });
  await manager.database.initialize();
  await node.message({ data: JSON.stringify({ op: 'ready', sessionId: 'session', resumed: false }) });

  let headers;
  const original = Structure.get.bind(Structure);
  class Socket extends EventEmitter {
    constructor(_url, options) { super(); headers = options.headers; }
    close() {}
  }
  t.mock.method(Structure, 'get', name => name === 'WebSocket' ? Socket : original(name));
  manager.options.resume = true;
  await node.connect();

  assert.equal(headers['Session-Id'], 'session');
});

test('memory instances do not share node or player data', async () => {
  const first = new Memory();
  const second = new Memory();
  await first.set('nodes.audio.sessionId', 'first');
  await second.set('nodes.audio.sessionId', 'second');
  assert.equal(await first.get('nodes.audio.sessionId'), 'first');
  assert.equal(await second.get('nodes.audio.sessionId'), 'second');
  await first.clear();
  assert.equal(await second.get('nodes.audio.sessionId'), 'second');
});

test('memory preserves falsy values, arrays and null', async () => {
  const memory = new Memory();
  for (const [key, value] of Object.entries({ zero: 0, disabled: false, empty: '', absent: null, queue: [] })) {
    await memory.set(key, value);
    assert.deepEqual(await memory.get(key), value);
    assert.equal(await memory.has(key), true);
  }
  assert.equal(await memory.has('missing'), false);
});

test('memory replaces values and creates nested paths over scalar parents', async () => {
  const memory = new Memory();
  await memory.set('player', false);
  await memory.set('player.volume', 35);
  assert.equal(await memory.get('player.volume'), 35);
  await memory.set('player', { volume: 60 });
  assert.deepEqual(await memory.get('player'), { volume: 60 });
});

test('remove reports whether a dotted key existed and preserves siblings', async () => {
  const memory = new Memory();
  await memory.set('nodes.audio', { sessionId: 'session', enabled: false });
  assert.equal(await memory.remove('nodes.audio.sessionId'), true);
  assert.equal(await memory.get('nodes.audio.sessionId'), undefined);
  assert.equal(await memory.get('nodes.audio.enabled'), false);
  assert.equal(await memory.remove('nodes.audio.sessionId'), false);
  assert.equal(await memory.remove('missing.child'), false);
  assert.equal(await memory.remove('nodes.audio'), true);
  assert.equal(await memory.has('nodes.audio'), false);
});

test('keys enumerates dotted leaves and treats only the wildcard as a pattern', async () => {
  const memory = new Memory();
  await memory.set('nodes.audio', { sessionId: 'session' });
  await memory.set('players.guild.queue', []);
  await memory.set('what?', 1);
  await memory.set('what', 2);
  assert.deepEqual(await memory.keys('nodes.*'), ['nodes.audio.sessionId']);
  assert.deepEqual(await memory.keys('what?'), ['what?']);
  assert.deepEqual(await memory.keys('audio'), []);
  assert.deepEqual(await memory.keys(), ['nodes.audio.sessionId', 'players.guild.queue', 'what?', 'what']);
});

test('clear and shutdown discard volatile state', async () => {
  const memory = new Memory();
  await memory.set('session', 'first');
  await memory.clear();
  assert.equal(await memory.has('session'), false);
  await memory.set('session', 'second');
  await memory.shutdown();
  assert.equal(await memory.get('session'), undefined);
  assert.deepEqual(await memory.keys(), []);
});

test('memory rejects prototype and malformed paths without changing Object.prototype', async () => {
  const memory = new Memory();
  for (const key of ['__proto__.memoryPolluted', 'safe.constructor.prototype.memoryPolluted', 'safe.prototype.x', 'safe..x']) {
    await assert.rejects(memory.set(key, true), TypeError);
    assert.equal(await memory.get(key), undefined);
    await assert.rejects(memory.remove(key), TypeError);
  }
  assert.equal(Object.hasOwn(Object.prototype, 'memoryPolluted'), false);
});

test('memory only traverses own properties of stored objects', async () => {
  const memory = new Memory();
  const inherited = { child: { value: 'inherited' } };
  await memory.set('safe', Object.create(inherited));
  assert.equal(await memory.get('safe.child.value'), undefined);
  await memory.set('safe.child.value', 'own');
  assert.equal(await memory.get('safe.child.value'), 'own');
  assert.equal(inherited.child.value, 'inherited');
  assert.equal(await memory.remove('safe.toString'), false);
});

test('keys terminates on cycles while retaining paths to shared objects', async () => {
  const memory = new Memory();
  const shared = { value: 1 };
  const cyclic = { first: shared, second: shared };
  cyclic.self = cyclic;
  await memory.set('data', cyclic);
  assert.deepEqual(await memory.keys(), ['data.first.value', 'data.second.value', 'data.self']);
});
