const test = require('node:test');
const assert = require('node:assert/strict');
const { Manager } = require('../dist');
const { Memory } = require('../dist/src/database/Memory');
const { DatabaseManager } = require('../dist/src/managers/DatabaseManager');
const { deferred } = require('./helpers/player.cjs');

function database(adapter) {
  const manager = new Manager({ nodes: [{ host: '127.0.0.1', port: 2333, password: 'test' }], options: { database: { type: 'memory', adapter } } });
  return new DatabaseManager(manager);
}

test('custom storage receives initialization options and flush waits for earlier writes', async () => {
  const adapter = new Memory();
  const entered = deferred();
  const release = deferred();
  adapter.set = async function (key, value) {
    if (value === 1) { entered.resolve(); await release.promise; }
    return Memory.prototype.set.call(this, key, value);
  };
  let initialized = false;
  adapter.init = async () => { initialized = true; };
  const db = database(adapter);
  assert.equal(db.provider, adapter);
  await db.initialize();
  assert.equal(initialized, true);
  const first = db.set('value', 1);
  await entered.promise;
  const second = db.set('value', 2);
  let finished = false;
  const flushing = db.flush().then(() => { finished = true; });
  await Promise.resolve();
  assert.equal(finished, false);
  release.resolve();
  await Promise.all([first, second, flushing]);
  assert.equal(await db.get('value'), 2);
  await db.shutdown();
  await assert.rejects(db.set('value', 3), /shutting down/);
});

test('failed adapter mutations reject their caller without blocking later writes', async () => {
  const adapter = new Memory();
  adapter.set = async function (key, value) {
    if (value === 'fail') throw new Error('storage unavailable');
    return Memory.prototype.set.call(this, key, value);
  };
  const db = database(adapter);
  await assert.rejects(db.set('value', 'fail'), /storage unavailable/);
  await db.set('value', 'saved');
  assert.equal(await db.get('value'), 'saved');
  await db.shutdown();
});
