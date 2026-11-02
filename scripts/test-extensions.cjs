const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Manager } = require('../dist');
const { event } = require('../tests/helpers/v4-server.cjs');
const { withBackendLab } = require('../tests/helpers/backend-lab.cjs');
const results = [];

async function profile(enabled) {
  await withBackendLab(async lab => {
    const backend = lab.backends.find(node => node.kind === 'nodelink');
    const manager = new Manager({ nodes: [backend], send() { throw new Error('No Discord gateway use allowed'); }, options: { database: { type: 'memory' }, resume: false } });
    manager.on('nodeError', () => {});
    let node;
    const checks = [];
    const guild = '923456789012345678';
    try {
      const ready = event(manager, 'nodeReady', 15000); await manager.init('823456789012345678'); [node] = await ready;
      const loaded = await node.rest.loadTracks(lab.mediaUrl, { timeoutMs: 10000 }); assert.equal(loaded.loadType, 'track');
      const encoded = loaded.data.encoded;
      const auth = await fetch(`http://${backend.host}:${backend.port}/v4/trackstream?encodedTrack=${encodeURIComponent(encoded)}`, { headers: { Authorization: 'deliberately-wrong' }, signal: AbortSignal.timeout(10000) });
      assert.ok([401, 403].includes(auth.status)); await auth.arrayBuffer(); checks.push('HTTP extension auth rejection');
      await node.rest.updatePlayer(guild, { paused: true, volume: 0 });
      if (enabled) {
        const resolved = await node.rest.trackStream(encoded); assert.equal(resolved.url, lab.mediaUrl);
        assert.equal(node.backend.featureStatus('trackstream'), 'available'); checks.push('enabled stream URL and observed capability');
        await assert.rejects(node.rest.loadStream({ encodedTrack: encoded, format: 'wav' }), error => error.statusCode === 500 && /Unsupported audio format/.test(JSON.stringify(error.body)));
        checks.push('HTTP WAV decoding limitation preserved as explicit server error');
        const local = await node.rest.loadTracks('local:/fixtures/tone.wav', { timeoutMs: 10000 }); assert.equal(local.loadType, 'track');
        const { stream } = await node.rest.loadStream({ encodedTrack: local.data.encoded, format: 'wav' }, { signal: AbortSignal.timeout(15000), timeoutMs: 15000 });
        const chunks = []; let bytes = 0;
        for await (const chunk of stream) { bytes += chunk.length; assert.ok(bytes <= 2 * 1024 * 1024); chunks.push(chunk); }
        const audio = Buffer.concat(chunks); assert.equal(audio.toString('ascii', 0, 4), 'RIFF'); assert.equal(audio.toString('ascii', 8, 12), 'WAVE'); assert.ok(bytes > 44);
        assert.equal(node.backend.featureStatus('loadstream'), 'available'); checks.push('enabled decoded WAV bytes without Discord');
        const layers = await node.rest.getMixLayers(guild); assert.ok(Array.isArray(layers.mixes));
        await assert.rejects(node.rest.addMixLayer(guild, { track: { encoded }, volume: 0.25 }), error => error.statusCode === 500 && /active stream/i.test(JSON.stringify(error.body)));
        await assert.rejects(node.rest.updateMixLayerVolume(guild, 'missing-layer', 0.5), error => error.statusCode === 404);
        await assert.rejects(node.rest.removeMixLayer(guild, 'missing-layer'), error => error.statusCode === 404);
        checks.push('mix list and explicit missing-active-playback/layer errors');
        const lyrics = await node.rest.loadLyrics(encoded); assert.equal(lyrics.loadType, 'empty'); assert.deepEqual(lyrics.data, {});
        const chapters = await node.rest.loadChapters(encoded); assert.deepEqual(chapters.data, []);
        checks.push('lyrics without enabled providers and HTTP chapters empty');
      } else {
        await assert.rejects(node.rest.trackStream(encoded), { code: 'FEATURE_UNAVAILABLE' });
        await assert.rejects(node.rest.loadStream({ encodedTrack: encoded }), { code: 'FEATURE_UNAVAILABLE' });
        await assert.rejects(node.rest.addMixLayer(guild, { track: { encoded } }), { code: 'FEATURE_UNAVAILABLE' });
        checks.push('disabled stream/mix typed errors and capability degradation');
      }
      await node.rest.destroyPlayer(guild); assert.equal((await node.rest.getPlayers()).length, 0); checks.push('server player cleanup');
      results.push({ enabled, backend: backend.kind, version: backend.version, image: backend.image, checks, passed: true, discordAudio: 'not-tested' });
    } catch (error) {
      error.message = `profile=${enabled ? 'enabled' : 'disabled'}, after=${checks.at(-1) ?? 'startup'}: ${error.message}`; throw error;
    } finally {
      try { if (node?.connected) await node.rest.destroyPlayer(guild); } finally { await manager.shutdown(); }
    }
  }, { streaming: enabled, mix: enabled, mixLimit: 2 });
}

(async () => {
  let error;
  try { await profile(true); await profile(false); } catch (failure) { error = failure.message; }
  const report = { timestamp: new Date().toISOString(), scope: 'local NodeLink extensions; no Discord voice', passed: !error && results.length === 2, results, ...(error ? { error } : {}) };
  await fs.mkdir('.runtime/extensions', { recursive: true }); await fs.writeFile(path.resolve('.runtime/extensions/report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report)); if (!report.passed) process.exitCode = 1;
})().catch(error => { console.error(error.message); process.exitCode = 1; });
