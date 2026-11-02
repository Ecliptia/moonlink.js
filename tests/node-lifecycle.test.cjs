const test = require('node:test');
const assert = require('node:assert/strict');
const { setTimeout: delay } = require('node:timers/promises');
const { Manager } = require('../dist');
const { NodeState } = require('../dist/src/typings/types');
const { createPlayer } = require('./helpers/player.cjs');
const { deferred } = require('./helpers/player.cjs');
const { v4Server, event } = require('./helpers/v4-server.cjs');

test('a ready frame in the HTTP upgrade head is processed and backend metadata is ready at nodeReady', async t => {
  const fixture = await v4Server(t);
  const manager = new Manager({ nodes: [{ identifier: 'wire', host: '127.0.0.1', port: fixture.port, password: 'test', secure: false }], options: { resume: false, database: { type: 'memory' } } });
  t.after(() => manager.nodes.nodes.get('wire')?.destroy());
  const ready = event(manager, 'nodeReady');
  await manager.init('123456789012345678');
  const [node] = await ready;
  assert.equal(node.backend.kind, 'lavalink');
  assert.equal(node.sessionId, 'fixture-session');
  assert.equal(node.state, NodeState.READY);
});

test('invalid WebSocket credentials produce a typed error and terminate without retries', async t => {
  const fixture = await v4Server(t, { rejectAuth: true });
  const manager = new Manager({ nodes: [{ identifier: 'wire', host: '127.0.0.1', port: fixture.port, password: 'bad', secure: false, retryAmount: 2, retryDelay: 10 }], options: { resume: false, database: { type: 'memory' } } });
  t.after(() => manager.nodes.nodes.get('wire')?.destroy());
  const errors = [];
  manager.on('nodeError', (_node, error) => errors.push(error));
  const destroyed = event(manager, 'nodeDestroy');
  await manager.init('123456789012345678');
  await destroyed;
  assert.equal(errors[0].statusCode, 401);
  assert.equal(fixture.upgrades, 1);
});

test('destroy clears scheduled reconnect work and keeps the destroyed state', async t => {
  const { node } = createPlayer(t);
  let reconnects = 0;
  node.reconnectTimeout = setTimeout(() => { reconnects++; }, 10);
  await node.destroy();
  await delay(30);
  assert.equal(reconnects, 0);
  assert.equal(node.connected, false);
  assert.equal(node.state, NodeState.DESTROYED);
});

test('zero retryAmount disables reconnection and priority comes from real node configuration', async t => {
  const { manager } = createPlayer(t);
  manager.nodes.add({ identifier: 'configured', host: '127.0.0.1', port: 2445, password: 'test', secure: false, retryAmount: 0, priority: 12 });
  const node = manager.nodes.nodes.get('configured');
  t.after(() => node.destroy());
  node.reconnect();
  assert.equal(node.reconnectTimeout, undefined);
  assert.equal(node.priority, 12);
});

test('transient WebSocket rejection is retried only up to retryAmount', async t => {
  const fixture = await v4Server(t, { rejectStatus: 503 });
  const manager = new Manager({ nodes: [{ identifier: 'wire', host: '127.0.0.1', port: fixture.port, password: 'test', secure: false, retryAmount: 2, retryDelay: 10 }], options: { resume: false, database: { type: 'memory' } } });
  t.after(() => manager.nodes.nodes.get('wire')?.destroy());
  const ended = event(manager, 'nodeDestroy');
  await manager.init('123456789012345678');
  await ended;
  assert.equal(fixture.upgrades, 3);
});

test('duplicate disaster-recovery triggers share the same in-progress restoration', async t => {
  const { node, player, manager } = createPlayer(t);
  const restore = deferred();
  let restarts = 0;
  let successes = 0;
  player.restart = async () => { restarts++; return restore.promise; };
  manager.on('playerRecoverySuccess', () => successes++);
  const first = node.startDisasterRecovery('first');
  const duplicate = node.startDisasterRecovery('duplicate');
  assert.equal(restarts, 1);
  restore.resolve(true);
  await Promise.all([first, duplicate]);
  assert.equal(successes, 1);
});

test('malformed and unknown WebSocket JSON cannot crash the node', async t => {
  const { node } = createPlayer(t);
  for (const payload of ['null', '[]', '42', '{"op":"unknown"}', 'not-json']) {
    await assert.doesNotReject(node.message({ data: payload }));
  }
});

test('upgrades closed before ready cannot reset the retry bound forever', async t => {
  const fixture = await v4Server(t, { closeBeforeReady: true });
  const manager = new Manager({ nodes: [{ identifier: 'wire', host: '127.0.0.1', port: fixture.port, password: 'test', secure: false, retryAmount: 2, retryDelay: 10 }], options: { resume: false, database: { type: 'memory' } } });
  t.after(() => manager.nodes.nodes.get('wire')?.destroy());
  const ended = event(manager, 'nodeDestroy');
  await manager.init('123456789012345678');
  await ended;
  assert.equal(fixture.upgrades, 3);
});

test('closing from the WebSocket open listener neither crashes nor leaves a heartbeat running', async t => {
  const { WebSocket } = require('../dist');
  const { once } = require('node:events');
  const fixture = await v4Server(t);
  const socket = new WebSocket(`ws://127.0.0.1:${fixture.port}/v4/websocket`);
  socket.on('open', () => socket.close());
  await once(socket, 'close');
  assert.equal(socket.readyState, 3);
});

test('pending resume errors cannot create retry timers after node destruction', async t => {
  const { node, manager } = createPlayer(t);
  manager.options.resume = true;
  node.sessionId = 'test-session';
  const response = deferred();
  node.rest.updateSession = () => response.promise;
  const enabling = node.enableResumeWithRetry();
  await node.destroy();
  response.reject(new Error('late failure'));
  await enabling;
  assert.equal(node.resumeUpdateTimeout, undefined);
});

test('a ready storage write completing after destroy cannot emit nodeReady', async t => {
  const { node, manager } = createPlayer(t);
  const started = deferred();
  const response = deferred();
  manager.database.set = async () => { started.resolve(); await response.promise; };
  let ready = 0;
  manager.on('nodeReady', () => ready++);
  const receiving = node.message({ data: JSON.stringify({ op: 'ready', sessionId: 'session', resumed: false }) });
  await started.promise;
  await node.destroy();
  response.resolve();
  await receiving;
  assert.equal(ready, 0);
});

test('automatic disaster recovery never starts a queue already stopped by the user', async t => {
  const { node, player, requests } = createPlayer(t);
  const { createTrack } = require('./helpers/player.cjs');
  player.queue.add(createTrack('queued'));
  await player.stop();
  player.voice.connect = async () => {};
  await node.startDisasterRecovery('new session');
  assert.equal(player.playing, false);
  assert.equal(player.current, null);
  assert.equal(player.queue.size, 1);
  assert.equal(requests.filter(request => request.payload.track?.encoded).length, 0);
});
