const test = require('node:test');
const assert = require('node:assert/strict');
const { createPlayer, createTrack, deferred } = require('./helpers/player.cjs');

test('destroy removes the persisted player record after its pending writes', async t => {
  const { manager, player } = createPlayer(t);
  await player.updateData('current', createTrack('old').toJSON());
  player.queue.add(createTrack('queued'));
  await player.destroy('retention regression');
  await manager.database.flush();
  assert.equal(await manager.database.has(`players.${player.guildId}`), false);
  assert.deepEqual(await manager.database.keys('players.*'), []);
});

test('concurrent destroy calls wait for the same player cleanup', async t => {
  const { node, player } = createPlayer(t);
  const entered = deferred(); const release = deferred();
  node.rest.destroyPlayer = async () => { entered.resolve(); await release.promise; };
  const first = player.destroy('first'); await entered.promise;
  let secondFinished = false;
  const second = player.destroy('second').then(() => { secondFinished = true; });
  await Promise.resolve(); const prematurelyFinished = secondFinished;
  release.resolve(); await Promise.all([first, second]);
  assert.equal(prematurelyFinished, false);
});
