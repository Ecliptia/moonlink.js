const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { Local } = require('../dist/src/database/Local');

async function storage(t, initialFiles = {}) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'nyxlink-storage-'));
  const active = new Set();
  const manager = {
    clientId: 'storage-test',
    options: { database: { type: 'local', options: { path: directory } } },
    emit() {},
  };
  t.after(async () => {
    for (const provider of active) await provider.shutdown();
    await fs.rm(directory, { recursive: true, force: true });
  });
  for (const [extension, data] of Object.entries(initialFiles)) {
    await fs.writeFile(path.join(directory, `data.storage-test.${extension}`), data);
  }
  return {
    directory,
    async open() {
      const provider = new Local();
      await provider.init(manager);
      active.add(provider);
      return provider;
    },
    async close(provider) {
      active.delete(provider);
      await provider.shutdown();
    },
  };
}

test('local storage replays legacy snapshots and WAL before accepting new writes', async t => {
  const lab = await storage(t, {
    json: JSON.stringify({ data: { players: { guild: { volume: 50 } }, removeMe: true } }),
    wal: 's|nodes.audio|{"sessionId":"local-fixture"}\ns|players.guild.volume|35\nd|removeMe\n',
  });
  const provider = await lab.open();
  assert.equal(await provider.get('players.guild.volume'), 35);
  assert.equal(await provider.get('nodes.audio.sessionId'), 'local-fixture');
  assert.equal(await provider.has('removeMe'), false);
  await provider.set('players.guild.paused', true);
  assert.equal(await provider.remove('nodes.audio'), true);
  await lab.close(provider);
  const reopened = await lab.open();
  assert.equal(await reopened.get('players.guild.paused'), true);
  assert.equal(await reopened.has('nodes.audio'), false);
});

test('local storage remains writable after clear and survives a graceful reopen', async t => {
  const lab = await storage(t);
  const provider = await lab.open();
  await provider.set('old', true);
  await provider.clear();
  await provider.set('players.guild.volume', 35);
  await lab.close(provider);
  const reopened = await lab.open();
  assert.equal(await reopened.has('old'), false);
  assert.equal(await reopened.get('players.guild.volume'), 35);
});

test('local storage continues writing its WAL after clear for crash recovery', async t => {
  const lab = await storage(t);
  const provider = await lab.open();
  await provider.set('old', true);
  await provider.clear();
  await provider.set('players.guild.volume', 35);
  // Trigger the buffered flush directly rather than waiting on a wall-clock interval.
  if (provider.flush) await provider.flush();
  else await provider._flushWALBuffer();
  if (provider.walStream) {
    await new Promise((resolve, reject) => provider.walStream.write('', error => error ? reject(error) : resolve()));
  }
  // Open before graceful shutdown: recovery must use the empty snapshot plus WAL.
  const recovered = await lab.open();
  assert.equal(await recovered.has('old'), false);
  assert.equal(await recovered.get('players.guild.volume'), 35);
});

test('local storage rejects writes through prototype paths', async t => {
  const lab = await storage(t);
  const provider = await lab.open();
  t.after(() => { delete Object.prototype.nyxlinkStoragePolluted; });
  try {
    await assert.rejects(provider.set('__proto__.nyxlinkStoragePolluted', true), TypeError);
    assert.equal({}.nyxlinkStoragePolluted, undefined);
  } finally {
    delete Object.prototype.nyxlinkStoragePolluted;
  }
});

test('local storage never returns inherited properties', async t => {
  const lab = await storage(t);
  const provider = await lab.open();
  await provider.set('safe', {});
  assert.equal(await provider.get('safe.constructor'), undefined);
  assert.equal(await provider.get('safe.toString'), undefined);
});

test('local storage treats punctuation literally in wildcard key patterns', async t => {
  const lab = await storage(t);
  const provider = await lab.open();
  await provider.set('what?', 1);
  await provider.set('what', 2);
  await provider.set('prefix-what?', 3);
  assert.deepEqual(await provider.keys('what?'), ['what?']);
  assert.deepEqual(await provider.keys('what*'), ['what?', 'what']);
});

test('an acknowledged write racing with shutdown survives reopen or is explicitly rejected', async t => {
  const lab = await storage(t);
  const provider = await lab.open();
  await provider.set('before', true);
  const rename = fs.rename;
  let releaseRename;
  let reachedRename;
  const release = new Promise(resolve => { releaseRename = resolve; });
  const reached = new Promise(resolve => { reachedRename = resolve; });
  const snapshot = path.join(lab.directory, 'data.storage-test.json');
  fs.rename = async (from, to) => {
    if (to === snapshot) {
      reachedRename();
      await release;
    }
    return rename(from, to);
  };
  let accepted = false;
  const closing = lab.close(provider);
  try {
    await reached;
    try {
      await provider.set('duringShutdown', 42);
      accepted = true;
    } catch (error) {
      assert.ok(error instanceof Error);
    }
  } finally {
    fs.rename = rename;
    releaseRename();
    await closing;
  }
  const reopened = await lab.open();
  assert.equal(await reopened.get('before'), true);
  if (accepted) assert.equal(await reopened.get('duringShutdown'), 42);
});

test('a truncated WAL tail does not swallow later acknowledged writes during recovery', async t => {
  const lab = await storage(t, {
    json: JSON.stringify({ data: { fromSnapshot: true } }),
    wal: 's|fromWal|true\n{"op":"set","key":"interrupted',
  });
  const provider = await lab.open();
  assert.equal(await provider.get('fromWal'), true);
  await provider.set('afterRecovery', 42);
  const recovered = await lab.open();
  assert.equal(await recovered.get('fromSnapshot'), true);
  assert.equal(await recovered.get('fromWal'), true);
  assert.equal(await recovered.get('afterRecovery'), 42);
});

test('a disk append failure rejects the mutation without replacing the last persisted value', async t => {
  const lab = await storage(t);
  const provider = await lab.open();
  await provider.set('value', 'saved');
  const appendFile = fs.appendFile;
  const wal = path.join(lab.directory, 'data.storage-test.wal');
  fs.appendFile = async (file, ...args) => {
    if (file === wal) throw Object.assign(new Error('fixture disk full'), { code: 'ENOSPC' });
    return appendFile(file, ...args);
  };
  try {
    await assert.rejects(provider.set('value', 'lost'), { code: 'ENOSPC' });
    assert.equal(await provider.get('value'), 'saved');
  } finally {
    fs.appendFile = appendFile;
  }
  await lab.close(provider);
  const reopened = await lab.open();
  assert.equal(await reopened.get('value'), 'saved');
});
