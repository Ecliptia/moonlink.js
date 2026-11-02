const http = require('node:http');
const { createHash } = require('node:crypto');
const { once } = require('node:events');

function frame(payload) {
  const data = Buffer.from(JSON.stringify(payload));
  const header = Buffer.alloc(data.length < 126 ? 2 : 4);
  header[0] = 0x81;
  if (data.length < 126) header[1] = data.length;
  else { header[1] = 126; header.writeUInt16BE(data.length, 2); }
  return Buffer.concat([header, data]);
}

async function v4Server(t, options = {}) {
  const sockets = new Set();
  let upgrades = 0;
  const server = http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json');
    if (req.url === '/v4/info') {
      res.end(JSON.stringify({ version: { semver: '4.2.2' }, sourceManagers: ['http'], filters: ['volume'] }));
    } else if (req.url?.endsWith('/players')) res.end('[]');
    else res.end('{}');
  });
  server.on('upgrade', (req, socket) => {
    upgrades++;
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    if (options.rejectAuth || options.rejectStatus) { socket.end(`HTTP/1.1 ${options.rejectStatus ?? 401} Rejected\r\nContent-Length: 0\r\n\r\n`); return; }
    const accept = createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    if (options.closeBeforeReady) {
      socket.end(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
      return;
    }
    // Deliberately coalesce the ready frame with the HTTP upgrade response.
    socket.write(Buffer.concat([
      Buffer.from(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`),
      frame({ op: 'ready', sessionId: 'fixture-session', resumed: false }),
    ]));
    socket.on('data', data => { if ((data[0] & 15) === 8) socket.end(); });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    for (const socket of sockets) socket.destroy();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  });
  return { port: server.address().port, get upgrades() { return upgrades; } };
}

function event(emitter, name, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const detach = emitter.on(name, (...args) => { clearTimeout(timer); detach(); resolve(args); });
    const timer = setTimeout(() => { detach(); reject(new Error(`Timed out awaiting ${name}`)); }, timeout);
  });
}

module.exports = { v4Server, event };
