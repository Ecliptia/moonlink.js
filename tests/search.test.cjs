const test = require('node:test');
const assert = require('node:assert/strict');
const { Manager, Node, Track } = require('../dist');
const { NodeState } = require('../dist/src/typings/types');
const { DatabaseManager } = require('../dist/src/managers/DatabaseManager');
const { deferred } = require('./helpers/player.cjs');
function fixture(t, search = {}) {
  const manager = new Manager({ nodes: [{ host: '127.0.0.1', port: 2333, password: 'fixture' }], options: { database: { type: 'memory' }, search } });
  manager.database = new DatabaseManager(manager);
  const node = new Node(manager, { host: '127.0.0.1', port: 2333, password: 'fixture', identifier: 'search-node' });
  node.connected = true; node.state = NodeState.READY; node.sessionId = 'session-one';
  manager.nodes.nodes.set(node.identifier, node);
  t.after(() => manager.shutdown());
  return { manager, node };
}
function record() { return { encoded: 'opaque', info: { title: 'Song', author: 'Artist', length: 1000, identifier: 'id', uri: 'http://127.0.0.1/tone.wav', isStream: false, isSeekable: true, sourceName: 'http', position: 0 }, pluginInfo: {}, userData: {} }; }

test('backend search fallback is opt-in and uses the configured next source after empty', async t => {
  const { manager, node } = fixture(t, { fallbackPlatforms: ['soundcloud'] });
  const calls = [];
  node.rest.loadTracks = async identifier => { calls.push(identifier); return calls.length === 1 ? { loadType: 'empty', data: {} } : { loadType: 'search', data: [record()] }; };
  const result = await manager.search({ query: 'Song' });
  assert.equal(result.tracks.length, 1); assert.deepEqual(calls, ['ytsearch:Song', 'scsearch:Song']);
});

test('TTL cache clones results and keeps requesters isolated', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: 1000 });
  const { manager, node } = fixture(t, { cache: { ttlMs: 100, maxEntries: 2 } });
  let calls = 0; node.rest.loadTracks = async () => { calls++; return { loadType: 'track', data: record() }; };
  const first = await manager.search({ query: 'Song', requester: 'first' });
  first.tracks[0].userData.custom = 'private';
  const second = await manager.search({ query: 'Song', requester: 'second' });
  assert.equal(calls, 1); assert.equal(second.tracks[0].requester, 'second'); assert.equal(second.tracks[0].userData.custom, undefined);
  t.mock.timers.tick(101); await manager.search({ query: 'Song' }); assert.equal(calls, 2);
});

test('cached backend results are invalidated by session changes and capacity is bounded', async t => {
  const { manager, node } = fixture(t, { cache: { ttlMs: 10000, maxEntries: 1 } });
  let calls = 0; node.rest.loadTracks = async () => { calls++; return { loadType: 'track', data: record() }; };
  await manager.search({ query: 'a' }); await manager.search({ query: 'b' }); await manager.search({ query: 'a' }); assert.equal(calls, 3);
  node.sessionId = 'session-two'; await manager.search({ query: 'a' }); assert.equal(calls, 4);
});

test('a configured resolver can return metadata without sharing requester-specific results', async t => {
  let calls = 0;
  const { manager, node } = fixture(t, { cache: { ttlMs: 10000 }, resolver: async () => { calls++; return { loadType: 'track', data: record() }; } });
  node.rest.loadTracks = async () => { throw new Error('not expected'); };
  assert.equal((await manager.search({ query: 'custom' })).tracks.length, 1);
  await manager.search({ query: 'custom' }); assert.equal(calls, 2);
});

test('abort and shutdown reject pending search results and never return stale data', async t => {
  const { manager, node } = fixture(t);
  const pending = deferred(); const entered = deferred(); node.rest.loadTracks = async () => { entered.resolve(); return pending.promise; };
  const abort = new AbortController(); const searching = manager.search({ query: 'Song', signal: abort.signal });
  const rejected = assert.rejects(searching, /abort/i); await entered.promise; abort.abort(); await rejected;
  const closingSearch = manager.search({ query: 'Other' }); const closingRejected = assert.rejects(closingSearch, /shut|clos/i);
  await manager.shutdown(); await closingRejected; pending.resolve({ loadType: 'track', data: record() });
});

test('malformed search payloads fail explicitly and rate-limit errors do not trigger fallback', async t => {
  const { manager, node } = fixture(t, { fallbackPlatforms: ['soundcloud'] });
  node.rest.loadTracks = async () => ({ loadType: 'search', data: {} });
  await assert.rejects(manager.search({ query: 'Song' }), /search|response|payload|array/i);
  node.rest.loadTracks = async () => ({ loadType: 'unexpected', data: {} });
  await assert.rejects(manager.search({ query: 'Song' }), /search response/i);
  let calls = 0; node.rest.loadTracks = async () => { calls++; throw new Error('HTTP 429'); };
  await assert.rejects(manager.search({ query: 'Song' }), /429/); assert.equal(calls, 1);
});

test('native results respect disabled sources and URLs never receive text-search fallback prefixes', async t => {
  const { manager, node } = fixture(t, { fallbackPlatforms: ['soundcloud'] });
  const identifiers = []; node.rest.loadTracks = async identifier => { identifiers.push(identifier); return { loadType: 'empty', data: {} }; };
  await manager.search({ query: 'http://localhost/tone.wav' }); assert.deepEqual(identifiers, ['http://localhost/tone.wav']);
  manager.options.sources.disabledSources = ['http'];
  manager.resolveNativeSource = async () => ({ loadType: 'track', data: record() });
  assert.equal((await manager.search({ query: 'native' })).tracks.length, 0);
});

test('an abort during native resolution consumes the late rejection', async t => {
  const { manager } = fixture(t); const abort = new AbortController();
  manager.resolveNativeSource = () => { abort.abort(); return Promise.reject(new Error('late native failure')); };
  await assert.rejects(manager.search({ query: 'native', signal: abort.signal }), /abort/i);
  await new Promise(resolve => setImmediate(resolve));
});

test('cache and fallback remain disabled unless explicitly configured', async t => {
  const { manager, node } = fixture(t); let calls = 0;
  node.rest.loadTracks = async () => { calls++; return { loadType: 'empty', data: {} }; };
  await manager.search({ query: 'a' }); await manager.search({ query: 'a' }); assert.equal(calls, 2);
});

test('real search HTTP timeouts abort the socket and HTTP 429 preserves status without fallback', async t => {
  const http = require('node:http'); const { once } = require('node:events');
  const { HttpError } = require('../dist');
  let requests = 0; let mode = '429';
  const server = http.createServer((_req, res) => { requests++; if (mode === '429') { res.writeHead(429, { 'content-type': 'application/json' }); res.end(JSON.stringify({ message: 'local rate limit' })); } });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
  const { manager, node } = fixture(t, { timeoutMs: 40, fallbackPlatforms: ['soundcloud'] });
  node.port = server.address().port;
  await assert.rejects(manager.search({ query: 'rate limited' }), error => error instanceof HttpError && error.statusCode === 429 && error.body.message === 'local rate limit');
  assert.equal(requests, 1);
  mode = 'hang'; await assert.rejects(manager.search({ query: 'timeout' }), /timeout|timed out/i); assert.equal(requests, 2);
  const controller = new AbortController(); const search = manager.search({ query: 'cancel', signal: controller.signal });
  const rejected = assert.rejects(search, /abort/i); setTimeout(() => controller.abort(), 10); await rejected;
});
