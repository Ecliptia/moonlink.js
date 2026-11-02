const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { Manager, Connectors } = require('../dist');
const { Memory } = require('../dist/src/database/Memory');
const { deferred } = require('./helpers/player.cjs');

const clientId = '123456789012345678';

function fixture(t, { adapter = new Memory(), options = {} } = {}) {
  assert.equal(typeof Manager.prototype.shutdown, 'function', 'Manager.shutdown must be available');
  const manager = new Manager({
    nodes: [{ host: '127.0.0.1', port: 2333, password: 'fixture', secure: false }],
    send() {},
    options: { ...options, database: { type: 'memory', adapter } },
  });
  let starts = 0;
  manager.nodes.init = () => { starts++; };
  t.after(async () => {
    await manager.shutdown().catch(() => {});
    clearInterval(manager.idleCheckInterval);
  });
  return { manager, adapter, get starts() { return starts; } };
}

function client() {
  const value = new EventEmitter();
  value.user = { id: clientId };
  value.guilds = { cache: new Map() };
  return value;
}

test('concurrent init calls initialize storage and start nodes exactly once', { timeout: 2000 }, async t => {
  const entered = deferred();
  const release = deferred();
  t.after(() => release.resolve());
  const adapter = new Memory();
  let initialized = 0;
  adapter.init = async () => { initialized++; entered.resolve(); await release.promise; };
  const lab = fixture(t, { adapter });
  const first = lab.manager.init(clientId);
  const second = lab.manager.init(clientId);
  await entered.promise;
  assert.equal(initialized, 1);
  assert.equal(lab.starts, 0);
  release.resolve();
  assert.equal(await first, lab.manager);
  assert.equal(await second, lab.manager);
  await lab.manager.init(clientId);
  assert.equal(initialized, 1);
  assert.equal(lab.starts, 1);
});

test('concurrent shutdown drains players before nodes and closes storage last only once', { timeout: 2000 }, async t => {
  const playerEntered = deferred();
  const releasePlayer = deferred();
  t.after(() => releasePlayer.resolve());
  const events = [];
  const adapter = new Memory();
  adapter.flush = async () => { events.push('flush'); };
  adapter.shutdown = async () => { events.push('storage'); };
  const { manager } = fixture(t, { adapter });
  await manager.init(clientId);
  manager.players.players.set('player', {
    async destroy() { events.push('player-start'); playerEntered.resolve(); await releasePlayer.promise; events.push('player-end'); },
  });
  manager.nodes.nodes.set('node', { async destroy() { events.push('node'); } });
  const first = manager.shutdown();
  const second = manager.shutdown();
  await playerEntered.promise;
  assert.deepEqual(events, ['player-start']);
  releasePlayer.resolve();
  await Promise.all([first, second]);
  await manager.shutdown();
  assert.equal(events.filter(value => value === 'player-start').length, 1);
  assert.equal(events.filter(value => value === 'node').length, 1);
  assert.equal(events.filter(value => value === 'storage').length, 1);
  assert.ok(events.indexOf('player-end') < events.indexOf('node'));
  assert.ok(events.indexOf('node') < events.indexOf('flush'));
  assert.equal(events.at(-1), 'storage');
  assert.equal(manager.initialized, false);
});

test('shutdown waits for pending initialization and leaves no late startup work', { timeout: 2000 }, async t => {
  const entered = deferred();
  const release = deferred();
  t.after(() => release.resolve());
  const adapter = new Memory();
  const events = [];
  adapter.init = async () => { events.push('init-start'); entered.resolve(); await release.promise; events.push('init-end'); };
  adapter.shutdown = async () => { events.push('storage-end'); };
  const lab = fixture(t, { adapter });
  const initializing = lab.manager.init(clientId);
  // Register rejection handling before shutdown is allowed to cancel initialization.
  const initialized = Promise.allSettled([initializing]);
  await entered.promise;
  let closed = false;
  const closing = lab.manager.shutdown().then(() => { closed = true; });
  await Promise.resolve();
  assert.equal(closed, false);
  assert.deepEqual(events, ['init-start']);
  release.resolve();
  await initialized;
  await closing;
  assert.equal(events.filter(value => value === 'storage-end').length, 1);
  assert.ok(events.indexOf('init-end') < events.indexOf('storage-end'));
  assert.equal(lab.manager.initialized, false);
  const startsAfterClose = lab.starts;
  await Promise.resolve();
  assert.equal(lab.starts, startsAfterClose);
});

test('shutdown detaches owned logger and connector listeners and stops idle monitoring', async t => {
  t.mock.timers.enable({ apis: ['setInterval'] });
  const { manager } = fixture(t, { options: { logging: { level: 'silent' }, playerDestruction: { autoDestroyOnIdle: true } } });
  const gateway = client();
  const unrelatedRaw = () => {};
  const unrelatedDebug = () => {};
  gateway.on('raw', unrelatedRaw);
  manager.on('debug', unrelatedDebug);
  manager.use(new Connectors.DiscordJs(), gateway);
  assert.equal(gateway.listenerCount('raw'), 2);
  assert.equal(gateway.listenerCount('clientReady'), 1);
  assert.ok(manager.listenerCount('debug') > 1);
  let idleReads = 0;
  Object.defineProperty(manager.players, 'all', { configurable: true, get() { idleReads++; return []; } });
  await manager.init(clientId);
  await manager.shutdown();
  assert.equal(gateway.listenerCount('raw'), 1);
  assert.equal(gateway.listeners('raw')[0], unrelatedRaw);
  assert.equal(gateway.listenerCount('clientReady'), 0);
  assert.equal(manager.listenerCount('debug'), 1);
  const afterShutdown = idleReads;
  t.mock.timers.tick(120000);
  assert.equal(idleReads, afterShutdown);
});

test('a closed manager rejects reinitialization, new players, new connectors and searches', async t => {
  const { manager } = fixture(t);
  await manager.init(clientId);
  await manager.shutdown();
  await assert.rejects(manager.init(clientId), /shut|clos|destroy/i);
  assert.throws(() => manager.players.create({ guildId: clientId, voiceChannelId: '223456789012345678' }), /shut|clos|destroy/i);
  const gateway = client();
  assert.throws(() => manager.use(new Connectors.DiscordJs(), gateway), /shut|clos|destroy/i);
  assert.equal(gateway.listenerCount('raw'), 0);
  await assert.rejects(manager.search({ query: 'fixture' }), /shut|clos|destroy/i);
});

test('a cleanup failure is aggregated after every other owned resource is closed', async t => {
  const events = [];
  const failure = new Error('fixture player cleanup failed');
  const adapter = new Memory();
  adapter.flush = async () => { events.push('flush'); };
  adapter.shutdown = async () => { events.push('storage'); };
  const { manager } = fixture(t, { adapter });
  await manager.init(clientId);
  manager.players.players.set('broken', { async destroy() { events.push('broken-player'); throw failure; } });
  manager.players.players.set('healthy', { async destroy() { events.push('healthy-player'); } });
  manager.nodes.nodes.set('node', { async destroy() { events.push('node'); } });
  await assert.rejects(manager.shutdown(), error => {
    assert.ok(error instanceof AggregateError);
    assert.ok(error.errors.includes(failure));
    return true;
  });
  assert.equal(events.filter(value => value === 'broken-player').length, 1);
  assert.equal(events.filter(value => value === 'healthy-player').length, 1);
  assert.equal(events.filter(value => value === 'node').length, 1);
  assert.equal(events.filter(value => value === 'storage').length, 1);
  assert.ok(events.indexOf('healthy-player') < events.indexOf('node'));
  assert.ok(events.indexOf('node') < events.indexOf('flush'));
  assert.equal(events.at(-1), 'storage');
  assert.equal(manager.initialized, false);
});

test('a storage flush failure still closes the provider', async t => {
  const adapter = new Memory(); const failure = new Error('fixture flush failure'); let closed = 0;
  adapter.flush = async () => { throw failure; };
  adapter.shutdown = async () => { closed++; };
  const { manager } = fixture(t, { adapter }); await manager.init(clientId);
  await assert.rejects(manager.shutdown(), AggregateError);
  assert.equal(closed, 1);
});

test('failed initialization closes partial nodes and storage before a retry', async t => {
  const adapter = new Memory(); let opened = 0; let closed = 0; let nodeClosed = 0;
  adapter.init = async () => { opened++; };
  adapter.shutdown = async () => { closed++; };
  const { manager } = fixture(t, { adapter }); let attempts = 0;
  manager.nodes.init = () => {
    if (++attempts === 1) {
      manager.nodes.nodes.set('partial', { async destroy() { nodeClosed++; } });
      throw new Error('fixture startup failed');
    }
  };
  await assert.rejects(manager.init(clientId), /startup failed/);
  assert.equal(closed, 1); assert.equal(nodeClosed, 1); assert.equal(manager.nodes.nodes.size, 0);
  await manager.init(clientId); await manager.shutdown();
  assert.equal(opened, 2); assert.equal(closed, 2);
});

test('shutdown owns cleanup of a connector whose listen failed after attaching', async t => {
  const { manager } = fixture(t); const gateway = client();
  class BrokenConnector extends Connectors.DiscordJs { listen(value) { super.listen(value); throw new Error('fixture listen failed'); } }
  assert.throws(() => manager.use(new BrokenConnector(), gateway), /listen failed/);
  await manager.shutdown();
  assert.equal(gateway.listenerCount('raw'), 0); assert.equal(gateway.listenerCount('clientReady'), 0);
});

test('shutdown requested from nodeCreate prevents further startup without a spurious error', async t => {
  const manager = new Manager({ nodes: [
    { identifier: 'first', host: '127.0.0.1', port: 2333, password: 'test', secure: false },
    { identifier: 'second', host: '127.0.0.1', port: 2334, password: 'test', secure: false },
  ], options: { database: { type: 'memory' } } });
  let connected = 0; let closing;
  manager.on('nodeCreate', node => { node.connect = async () => { connected++; }; closing = manager.shutdown(); });
  const result = await Promise.allSettled([manager.init(clientId)]);
  await closing;
  assert.equal(result[0].status, 'fulfilled'); assert.equal(connected, 0); assert.equal(manager.nodes.nodes.size, 0);
});
