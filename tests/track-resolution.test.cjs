const test = require('node:test');
const assert = require('node:assert/strict');
const { Node, Track, BackendDetector } = require('../dist');
const { NodeState } = require('../dist/src/typings/types');
const { createPlayer, createTrack, deferred } = require('./helpers/player.cjs');

function target(manager) {
  const node = new Node(manager, { identifier: 'target', host: '127.0.0.1', port: 2440, password: 'test' });
  node.backend = BackendDetector.detect({ isNodelink: true, version: { semver: '3.10.0' } });
  node.isNodeLink = true; node.connected = true; node.state = NodeState.READY;
  node.rest.updatePlayer = async (_guild, payload) => payload;
  node.rest.destroyPlayer = async () => {};
  manager.nodes.nodes.set(node.identifier, node);
  return node;
}

function migrated(track) { return { ...track.toJSON(), encoded: 'destination-encoding' }; }

test('track snapshots restore opaque encodings with metadata, requester and backend provenance', () => {
  const { TrackCodec } = require('../dist/src/tracks/TrackCodec');
  const track = createTrack('opaque'); track.backend = 'nodelink'; track.position = 45000;
  track.setRequester({ id: 'requester' }); track.userData.custom = 'kept'; track.origin = 'original';
  const snapshot = JSON.parse(JSON.stringify(TrackCodec.serialize(track)));
  const restored = TrackCodec.restore(snapshot);
  assert.equal(restored.encoded, track.encoded);
  assert.equal(restored.position, 45000);
  assert.deepEqual(restored.userData, track.userData);
  assert.deepEqual(restored.requester, track.requester);
  assert.equal(restored.backend, 'nodelink'); assert.equal(restored.origin, 'original');
});

test('cross-backend transfer loads destination encoding before deleting the original player', async t => {
  const { manager, node: source, player } = createPlayer(t);
  source.backend = BackendDetector.detect({ version: { semver: '4.2.2' } });
  const destination = target(manager);
  const current = createTrack('current'); current.backend = 'lavalink'; current.position = 12000;
  player.current = current; player.paused = true; player.playing = true;
  const queued = createTrack('queued'); queued.backend = 'lavalink'; player.queue.add(queued);
  player.voice.connect = async () => {};
  let originalDeleted = false;
  source.rest.destroyPlayer = async () => { originalDeleted = true; };
  destination.rest.loadTracks = async identifier => {
    assert.equal(originalDeleted, false); assert.equal(identifier, current.uri);
    return { loadType: 'track', data: migrated(current) };
  };
  const payloads = [];
  destination.rest.updatePlayer = async (_guild, payload) => { payloads.push(payload); return payload; };
  assert.equal(await player.transferNode(destination), true);
  assert.equal(player.current.encoded, 'destination-encoding');
  assert.equal(player.current.backend, 'nodelink');
  assert.equal(player.current.position, 12000); assert.equal(player.paused, true);
  assert.deepEqual(player.queue.tracks, [queued]);
  assert.equal(payloads.find(p => p.track?.encoded).track.encoded, 'destination-encoding');
});

test('failed track resolution leaves the original node, current track and queue intact', async t => {
  const { manager, node: source, player } = createPlayer(t);
  source.backend = BackendDetector.detect({ version: { semver: '4.2.2' } });
  const destination = target(manager);
  player.current = createTrack('current');
  let deleted = false; source.rest.destroyPlayer = async () => { deleted = true; };
  destination.rest.loadTracks = async () => ({ loadType: 'empty', data: {} });
  const original = player.current;
  assert.equal(await player.transferNode(destination), false);
  assert.equal(deleted, false); assert.equal(player.node, source); assert.equal(player.current, original);
});

test('stop cancels deferred cross-backend resolution before cleanup or playback', async t => {
  const { manager, node: source, player } = createPlayer(t);
  source.backend = BackendDetector.detect({ version: { semver: '4.2.2' } });
  const destination = target(manager); const current = createTrack('current'); player.current = current;
  const started = deferred(); const release = deferred();
  destination.rest.loadTracks = async () => { started.resolve(); return release.promise; };
  let deleted = false; source.rest.destroyPlayer = async () => { deleted = true; };
  const moving = player.transferNode(destination);
  // Baseline does not resolve tracks; allow the baseline failure to complete without hanging.
  await Promise.race([started.promise, moving]);
  const stopping = player.stop(); release.resolve({ loadType: 'track', data: migrated(current) });
  assert.equal(await moving, false); await stopping;
  assert.equal(deleted, false); assert.equal(player.current, null);
});

test('queued tracks from another backend are resolved lazily on play', async t => {
  const { manager, player } = createPlayer(t); player.node = target(manager);
  const queued = createTrack('queued'); queued.backend = 'lavalink'; queued.userData.custom = 'kept';
  player.queue.add(queued);
  player.node.rest.loadTracks = async () => ({ loadType: 'track', data: migrated(queued) });
  assert.equal(await player.play(), true);
  assert.equal(player.current.encoded, 'destination-encoding');
  assert.equal(player.current.userData.custom, 'kept'); assert.equal(player.current.backend, 'nodelink');
});

test('transfer persists inferred backend provenance for legacy queue and history tracks', async t => {
  const { manager, node: source, player } = createPlayer(t);
  source.backend = BackendDetector.detect({ version: { semver: '4.2.2' } });
  const destination = target(manager);
  const queued = createTrack('legacy-queue');
  const previous = createTrack('legacy-history');
  player.queue.add(queued);
  player.previous.push(previous);
  await player.updateData('previous', [previous.toJSON()]);
  player.voice.connect = async () => {};
  assert.equal(await player.transferNode(destination), true);
  await manager.database.flush();
  const saved = await manager.database.get(`players.${player.guildId}`);
  assert.equal(queued.backend, 'lavalink');
  assert.equal(previous.backend, 'lavalink');
  assert.equal(saved.queue[0].backend, 'lavalink');
  assert.equal(saved.previous[0].backend, 'lavalink');
});

test('stop during deferred queued-track resolution retains the original queued track', async t => {
  const { manager, player } = createPlayer(t);
  player.node = target(manager);
  const queued = createTrack('queued'); queued.backend = 'lavalink';
  player.queue.add(queued);
  const started = deferred();
  const release = deferred();
  player.node.rest.loadTracks = async () => { started.resolve(); return release.promise; };
  const playback = [];
  player.node.rest.updatePlayer = async (_guild, payload) => { playback.push(payload); return payload; };
  const playing = player.play();
  await Promise.race([started.promise, playing]);
  const stopping = player.stop();
  release.resolve({ loadType: 'track', data: migrated(queued) });
  assert.equal(await playing, false);
  await stopping;
  assert.deepEqual(player.queue.tracks, [queued]);
  assert.equal(player.current, null);
  assert.equal(playback.some(payload => payload.track?.encoded), false);
});

test('metadata snapshots and legacy encoded-only records both reconstruct Player tracks', async t => {
  const { TrackCodec, Player } = require('../dist');
  const { manager, node } = createPlayer(t);
  const original = createTrack('legacy'); original.backend = 'lavalink'; original.position = 27000;
  const legacy = { encoded: TrackCodec.encode(original.toJSON().info), requester: { id: 'legacy-requester' }, position: 1234 };
  assert.equal(TrackCodec.restore(legacy).position, 1234);
  const restored = new Player(manager, node, {
    guildId: '423456789012345678', voiceChannelId: '223456789012345678',
    current: TrackCodec.serialize(original), queue: [TrackCodec.serialize(original)], previous: [legacy],
  });
  restored.stopHealthCheck(); t.after(() => restored.voice.destroy());
  assert.equal(restored.current.encoded, original.encoded);
  assert.equal(restored.current.position, 27000);
  assert.equal(restored.queue.first.backend, 'lavalink');
  assert.equal(restored.previous[0].requester.id, 'legacy-requester');
});

test('invalid destination metadata is rejected before replacing the original player', async t => {
  const { manager, node: source, player } = createPlayer(t);
  source.backend = BackendDetector.detect({ version: { semver: '4.2.2' } });
  player.current = createTrack('current'); const destination = target(manager);
  destination.rest.loadTracks = async () => ({ loadType: 'track', data: { encoded: 'bad', info: {} } });
  let deleted = false; source.rest.destroyPlayer = async () => { deleted = true; };
  assert.equal(await player.transferNode(destination), false);
  assert.equal(deleted, false); assert.equal(player.node, source);
});

test('NodeLink HTTP tracks preserve the documented unknown-duration sentinel', async t => {
  const { TrackResolver } = require('../dist');
  const { manager, node } = createPlayer(t);
  node.backend = BackendDetector.detect({ version: { semver: '4.2.2' } });
  const destination = target(manager); const original = createTrack('http'); original.backend = 'lavalink';
  const data = migrated(original); data.info.length = -1;
  destination.rest.loadTracks = async () => ({ loadType: 'track', data });
  const resolved = await TrackResolver.resolve(original, destination, node);
  assert.equal(resolved.duration, -1);
  assert.equal(resolved.backend, 'nodelink');
});
