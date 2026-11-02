const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Manager } = require('../../dist');
const { event } = require('../helpers/v4-server.cjs');

const lab = JSON.parse(process.env.NYXLINK_BACKENDS_JSON || 'null');
if (!lab) throw new Error('Run pnpm run test:backends to create the isolated server lab.');
const evidence = [];

for (const backend of lab.backends) {
  test(`${backend.kind}: real v4 REST, WebSocket, auth and reconnection without Discord`, async t => {
    const manager = new Manager({
      nodes: [{ ...backend, retryAmount: 2, retryDelay: 25 }], send() {},
      options: { database: { type: 'memory' }, resume: true, resumeTimeout: 30000 },
    });
    const errors = [];
    manager.on('nodeError', (_node, error) => errors.push(error));
    t.after(async () => {
      await manager.nodes.nodes.get(backend.identifier)?.destroy();
      await manager.database?.shutdown();
    });
    const ready = event(manager, 'nodeReady', 15000);
    await manager.init('123456789012345678');
    const [node] = await ready;
    const checks = [];
    await t.test('identity, version, info, source capabilities and stats', async () => {
      assert.equal(node.backend.kind, backend.kind);
      assert.equal(node.backend.version, backend.version);
      assert.ok(node.capabilities.has('source:http'));
      const stats = await node.rest.getStats();
      assert.equal(typeof stats.players, 'number');
      assert.ok(Number.isFinite(stats.cpu.systemLoad));
      checks.push('ready/info/stats');
    });
    let track;
    await t.test('load and decode generated HTTP audio', async () => {
      const loaded = await node.rest.loadTracks(lab.mediaUrl);
      assert.equal(loaded.loadType, 'track', JSON.stringify(loaded));
      track = loaded.data;
      assert.equal(typeof track.encoded, 'string');
      const decoded = await node.rest.decodeTrack(track.encoded);
      assert.equal(decoded.info.identifier, track.info.identifier);
      const results = await manager.search({ query: lab.mediaUrl, node: node.identifier });
      assert.equal(results.tracks.length, 1);
      checks.push('HTTP load/decode/search');
    });
    const guild = '223456789012345678';
    await t.test('create/update/delete a player without sending voice credentials or starting playback', async () => {
      const player = await node.rest.updatePlayer(guild, { volume: 35, paused: true });
      assert.equal(player.guildId, guild);
      assert.equal(player.volume, 35);
      assert.equal(player.paused, true);
      const players = await node.rest.getPlayers();
      assert.ok(players.some(value => value.guildId === guild));
      await node.rest.updatePlayer(guild, { volume: 50, position: 0, track: { encoded: null } });
      await node.rest.destroyPlayer(guild);
      assert.equal((await node.rest.getPlayers()).some(value => value.guildId === guild), false);
      checks.push('player lifecycle without voice/audio');
    });
    await t.test('unavailable optional endpoints fail explicitly', async () => {
      if (backend.kind === 'lavalink') {
        await assert.rejects(node.rest.getMixLayers(guild), { code: 'FEATURE_UNAVAILABLE' });
      } else {
        assert.equal(node.backend.featureStatus('trackstream'), 'unknown');
        await assert.rejects(node.rest.trackStream(track.encoded), { code: 'FEATURE_UNAVAILABLE' });
        assert.equal(node.backend.featureStatus('trackstream'), 'unavailable');
      }
      checks.push('optional capability guard');
    });
    await t.test('reconnect resumes a confirmed session without issuing playback', async () => {
      const enabled = await node.rest.updateSession(true, 30);
      assert.equal(enabled.resuming, true);
      const session = node.sessionId;
      const resumed = event(manager, 'nodeReady', 15000);
      node.socket.close(1000, 'Local protocol resume check');
      const [, payload] = await resumed;
      assert.equal(payload.resumed, true);
      assert.equal(node.sessionId, session);
      assert.equal(node.backend.kind, backend.kind);
      checks.push('session resume');
    });
    await t.test('reconnect without resume obtains a new session', async () => {
      manager.options.resume = false;
      const session = node.sessionId;
      const fresh = event(manager, 'nodeReady', 15000);
      node.socket.close(1000, 'Local protocol fresh-session check');
      const [, payload] = await fresh;
      assert.equal(payload.resumed, false);
      assert.notEqual(node.sessionId, session);
      checks.push('new session');
    });
    await t.test('wrong credentials produce a terminal auth error', async () => {
      const wrong = new Manager({ nodes: [{ ...backend, identifier: 'bad-auth', password: 'deliberately-wrong', retryAmount: 2, retryDelay: 10 }], options: { database: { type: 'memory' }, resume: false } });
      const failures = [];
      let retries = 0;
      wrong.on('nodeError', (_node, error) => failures.push(error));
      wrong.on('nodeReconnecting', () => retries++);
      t.after(async () => { await wrong.nodes.nodes.get('bad-auth')?.destroy(); await wrong.database?.shutdown(); });
      const ended = event(wrong, 'nodeDestroy', 15000);
      await wrong.init('323456789012345678');
      await ended;
      assert.ok([401, 403].includes(failures[0]?.statusCode));
      assert.equal(retries, 0);
      checks.push('terminal auth failure');
    });
    assert.equal(errors.length, 0, errors.map(error => error.message).join('; '));
    evidence.push({ backend: backend.kind, version: backend.version, image: backend.image, checks, discordAudio: 'not-tested', passed: checks.length === 7 && errors.length === 0 });
  });
}

test.after(async () => {
  const report = { timestamp: new Date().toISOString(), scope: 'local backend protocol; no Discord bot or voice connection', passed: evidence.length === lab.backends.length && evidence.every(result => result.passed), results: evidence };
  const target = path.resolve(lab.directory, '../latest-report.json');
  await fs.writeFile(target, JSON.stringify(report, null, 2) + '\n');
  console.log(`Protocol evidence: ${path.relative(process.cwd(), target)}`);
});
