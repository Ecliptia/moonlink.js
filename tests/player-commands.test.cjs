const test = require('node:test');
const assert = require('node:assert/strict');
const { createPlayer, createTrack, deferred } = require('./helpers/player.cjs');

test('a delayed play is settled before stop reaches the backend', async t => {
  const { node, player } = createPlayer(t);
  const sent = deferred();
  const release = deferred();
  const applied = [];
  node.rest.updatePlayer = async (_guild, payload) => {
    if (payload.track?.encoded) { sent.resolve(); await release.promise; }
    applied.push(payload);
    return payload;
  };
  const play = player.play({ track: createTrack('old') });
  await sent.promise;
  const stop = player.stop();
  release.resolve();
  await Promise.all([play, stop]);
  assert.deepEqual(applied.map(p => p.track?.encoded), ['encoded-old', null]);
  assert.equal(player.current, null);
  assert.equal(player.playing, false);
});

test('stop completes before a later explicit play reaches the backend', async t => {
  const { node, player } = createPlayer(t);
  const stopped = deferred();
  const release = deferred();
  const applied = [];
  node.rest.updatePlayer = async (_guild, payload) => {
    if (payload.track?.encoded === null) { stopped.resolve(); await release.promise; }
    applied.push(payload);
    return payload;
  };
  const stop = player.stop();
  await stopped.promise;
  const track = createTrack('new');
  const play = player.play({ track });
  release.resolve();
  await Promise.all([stop, play]);
  assert.deepEqual(applied.map(p => p.track?.encoded), [null, track.encoded]);
  assert.equal(player.current, track);
  assert.equal(player.playing, true);
});

test('pause then resume both apply when pause acknowledgement is delayed', async t => {
  const { node, player } = createPlayer(t);
  player.current = createTrack('current');
  player.playing = true;
  const started = deferred();
  const release = deferred();
  const applied = [];
  node.rest.updatePlayer = async (_guild, payload) => {
    if (payload.paused) { started.resolve(); await release.promise; }
    applied.push(payload);
    return payload;
  };
  const pause = player.pause();
  await started.promise;
  const resume = player.resume();
  release.resolve();
  await Promise.all([pause, resume]);
  assert.deepEqual(applied, [{ paused: true }, { paused: false }]);
  assert.equal(player.paused, false);
});

test('destroy waits for in-flight playback and leaves no active backend player', async t => {
  const { node, player } = createPlayer(t);
  const started = deferred();
  const release = deferred();
  let backendTrack = null;
  node.rest.updatePlayer = async (_guild, payload) => {
    started.resolve();
    await release.promise;
    backendTrack = payload.track?.encoded;
    return payload;
  };
  node.rest.destroyPlayer = async () => { backendTrack = null; };
  const play = player.play({ track: createTrack('obsolete') });
  await started.promise;
  const destroy = player.destroy('test');
  release.resolve();
  await Promise.all([play, destroy]);
  assert.equal(backendTrack, null);
  assert.equal(player.destroyed, true);
  assert.equal(player.playing, false);
});

test('a rejected command does not prevent later seek and stop commands', async t => {
  const { node, player, requests } = createPlayer(t);
  const original = node.rest.updatePlayer;
  node.rest.updatePlayer = async (guild, payload) => {
    if (payload.paused) throw new Error('pause rejected');
    return original(guild, payload);
  };
  await assert.rejects(player.pause(), /pause rejected/);
  await player.seek(1000);
  await player.stop();
  assert.deepEqual(requests.map(r => r.payload), [{ position: 1000 }, { track: { encoded: null } }]);
});

test('a timed-out resume still finishes before a later stop reaches the backend', async t => {
  const { node, player } = createPlayer(t);
  player.paused = true;
  const started = deferred();
  const release = deferred();
  const applied = [];
  node.rest.updatePlayer = async (_guild, payload) => {
    if (payload.paused === false) { started.resolve(); await release.promise; }
    applied.push(payload);
    return payload;
  };
  const resume = player.resume({ timeout: 10 });
  const rejected = assert.rejects(resume, /Resume timed out/);
  await started.promise;
  await rejected;
  const stop = player.stop();
  release.resolve();
  await stop;
  assert.deepEqual(applied, [{ paused: false }, { track: { encoded: null } }]);
  assert.equal(player.playing, false);
});

test('empty REST responses reject stop and preserve the known playing state', async t => {
  const { node, player } = createPlayer(t);
  const current = createTrack('current');
  player.current = current;
  player.playing = true;
  node.rest.updatePlayer = async () => null;
  await assert.rejects(player.stop(), /acknowledge/);
  assert.equal(player.current, current);
  assert.equal(player.playing, true);
});
