const test = require('node:test');
const assert = require('node:assert/strict');
const { Node, Player } = require('../dist');
const { createPlayer, createTrack, deferred } = require('./helpers/player.cjs');
const { Rest } = require('../dist');
const { NodeState } = require('../dist/src/typings/types.js');

function targetNode(manager) {
  const node = new Node(manager, { identifier: 'target', host: '127.0.0.2', port: 2333, password: 'test' });
  node.connected = true;
  node.state = NodeState.READY;
  return node;
}

test('transferNode reports false and emits no success when restart returns false', async t => {
  const { manager, player } = createPlayer(t);
  player.restart = async () => false;
  const switched = [];
  manager.on('playerSwitchedNode', (...args) => switched.push(args));
  assert.equal(await player.transferNode(targetNode(manager)), false);
  assert.equal(switched.length, 0);
});

test('restart reports false and emits no resumed event if queued playback fails', async t => {
  const { manager, node, player } = createPlayer(t);
  player.voice.connect = async () => {};
  player.queue.add(createTrack('queued'));
  node.rest.updatePlayer = async () => { throw new Error('play rejected'); };
  const resumed = [];
  manager.on('playerResumed', (...args) => resumed.push(args));
  assert.equal(await player.restart(), false);
  assert.equal(resumed.length, 0);
});

test('a successful transfer restores track position, pause and volume without duplicating the queue', async t => {
  const { manager, player } = createPlayer(t);
  const target = targetNode(manager);
  const updates = [];
  target.rest.updatePlayer = async (_guild, payload) => { updates.push(payload); return payload; };
  player.voice.connect = async () => {};
  player.current = createTrack('current');
  player.current.position = 45000;
  player.set('lastState', { position: 45000, connected: true });
  player.volume = 60;
  player.paused = true;
  player.playing = true;
  const queued = createTrack('queued');
  player.queue.add(queued);
  assert.equal(await player.transferNode(target), true);
  assert.equal(player.node, target);
  assert.deepEqual(player.queue.tracks, [queued]);
  assert.ok(updates[0].voice);
  const playback = updates.find(update => update.track);
  assert.equal(playback.track.encoded, player.current.encoded);
  assert.equal(playback.position, 45000);
  assert.equal(playback.paused, true);
  assert.equal(playback.volume, 60);
});

test('stuck recovery emits failed rather than success when softRestart returns false', async t => {
  const { manager, player } = createPlayer(t);
  player.current = createTrack('stream');
  player.current.isSeekable = false;
  player.softRestart = async () => false;
  const results = [];
  manager.on('playerRecoverySuccess', () => results.push('success'));
  manager.on('playerRecoveryFailed', () => results.push('failed'));
  await player.recoverFromStuck();
  assert.deepEqual(results, ['failed']);
});

test('setVolumeAsync commits volume after acknowledgement and rejects failed updates', async t => {
  const { node, player } = createPlayer(t);
  const response = deferred();
  node.rest.updatePlayer = () => response.promise;
  const pending = player.setVolumeAsync(70);
  assert.equal(player.volume, 100);
  response.resolve({ volume: 70 });
  assert.equal(await pending, player);
  assert.equal(player.volume, 70);
  node.rest.updatePlayer = async () => { throw new Error('volume rejected'); };
  await assert.rejects(player.setVolumeAsync(20), /volume rejected/);
  assert.equal(player.volume, 70);
});

test('chainable setVolume surfaces async failures through playerVolumeError', async t => {
  const { manager, node, player } = createPlayer(t);
  node.rest.updatePlayer = async () => { throw new Error('volume rejected'); };
  const failure = new Promise(resolve => manager.on('playerVolumeError', (...args) => resolve(args)));
  assert.equal(player.setVolume(40), player);
  assert.equal(player.volume, 40);
  const [failedPlayer, error, volume] = await failure;
  assert.equal(failedPlayer, player);
  assert.match(error.message, /volume rejected/);
  assert.equal(volume, 40);
});

test('partial node failover reports only moved players and cleans up only failures', async t => {
  const { manager, node, player } = createPlayer(t);
  const target = targetNode(manager);
  manager.nodes.nodes.set(target.identifier, target);
  manager.options.node.autoMovePlayers = true;
  const failed = new Player(manager, node, { guildId: '323456789012345678', voiceChannelId: player.voiceChannelId });
  failed.stopHealthCheck();
  manager.players.players.set(failed.guildId, failed);
  player.transferNode = async () => { player.node = target; return true; };
  failed.transferNode = async () => false;
  const destroyed = [];
  player.destroy = async () => { destroyed.push(player); };
  failed.destroy = async () => { destroyed.push(failed); };
  const moved = [];
  manager.on('playersMoved', players => moved.push(...players));
  node.reconnectAttempts = node.retryAmount;
  await node.close({ code: 1006, reason: 'test' });
  assert.deepEqual(moved, [player]);
  assert.deepEqual(destroyed, [failed]);
});

test('transferNode accepts a configured node identifier', async t => {
  const { manager, player } = createPlayer(t);
  const target = targetNode(manager);
  manager.nodes.nodes.set(target.identifier, target);
  player.restart = async () => true;
  assert.equal(await player.transferNode(target.identifier), true);
  assert.equal(player.node, target);
});

test('softRestart cannot adopt a newer user play while its stop request is pending', async t => {
  const { node, player } = createPlayer(t);
  const original = createTrack('old');
  const replacement = createTrack('new');
  player.current = original;
  player.playing = true;
  const started = deferred();
  const release = deferred();
  let delayed = false;
  node.rest.updatePlayer = async (_guild, payload) => {
    if (!delayed && payload.track?.encoded === null) {
      delayed = true;
      started.resolve();
      await release.promise;
    }
    return payload;
  };
  const recovery = player.softRestart('test');
  await started.promise;
  const explicit = player.play({ track: replacement });
  release.resolve();
  await explicit;
  assert.equal(await recovery, false);
  assert.equal(player.current, replacement);
  assert.equal(player.queue.size, 0);
});

test('REST recovery cancellation never destroys newer playback', async t => {
  const { node, player } = createPlayer(t);
  player.current = createTrack('old');
  const started = deferred();
  const release = deferred();
  node.rest.updatePlayer = async (_guild, payload) => {
    if (payload.track?.encoded === null) { started.resolve(); await release.promise; }
    return payload;
  };
  const rest = new Rest(node);
  const recovering = rest.triggerPlayerRecovery(player);
  await started.promise;
  const replacement = createTrack('new');
  const playing = player.play({ track: replacement });
  release.resolve();
  await playing;
  await recovering;
  assert.equal(player.destroyed, false);
  assert.equal(player.current, replacement);
});

test('a stale restart connection failure cannot destroy a newer user stop', async t => {
  const { player } = createPlayer(t);
  const response = deferred();
  player.voice.connect = () => response.promise;
  const restarting = player.restart();
  await player.stop();
  response.reject(new Error('old connection failed'));
  assert.equal(await restarting, false);
  assert.equal(player.destroyed, false);
});

test('an older async volume acknowledgement does not overwrite a newer chainable volume', async t => {
  const { player, requests } = createPlayer(t);
  const older = player.setVolumeAsync(20);
  player.setVolume(40);
  await older;
  await player.updatePlayer({ position: 0 });
  assert.deepEqual(requests.filter(r => r.payload.volume != null).map(r => r.payload.volume), [20, 40]);
  assert.equal(player.volume, 40);
  await player.play({ track: createTrack('requested') });
  assert.equal(requests.at(-1).payload.volume, 40);
});
