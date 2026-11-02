const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { gzipSync } = require('node:zlib');
const { once } = require('node:events');
const { makeStreamRequest } = require('../dist/src/Util');
const { HttpError } = require('../dist');

test('streaming HTTP failures retain bounded decompressed status and body', async t => {
  const server = http.createServer((_req, res) => { res.writeHead(404, { 'content-encoding': 'gzip' }); res.end(gzipSync(JSON.stringify({ message: 'The requested route was not found.' }))); });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await assert.rejects(makeStreamRequest(`http://127.0.0.1:${server.address().port}/stream`, {}), error => {
    assert.ok(error instanceof HttpError); assert.equal(error.statusCode, 404); assert.equal(error.body.message, 'The requested route was not found.'); return true;
  });
});

test('oversized stream-error bodies do not accumulate beyond the error budget', async t => {
  const server = http.createServer((_req, res) => { res.writeHead(500); res.end('x'.repeat(65536)); });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await assert.rejects(makeStreamRequest(`http://127.0.0.1:${server.address().port}/stream`, {}), error => {
    assert.ok(error instanceof HttpError); assert.equal(error.statusCode, 500); assert.equal(error.body, undefined); return true;
  });
});
