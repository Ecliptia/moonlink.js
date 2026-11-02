const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { Manager, Node, Track } = require('../dist');
const { DatabaseManager } = require('../dist/src/managers/DatabaseManager');
const { NodeState } = require('../dist/src/typings/types');

async function sample(batch, count = 500) {
  const manager = new Manager({ nodes: [{ host: '127.0.0.1', port: 2333, password: 'synthetic' }], send() {}, options: { database: { type: 'memory' } } });
  manager.database = new DatabaseManager(manager);
  const node = new Node(manager, { identifier: 'synthetic', host: '127.0.0.1', port: 2333, password: 'synthetic' });
  node.connected = true; node.state = NodeState.READY;
  node.rest.destroyPlayer = async () => {};
  manager.nodes.nodes.set(node.identifier, node);
  try {
    const player = manager.players.create({ guildId: '123456789012345678', voiceChannelId: '223456789012345678' });
    await manager.database.flush();
    const tracks = Array.from({ length: count }, (_, index) => new Track({
      encoded: `synthetic-${index}`,
      info: { title: `Track ${index}`, author: 'Local', length: 1000, identifier: `${index}`, isStream: false, isSeekable: true, sourceName: 'http', uri: 'http://127.0.0.1/tone.wav', position: 0 },
    }));
    global.gc();
    const heapBefore = process.memoryUsage().heapUsed;
    const start = performance.now();
    if (batch) player.queue.add(tracks);
    else for (const track of tracks) player.queue.add(track);
    const syncMs = performance.now() - start;
    const allocatedHeapBytes = process.memoryUsage().heapUsed - heapBefore;
    await manager.database.flush();
    const totalMs = performance.now() - start;
    await player.destroy('Synthetic benchmark');
    const retainedPlayerKeys = (await manager.database.keys('players.*')).length;
    return { mode: batch ? 'batch' : 'single', count, syncMs, totalMs, allocatedHeapBytes, retainedPlayerKeys };
  } finally {
    // The fallback permits collecting the same baseline on the previous delivery.
    if (manager.shutdown) await manager.shutdown();
    else { await manager.players.destroyAll(); await node.destroy(); await manager.database.shutdown(); }
    global.gc();
  }
}

async function main() {
  if (!global.gc) throw new Error('Run the benchmark with node --expose-gc');
  const samples = [];
  const cpu = process.cpuUsage();
  for (let index = 0; index < 5; index++) for (const batch of [false, true]) samples.push(await sample(batch));
  const report = {
    timestamp: new Date().toISOString(), scope: 'synthetic queue persistence; no network, audio or production SLA',
    environment: { node: process.version, platform: process.platform, arch: process.arch, cpu: os.cpus()[0]?.model },
    cpuMicros: process.cpuUsage(cpu), samples,
    passed: samples.every(row => row.retainedPlayerKeys === 0),
  };
  const output = path.resolve(process.argv[2] || '.runtime/benchmark/latest.json');
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
  if (!report.passed) process.exitCode = 1;
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
