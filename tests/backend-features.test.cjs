const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { gzipSync } = require('node:zlib');
const { createPlayer } = require('./helpers/player.cjs');

test('NodeLink endpoint support is learned from responses without confusing a missing player with a missing route', async t => {
  const { node } = createPlayer(t);
  let requests = 0;
  let missingPlayer = true;
  const server = http.createServer((req, res) => {
    requests++;
    res.setHeader('content-type', 'application/json');
    if (req.url.startsWith('/v4/trackstream')) {
      res.setHeader('content-encoding', 'gzip');
      res.writeHead(404); res.end(gzipSync(JSON.stringify({ message: 'The requested route was not found.' })));
    } else if (missingPlayer) {
      res.writeHead(404); res.end(JSON.stringify({ message: 'Player not found' }));
    } else { res.end('[]'); }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  node.port = server.address().port;
  node.rest.getInfoWithHeaders = async () => ({ data: { version: { semver: '3.10.0' }, isNodelink: true }, headers: {} });
  await node.open();
  await assert.rejects(node.rest.getMixLayers('123456789012345678'), error => {
    assert.equal(error.name, 'HttpError');
    assert.equal(error.statusCode, 404);
    assert.equal(error.body.message, 'Player not found');
    return true;
  });
  assert.equal(node.backend.featureStatus('mix:list'), 'unknown');
  missingPlayer = false;
  assert.deepEqual(await node.rest.getMixLayers('123456789012345678'), []);
  assert.equal(node.backend.featureStatus('mix:list'), 'available');
  await assert.rejects(node.rest.trackStream('encoded'), { code: 'FEATURE_UNAVAILABLE' });
  assert.equal(node.backend.featureStatus('trackstream'), 'unavailable');
  const before = requests;
  await assert.rejects(node.rest.trackStream('encoded'), { code: 'FEATURE_UNAVAILABLE' });
  assert.equal(requests, before);
});

test('a Lavalink optional-feature call fails with a typed error before making a request', async t => {
  const { node } = createPlayer(t);
  await assert.rejects(node.rest.getMixLayers('123456789012345678'), { code: 'FEATURE_UNAVAILABLE' });
});
