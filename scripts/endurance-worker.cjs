const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { performance, monitorEventLoopDelay } = require('node:perf_hooks');
const { setTimeout: delay } = require('node:timers/promises');
const { Manager, Track } = require('../dist');
const { event } = require('../tests/helpers/v4-server.cjs');

const lab = JSON.parse(process.env.NYXLINK_BACKENDS_JSON || 'null');
if (!lab) throw new Error('Run test:endurance to create the isolated server lab');
const durationSeconds = Number(process.argv[2]);
if (!Number.isInteger(durationSeconds) || durationSeconds < 10 || durationSeconds > 7200) throw new Error('Invalid endurance duration');
const contexts = [];
const samples = [];
const failures = [];
const loop = monitorEventLoopDelay({ resolution: 10 });
const latency = {};

function summary(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const percentile = rank => sorted.length ? sorted[Math.max(0, Math.ceil(sorted.length * rank) - 1)] : null;
  return { count: sorted.length, p50Ms: percentile(0.5), p95Ms: percentile(0.95), maxMs: sorted.at(-1) ?? null };
}

async function measured(name, operation) {
  const start = performance.now();
  try { return await operation(); }
  finally { (latency[name] ??= []).push(performance.now() - start); }
}

async function cycle(context) {
  const { manager, node, backend } = context;
  const guildId = String(600000000000000000n + BigInt(context.cycles * 10 + context.index));
  await measured(`${backend.kind}.patch`, () => node.rest.updatePlayer(guildId, { volume: 35, paused: true }));
  const player = manager.players.create({ guildId, voiceChannelId: '723456789012345678' });
  try {
    player.queue.add(Array.from({ length: 16 }, () => context.track.clone()));
    await player.setVolumeAsync(45);
    await player.stop();
    assert.equal(player.queue.size, 16);
    assert.equal(player.current, null);
  } finally { await player.destroy('Local endurance cycle'); }
  await manager.database.flush();
  assert.equal(manager.players.size, 0);
  assert.equal(await manager.database.has(`players.${guildId}`), false);
  assert.equal((await node.rest.getPlayers()).length, 0);
  if (context.cycles % 10 === 0) {
    const loaded = await measured(`${backend.kind}.load`, () => node.rest.loadTracks(lab.mediaUrl, { timeoutMs: 10000 }));
    assert.equal(loaded.loadType, 'track');
    const decoded = await node.rest.decodeTrack(loaded.data.encoded);
    assert.equal(decoded.info.identifier, context.track.identifier);
    context.stats = await node.rest.getStats();
    assert.ok(Number.isFinite(context.stats.cpu.systemLoad));
    await measured(`${backend.kind}.ping`, () => node.socket.ping());
    context.pings++;
  }
  if (performance.now() >= context.nextResume) {
    await node.rest.updateSession(true, 60);
    const sessionId = node.sessionId;
    await measured(`${backend.kind}.resume`, async () => {
      const resumed = event(manager, 'nodeReady', 15000);
      // Abrupt TCP loss, without sending a Discord packet or a voice credential.
      node.socket.netSocket.destroy();
      const [, payload] = await resumed;
      assert.equal(payload.resumed, true);
      assert.equal(node.sessionId, sessionId);
    });
    context.resumes++;
    context.nextResume = performance.now() + 15000;
  }
  context.cycles++;
}

async function main() {
  const cpuStart = process.cpuUsage();
  let start;
  let passed = false;
  let errorMessage;
  const sample = () => {
    global.gc();
    const usage = process.memoryUsage();
    samples.push({ elapsedSeconds: (performance.now() - start) / 1000, heapUsedBytes: usage.heapUsed, rssBytes: usage.rss,
      nodes: contexts.map(({ backend, stats }) => ({ backend: backend.kind, cpuSystemLoad: stats?.cpu.systemLoad ?? null, memoryUsedBytes: stats?.memory.used ?? null })) });
  };
  try {
    for (const [index, backend] of lab.backends.entries()) {
      const manager = new Manager({ nodes: [{ ...backend, retryAmount: 3, retryDelay: 20 }],
        send() { throw new Error('Endurance tests must not send Discord gateway packets'); },
        options: { database: { type: 'memory' }, resume: true, resumeTimeout: 60000, playerDestruction: { autoDestroyOnIdle: true } },
      });
      const context = { manager, backend, index, cycles: 0, resumes: 0, pings: 0 };
      contexts.push(context);
      manager.on('nodeError', (_node, error) => failures.push(error.message));
      const ready = event(manager, 'nodeReady', 15000);
      const connectedAt = performance.now();
      await manager.init(String(823456789012345670n + BigInt(index)));
      const [node] = await ready;
      (latency[`${backend.kind}.ready`] ??= []).push(performance.now() - connectedAt);
      context.node = node;
      const loaded = await node.rest.loadTracks(lab.mediaUrl, { timeoutMs: 10000 });
      assert.equal(loaded.loadType, 'track');
      context.track = new Track(loaded.data);
      context.track.backend = backend.kind;
      await node.rest.updateSession(true, 60);
    }
    start = performance.now();
    for (const context of contexts) context.nextResume = start + 15000;
    loop.enable(); sample();
    let tick = 0;
    while (performance.now() - start < durationSeconds * 1000) {
      const iteration = performance.now();
      await Promise.all(contexts.map(cycle));
      assert.deepEqual(failures, []);
      if (tick++ % 10 === 0) sample();
      if (tick % 30 === 0) console.log(`Endurance ${Math.round((performance.now() - start) / 1000)}s: ${contexts.map(c => `${c.backend.kind} cycles=${c.cycles} resumes=${c.resumes}`).join(', ')}`);
      await delay(Math.max(0, 1000 - (performance.now() - iteration)));
    }
    sample();
    assert.ok(contexts.every(c => c.cycles >= Math.floor(durationSeconds / 2)));
    if (durationSeconds >= 30) assert.ok(contexts.every(c => c.resumes >= 1));
    passed = true;
  } catch (error) { errorMessage = error.message; }
  finally {
    loop.disable();
    for (const { manager } of contexts) {
      try { await manager.shutdown(); } catch (error) { failures.push(error.message); }
    }
    try {
      for (const { manager, node } of contexts) {
        assert.equal(manager.players.size, 0); assert.equal(manager.nodes.nodes.size, 0);
        if (node) { assert.equal(node.destroyed, true); assert.equal(node.socket, undefined); }
      }
      assert.deepEqual(failures, []);
      assert.equal(process.getActiveResourcesInfo().filter(name => name === 'Timeout').length, 0);
    } catch (error) { passed = false; errorMessage ??= error.message; }
    const report = {
      timestamp: new Date().toISOString(), scope: 'local backend endurance; no Discord voice or audible playback', durationSeconds,
      elapsedSeconds: start ? (performance.now() - start) / 1000 : 0, passed,
      environment: { node: process.version, platform: process.platform, arch: process.arch, cpu: os.cpus()[0]?.model },
      backends: contexts.map(({ backend, cycles, resumes, pings }) => ({ backend: backend.kind, version: backend.version, image: backend.image, cycles, resumes, pings })),
      cpuMicros: process.cpuUsage(cpuStart), samples,
      eventLoopDelay: { p50Ms: loop.percentile(50) / 1e6, p95Ms: loop.percentile(95) / 1e6, maxMs: loop.max / 1e6 },
      operations: Object.fromEntries(Object.entries(latency).map(([name, values]) => [name, summary(values)])),
      cleanup: { players: contexts.reduce((sum, c) => sum + c.manager.players.size, 0), nodes: contexts.reduce((sum, c) => sum + c.manager.nodes.nodes.size, 0), activeResources: process.getActiveResourcesInfo() },
      ...(errorMessage ? { error: errorMessage } : {}),
    };
    await fs.writeFile(path.resolve(lab.directory, '../endurance-report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(`Endurance report: passed=${report.passed}, elapsed=${report.elapsedSeconds.toFixed(1)}s`);
    if (!report.passed) process.exitCode = 1;
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
