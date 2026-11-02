const test = require('node:test');
const assert = require('node:assert/strict');
const { WebSocket } = require('../dist/src/services/WebSocket');

function connectedSocket(t) {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'], now: 100000 });
  const frames = [];
  t.mock.method(WebSocket.prototype, 'connectNode', function () {
    this.connected = true;
    this.netSocket = { write(frame) { frames.push(Buffer.from(frame)); }, destroy() {} };
  });
  const socket = new WebSocket('ws://127.0.0.1:2333/v4/websocket');
  socket.on('error', () => {});
  t.after(() => {
    socket.close();
    t.mock.timers.runAll();
  });
  return { socket, frames };
}

function payload(frame) {
  let length = frame[1] & 0x7f;
  let offset = 2;
  if (length === 126) { length = frame.readUInt16BE(2); offset = 4; }
  else if (length === 127) { length = Number(frame.readBigUInt64BE(2)); offset = 10; }
  const key = frame.subarray(offset, offset + 4);
  return Buffer.from(frame.subarray(offset + 4, offset + 4 + length).map((byte, index) => byte ^ key[index % 4]));
}

function observe(promise) {
  const result = { status: 'pending' };
  promise.then(value => Object.assign(result, { status: 'fulfilled', value }), error => Object.assign(result, { status: 'rejected', error }));
  return result;
}

test('closing after a heartbeat removes its outstanding pong deadline', t => {
  const { socket, frames } = connectedSocket(t);
  socket.startHeartbeat();
  t.mock.timers.tick(30000);
  assert.equal(frames.filter(frame => (frame[0] & 0x0f) === 0x9).length, 1);
  socket.close();
  const closedAt = Date.now();
  t.mock.timers.runAll();
  assert.equal(Date.now(), closedAt, 'a closed WebSocket must leave no heartbeat timeout in the timer queue');
});

test('closing rejects a pending manual ping immediately and removes its listeners', async t => {
  const { socket } = connectedSocket(t);
  const ping = observe(socket.ping());
  socket.close();
  await Promise.resolve();
  assert.equal(ping.status, 'rejected');
  assert.match(ping.error.message, /clos|disconnect/i);
  assert.equal(socket.listenerCount('pong'), 0);
  const closedAt = Date.now();
  t.mock.timers.runAll();
  assert.equal(Date.now(), closedAt, 'close must clear the manual ping timeout rather than waiting for it');
});

test('concurrent default pings have distinct payloads even within the same millisecond', t => {
  const { socket, frames } = connectedSocket(t);
  observe(socket.ping());
  observe(socket.ping());
  const pings = frames.filter(frame => (frame[0] & 0x0f) === 0x9).map(payload);
  assert.equal(pings.length, 2);
  assert.notDeepEqual(pings[0], pings[1]);
});

test('a pong resolves only the manual ping whose payload it echoes', async t => {
  const { socket, frames } = connectedSocket(t);
  const first = observe(socket.ping('first-probe'));
  const second = observe(socket.ping('second-probe'));
  const pings = frames.filter(frame => (frame[0] & 0x0f) === 0x9).map(payload);
  t.mock.timers.tick(12);
  socket.handleFrame(0xa, true, pings[0]);
  await Promise.resolve();
  assert.equal(first.status, 'fulfilled');
  assert.equal(second.status, 'pending');
  assert.equal(first.value, 12);
  t.mock.timers.tick(5);
  socket.handleFrame(0xa, true, pings[1]);
  await Promise.resolve();
  assert.equal(second.status, 'fulfilled');
  assert.equal(second.value, 17);
});

test('a failed close-frame write still rejects pings and clears heartbeat resources', async t => {
  const { socket } = connectedSocket(t);
  socket.startHeartbeat();
  t.mock.timers.tick(30000);
  const ping = observe(socket.ping('probe-before-write-failure'));
  socket.netSocket.write = () => { throw new Error('local transport write failed'); };
  let error;
  try { socket.close(); } catch (caught) { error = caught; }
  // Restore the fixture writer so teardown remains bounded even on the broken implementation.
  if (socket.netSocket) socket.netSocket.write = () => {};
  await Promise.resolve();
  assert.equal(error, undefined);
  assert.equal(socket.readyState, 3);
  assert.equal(ping.status, 'rejected');
  const closedAt = Date.now();
  t.mock.timers.runAll();
  assert.equal(Date.now(), closedAt);
});
