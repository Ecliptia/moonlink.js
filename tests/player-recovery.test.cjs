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
  const config = { identifier: 'source', host: '127.0.0.1', port: 2333, password: 'test-only' };
  const manager = new Manager({ nodes: [config], send() {}, options: { database: { type: 'memory' } } });
  manager.database = new DatabaseManager(manager);
  manager.search = async () => ({ loadType: 'empty', tracks: [] });
  const source = new Node(manager, config);
  const target = new Node(manager, { ...config, identifier: 'target', port: 2334 });
  target.connected = true;
  const requests = [];
  for (const node of [source, target]) {
    node.rest.updatePlayer = async (guildId, payload) => {
      requests.push({ node, payload });
      return { guildId, ...payload };
    };
    node.rest.destroyPlayer = async () => null;
  }
  const player = new Player(manager, source, {
    guildId: '123456789012345678', voiceChannelId: '223456789012345678',
  });
  player.stopHealthCheck();
  player.voice.sessionId = 'test-session';
  player.voice.endpoint = 'test.invalid';
  player.voice.connect = async () => {};
  t.after(async () => { player.stopHealthCheck(); await source.destroy(); await target.destroy(); });
  return { manager, source, target, player, requests };
}

for (const accepted of [false, true]) {
  test(`transferNode propagates restart=${accepted} and only emits success when accepted`, async t => {
    const { manager, target, player } = fixture(t);
    player.restart = async () => accepted;
    const switched = [];
    manager.on('playerSwitchedNode', (...args) => switched.push(args));

    assert.equal(await player.transferNode(target), accepted);
    assert.equal(switched.length, accepted ? 1 : 0);
  });

  test(`restart propagates queued playback ${accepted ? 'success' : 'failure'}`, async t => {
    const { manager, source, player } = fixture(t);
    const queued = track('queued');
    player.queue.add(queued);
    if (!accepted) source.rest.updatePlayer = async () => { throw new Error('backend rejected playback'); };
    const resumed = [];
    manager.on('playerResumed', (...args) => resumed.push(args));

    assert.equal(await player.restart(), accepted);
    assert.equal(resumed.length, accepted ? 1 : 0);
    assert.equal(player.current, accepted ? queued : null);
    assert.deepEqual(player.queue.tracks, accepted ? [] : [queued]);
  });

  test(`stuck recovery reports ${accepted ? 'success' : 'failure'} when softRestart returns ${accepted}`, async t => {
    const { manager, player } = fixture(t);
    player.current = track('stream');
    player.current.isSeekable = false;
    player.softRestart = async () => accepted;
    const events = [];
    manager.on('playerRecoveryStarted', () => events.push('started'));
    manager.on('playerRecoverySuccess', () => events.push('success'));
    manager.on('playerRecoveryFailed', () => events.push('failed'));
    await player.recoverFromStuck();

    assert.deepEqual(events, ['started', accepted ? 'success' : 'failed']);
  });

  test(`softRestart ${accepted ? 'restores playback' : 'reports failed playback'} without duplicating the queue`, async t => {
    const { source, player, requests } = fixture(t);
    const current = track('current');
    current.position = 45000;
    player.current = current;
    player.playing = true;
    player.paused = true;
    player.stuckDetectionCount = 2;
    const queued = track('queued');
    player.queue.add(queued);
    if (!accepted) {
      source.rest.updatePlayer = async (_guildId, payload) => {
        if (payload.track?.encoded) throw new Error('backend rejected playback');
        return payload;
      };
    }

    assert.equal(await player.softRestart('test'), accepted);
    assert.equal(player.current, accepted ? current : null);
    assert.deepEqual(player.queue.tracks, accepted ? [queued] : [current, queued]);
    assert.equal(player.stuckDetectionCount, accepted ? 0 : 2);
    if (accepted) {
      assert.equal(player.current.position, 45000);
      assert.equal(player.paused, true);
      assert.equal(requests.find(({ payload }) => payload.track?.encoded)?.payload.position, 45000);
    }
  });
}

test('transferNode does not emit success when voice connection fails during restart', async t => {
  const { manager, target, player } = fixture(t);
  player.current = track('current');
  player.voice.connect = async () => { throw new Error('voice connection failed'); };
  const switched = [];
  manager.on('playerSwitchedNode', (...args) => switched.push(args));

  assert.equal(await player.transferNode(target), false);
  assert.equal(player.destroyed, true);
  assert.deepEqual(switched, []);
});

test('transferNode does not emit success when queued playback fails on the target', async t => {
  const { manager, target, player } = fixture(t);
  player.queue.add(track('queued'));
  target.rest.updatePlayer = async () => { throw new Error('target rejected playback'); };
  const events = [];
  manager.on('playerResumed', () => events.push('resumed'));
  manager.on('playerSwitchedNode', () => events.push('switched'));

  assert.equal(await player.transferNode(target), false);
  assert.deepEqual(events, []);
});
