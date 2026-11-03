const test = require('node:test');
const assert = require('node:assert/strict');
const { Manager, Node, Player, Track } = require('../dist/index.js');
const { DatabaseManager } = require('../dist/src/managers/DatabaseManager.js');

function track(identifier) {
  return new Track({
    encoded: `encoded-${identifier}`,
    info: {
      identifier, title: identifier, author: 'Test artist', length: 180000,
      sourceName: 'youtube', isSeekable: true, isStream: false, position: 0,
      uri: `https://www.youtube.com/watch?v=${identifier}`,
    },
  });
}

function fixture(t) {
  const config = { identifier: 'test', host: '127.0.0.1', port: 2333, password: 'test-only' };
  const manager = new Manager({ nodes: [config], send() {}, options: { database: { type: 'memory' } } });
  manager.database = new DatabaseManager(manager);
  const node = new Node(manager, config);
  const requests = [];
  node.rest.updatePlayer = async (guildId, payload) => {
    requests.push(payload);
    return { guildId, ...payload };
  };
  node.rest.destroyPlayer = async () => null;
  const player = new Player(manager, node, {
    guildId: '123456789012345678', voiceChannelId: '223456789012345678', autoPlay: true,
  });
  player.stopHealthCheck();
  player.voice.sessionId = 'test-session';
  player.voice.endpoint = 'test.invalid';
  player.current = track('previous');
  t.after(async () => { player.stopHealthCheck(); await node.destroy(); });

  let release;
  const pending = new Promise(resolve => { release = resolve; });
  let started;
  const searching = new Promise(resolve => { started = resolve; });
  let first = true;
  manager.search = async () => {
    if (!first) return { loadType: 'empty', tracks: [] };
    first = false;
    started();
    return pending;
  };
  return {
    manager, node, player, requests, searching,
    release: () => release({ loadType: 'playlist', tracks: [track('recommended')] }),
  };
}

for (const [name, cancel] of [
  ['stop', player => player.stop()],
  ['disabling autoplay', player => player.setAutoPlay(false)],
  ['disabling then re-enabling autoplay', player => { player.setAutoPlay(false); player.setAutoPlay(true); }],
  ['destroy', player => player.destroy('test')],
  ['explicit playback', player => player.play({ track: track('requested') })],
]) {
  test(`${name} cancels a pending autoplay recommendation search`, async t => {
    const f = fixture(t);
    const played = [];
    f.manager.on('autoPlayed', (...args) => played.push(args));
    const autoplay = f.node.handleAutoPlay(f.player, f.player.current);
    await f.searching;
    await cancel(f.player);
    const current = f.player.current;
    f.release();

    assert.equal(await autoplay, false);
    assert.equal(f.player.current, current);
    assert.equal(f.player.queue.size, 0);
    assert.deepEqual(f.player.recommendations, []);
    assert.deepEqual(played, []);
    assert.equal(f.requests.filter(payload => payload.track?.encoded === 'encoded-recommended').length, 0);
  });
}

test('a cancelled track-end search does not end or destroy newer playback', async t => {
  const f = fixture(t);
  f.player.autoLeave = true;
  const ended = [];
  f.manager.on('queueEnd', (...args) => ended.push(args));
  const ending = f.node.handleTrackEnd(f.player, { reason: 'finished', track: f.player.current.toJSON() });
  await f.searching;
  await f.player.play({ track: track('requested') });
  const current = f.player.current;
  f.release();
  await ending;

  assert.equal(f.player.current, current);
  assert.equal(f.player.playing, true);
  assert.equal(f.player.destroyed, false);
  assert.deepEqual(ended, []);
});

test('recommendation lookup does not temporarily replace the current track', async t => {
  const f = fixture(t);
  const previous = f.player.current;
  f.player.current = null;
  const autoplay = f.node.handleAutoPlay(f.player, previous);
  await f.searching;
  const duringSearch = f.player.current;
  await f.player.stop();
  f.release();
  await autoplay;

  assert.equal(duringSearch, null);
  assert.equal(f.player.current, null);
});

test('autoplay still plays a recommendation when no action cancels the search', async t => {
  const f = fixture(t);
  const previous = f.player.current;
  const played = [];
  f.manager.on('autoPlayed', (...args) => played.push(args));
  const autoplay = f.node.handleAutoPlay(f.player, previous);
  await f.searching;
  f.release();

  assert.equal(await autoplay, true);
  assert.equal(f.player.current.identifier, 'recommended');
  assert.deepEqual(played, [[f.player, f.player.current, previous]]);
});

test('stop cancels a lookup before the stop request is acknowledged', async t => {
  const f = fixture(t);
  const autoplay = f.node.handleAutoPlay(f.player, f.player.current);
  await f.searching;
  let acknowledge;
  const pending = new Promise(resolve => { acknowledge = resolve; });
  f.node.rest.updatePlayer = async (guildId, payload) => {
    f.requests.push(payload);
    return pending;
  };
  const stopping = f.player.stop();
  f.release();
  const result = await autoplay;
  acknowledge({});
  await stopping;

  assert.equal(result, false);
  assert.equal(f.player.current, null);
  assert.equal(f.requests.filter(payload => payload.track?.encoded != null).length, 0);
});

test('cancelling a fallback lookup does not start the subsequent recommendation search', async t => {
  const f = fixture(t);
  f.player.current.sourceName = 'spotify';
  const autoplay = f.node.handleAutoPlay(f.player, f.player.current);
  await f.searching;
  await f.player.stop();
  let subsequentSearches = 0;
  f.manager.search = async () => { subsequentSearches++; return { tracks: [track('recommended')] }; };
  f.release();

  assert.equal(await autoplay, false);
  assert.equal(subsequentSearches, 0);
  assert.deepEqual(f.player.recommendations, []);
});

test('an empty search still emits queueEnd and applies autoLeave', async t => {
  const f = fixture(t);
  f.player.autoLeave = true;
  f.manager.search = async () => ({ loadType: 'empty', tracks: [] });
  const ended = [];
  f.manager.on('queueEnd', (...args) => ended.push(args));
  await f.node.handleTrackEnd(f.player, { reason: 'finished', track: f.player.current.toJSON() });

  assert.equal(f.player.current, null);
  assert.equal(f.player.destroyed, true);
  assert.equal(ended.length, 1);
});
