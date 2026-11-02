const test = require('node:test');
const assert = require('node:assert/strict');
const { createPlayer, createTrack, deferred } = require('./helpers/player.cjs');

function delayRecommendations(manager, candidate) {
  const started = deferred();
  const response = deferred();
  let first = true;
  manager.search = async () => {
    if (!first) return { loadType: 'empty', tracks: [] };
    first = false;
    started.resolve();
    return response.promise;
  };
  return {
    started: started.promise,
    release: () => response.resolve({ loadType: 'playlist', tracks: [candidate] }),
  };
}

const playbackRequests = requests => requests.filter(({ payload }) => payload.track?.encoded != null);

test('autoplay does not restart music after stop while recommendation search is pending', async t => {
  const { manager, node, player, requests } = createPlayer(t);
  const previous = createTrack('previous');
  player.current = previous;
  const search = delayRecommendations(manager, createTrack('recommended'));
  const autoplay = node.handleAutoPlay(player, previous);
  await search.started;
  await player.stop();
  search.release();

  assert.equal(await autoplay, false);
  assert.equal(player.current, null);
  assert.equal(player.playing, false);
  assert.equal(playbackRequests(requests).length, 0);
});

test('disabling autoplay cancels a pending recommendation search', async t => {
  const { manager, node, player, requests } = createPlayer(t);
  const previous = createTrack('previous');
  player.current = previous;
  const search = delayRecommendations(manager, createTrack('recommended'));
  const autoplay = node.handleAutoPlay(player, previous);
  await search.started;
  player.setAutoPlay(false);
  search.release();

  assert.equal(await autoplay, false);
  assert.equal(player.current, previous);
  assert.equal(playbackRequests(requests).length, 0);
});

test('disabling then re-enabling autoplay does not revive an older search', async t => {
  const { manager, node, player, requests } = createPlayer(t);
  const previous = createTrack('previous');
  player.current = previous;
  const search = delayRecommendations(manager, createTrack('recommended'));
  const autoplay = node.handleAutoPlay(player, previous);
  await search.started;
  player.setAutoPlay(false);
  player.setAutoPlay(true);
  search.release();

  assert.equal(await autoplay, false);
  assert.equal(playbackRequests(requests).length, 0);
});

test('destroy cancels autoplay without issuing a later play request', async t => {
  const { manager, node, player, requests } = createPlayer(t);
  const previous = createTrack('previous');
  player.current = previous;
  const search = delayRecommendations(manager, createTrack('recommended'));
  const autoplay = node.handleAutoPlay(player, previous);
  await search.started;
  await player.destroy('test cleanup');
  search.release();

  assert.equal(await autoplay, false);
  assert.equal(player.destroyed, true);
  assert.equal(playbackRequests(requests).length, 0);
});

test('explicit playback wins over an older pending autoplay search', async t => {
  const { manager, node, player, requests } = createPlayer(t);
  const previous = createTrack('previous');
  const explicit = createTrack('requested');
  player.current = previous;
  const search = delayRecommendations(manager, createTrack('recommended'));
  const autoplay = node.handleAutoPlay(player, previous);
  await search.started;
  assert.equal(await player.play({ track: explicit }), true);
  search.release();

  assert.equal(await autoplay, false);
  assert.equal(player.current, explicit);
  assert.deepEqual(playbackRequests(requests).map(({ payload }) => payload.track.encoded), [explicit.encoded]);
});

test('fetching autoplay recommendations never temporarily replaces the current track', async t => {
  const { manager, node, player } = createPlayer(t);
  const previous = createTrack('previous');
  player.current = null;
  const search = delayRecommendations(manager, createTrack('recommended'));
  const autoplay = node.handleAutoPlay(player, previous);
  await search.started;
  const currentDuringSearch = player.current;
  player.setAutoPlay(false);
  search.release();
  await autoplay;

  assert.equal(currentDuringSearch, null);
});

test('autoplay returns failure and emits no success when the play request fails', async t => {
  const { manager, node, player } = createPlayer(t);
  const previous = createTrack('previous');
  player.current = previous;
  player.recommendations = [createTrack('recommended')];
  node.rest.updatePlayer = async () => { throw new Error('audio backend unavailable'); };
  const successes = [];
  manager.on('autoPlayed', (...args) => successes.push(args));

  assert.equal(await node.handleAutoPlay(player, previous), false);
  assert.equal(successes.length, 0);
  assert.equal(player.current, previous);
});

test('autoplay plays a recommendation and emits success after the backend accepts it', async t => {
  const { manager, node, player, requests } = createPlayer(t);
  const previous = createTrack('previous');
  const recommended = createTrack('recommended');
  player.current = previous;
  player.recommendations = [recommended];
  const successes = [];
  manager.on('autoPlayed', (...args) => successes.push(args));

  assert.equal(await node.handleAutoPlay(player, previous), true);
  assert.equal(player.current, recommended);
  assert.deepEqual(playbackRequests(requests).map(({ payload }) => payload.track.encoded), [recommended.encoded]);
  assert.deepEqual(successes, [[player, recommended, previous]]);
});

test('autoplay reports no recommendation without changing playback when search is empty', async t => {
  const { node, player, requests } = createPlayer(t);
  const previous = createTrack('previous');
  player.current = previous;

  assert.equal(await node.handleAutoPlay(player, previous), false);
  assert.equal(player.current, previous);
  assert.equal(playbackRequests(requests).length, 0);
});

test('a cancelled track-end autoplay cannot clear a newer explicit track or emit queueEnd', async t => {
  const { manager, node, player } = createPlayer(t);
  const previous = createTrack('previous');
  const explicit = createTrack('explicit');
  player.current = previous;
  player.playing = true;
  const search = delayRecommendations(manager, createTrack('recommended'));
  const ends = [];
  manager.on('queueEnd', (...args) => ends.push(args));
  const ending = node.handleTrackEnd(player, { reason: 'finished', track: previous.toJSON() });
  await search.started;
  await player.play({ track: explicit });
  search.release();
  await ending;
  assert.equal(player.current, explicit);
  assert.equal(player.playing, true);
  assert.equal(ends.length, 0);
});

test('autoplay does not claim success when REST returns an empty acknowledgement', async t => {
  const { manager, node, player } = createPlayer(t);
  player.current = createTrack('previous');
  player.recommendations = [createTrack('recommended')];
  node.rest.updatePlayer = async () => null;
  const successes = [];
  manager.on('autoPlayed', (...args) => successes.push(args));
  assert.equal(await node.handleAutoPlay(player, player.current), false);
  assert.equal(successes.length, 0);
  assert.equal(player.queue.size, 0);
});
