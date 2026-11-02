const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { Rest } = require('../dist');
const { createPlayer } = require('./helpers/player.cjs');

test('a real HTTP 404 rejects the player update and schedules session recovery once', async t => {
  const { node, player } = createPlayer(t);
  let requests = 0;
  const server = http.createServer((_req, res) => {
    requests++;
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ message: 'Session expired' }));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  node.port = server.address().port;
  node.secure = false;
  node.sessionId = 'expired-session';
  let recoveries = 0;
  player.softRestart = async () => { recoveries++; return true; };
  const rest = new Rest(node);
  await assert.rejects(rest.updatePlayer(player.guildId, { paused: true }), /status 404/);
  assert.equal(requests, 1);
  assert.equal(recoveries, 1);
});
