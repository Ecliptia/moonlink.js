const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const net = require('node:net');
const { randomBytes } = require('node:crypto');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { setTimeout: delay } = require('node:timers/promises');
const exec = promisify(execFile);
const images = require('../integration/backend-servers.json');

function tone() {
  const samples = 48000;
  const data = Buffer.alloc(44 + samples * 2);
  data.write('RIFF'); data.writeUInt32LE(data.length - 8, 4); data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22);
  data.writeUInt32LE(48000, 24); data.writeUInt32LE(96000, 28);
  data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34); data.write('data', 36);
  data.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) data.writeInt16LE(Math.round(Math.sin(i * 2 * Math.PI * 440 / 48000) * 2000), 44 + i * 2);
  return data;
}

async function listen(server) {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return server.address().port;
}

async function freePort() {
  const server = net.createServer();
  const port = await listen(server);
  await new Promise(resolve => server.close(resolve));
  return port;
}

async function withBackendLab(run, options = {}) {
  if (process.platform !== 'linux') throw new Error('The isolated backend lab requires a Linux container host.');
  const engine = process.env.NYXLINK_CONTAINER_ENGINE || 'podman';
  const command = args => exec(engine, args, { timeout: 120000, maxBuffer: 1024 * 1024 });
  const root = path.resolve(__dirname, '../..');
  await fs.mkdir(path.join(root, '.runtime/integration'), { recursive: true });
  const directory = await fs.mkdtemp(path.join(root, '.runtime/integration/run-'));
  const password = randomBytes(24).toString('hex');
  const media = tone();
  await fs.writeFile(path.join(directory, 'tone.wav'), media);
  const mediaServer = http.createServer((req, res) => {
    if (req.url !== '/tone.wav') { res.writeHead(404); res.end(); return; }
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
    const start = range ? Number(range[1]) : 0;
    const end = range?.[2] ? Math.min(Number(range[2]), media.length - 1) : media.length - 1;
    if (start > end) { res.writeHead(416); res.end(); return; }
    res.writeHead(range ? 206 : 200, {
      'content-type': 'audio/wav', 'content-length': end - start + 1, 'accept-ranges': 'bytes',
      ...(range ? { 'content-range': `bytes ${start}-${end}/${media.length}` } : {}),
    });
    res.end(req.method === 'HEAD' ? undefined : media.subarray(start, end + 1));
  });
  const mediaPort = await listen(mediaServer);
  const containers = [];
  const backends = [];
  try {
    for (const kind of ['lavalink', 'nodelink']) {
      const port = await freePort();
      const name = `nyxlink-test-${kind}-${process.pid}-${randomBytes(3).toString('hex')}`;
      const configPath = path.join(directory, kind === 'lavalink' ? 'application.yml' : 'config.js');
      const config = kind === 'lavalink' ? `server:\n  address: 127.0.0.1\n  port: ${port}\nlavalink:\n  server:\n    password: '${password}'\n    sources:\n      youtube: false\n      soundcloud: false\n      bandcamp: false\n      twitch: false\n      vimeo: false\n      nico: false\n      http: true\n      local: true\nlogging:\n  level:\n    root: WARN\n` : `import {config} from './config.default.js';\nconfig.server.host='127.0.0.1'; config.server.port=${port}; config.server.password='${password}'; config.server.autoUpdate.enabled=false;\nconfig.cluster.enabled=false; config.logging.level='warn'; config.logging.file.enabled=false; config.cache.diskEnabled=false;\nfor(const source of Object.values(config.sources)) if(source && typeof source==='object') source.enabled=false;\nconfig.sources.http.enabled=true; config.sources.local.enabled=true; config.sources.local.basePath='/fixtures';\nfor(const source of Object.values(config.lyrics)) if(source && typeof source==='object') source.enabled=false;\nconfig.api.enableLoadStreamEndpoint=${Boolean(options.streaming)}; config.api.enableTrackStreamEndpoint=${Boolean(options.streaming)}; config.playback.mix.enabled=${options.mix !== false}; config.playback.mix.maxLayersMix=${options.mixLimit ?? 5};\nexport default config;\n`;
      await fs.writeFile(configPath, config, { mode: 0o600 });
      const mount = kind === 'lavalink' ? '/opt/Lavalink/application.yml' : '/app/config.js';
      // Match the owner of the mode-0600 fixture on both local and CI hosts.
      const args = ['run', '-d', '--name', name, '--user', `${process.getuid()}:${process.getgid()}`, '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges', '--network', 'host', '--memory', '768m', '--cpus', '1',
        '-v', `${configPath}:${mount}:ro`, '-v', `${directory}:/fixtures:ro`];
      if (kind === 'lavalink') args.push('-e', 'JAVA_TOOL_OPTIONS=-Xms64m -Xmx384m');
      else {
        const pluginsPath = path.join(directory, 'plugins');
        await fs.mkdir(pluginsPath);
        // Its startup updater must not replace dependencies inside a pinned image.
        args.push('--read-only', '--tmpfs', '/tmp:rw,nosuid,size=64m', '-e', 'npm_config_offline=true', '-v', `${pluginsPath}:/app/plugins:ro`, '-e', `NODELINK_SERVER_PORT=${port}`, '-e', 'NODELINK_SERVER_HOST=127.0.0.1', '-e', `NODELINK_SERVER_PASSWORD=${password}`, '-e', 'NODELINK_CLUSTER_ENABLED=false');
      }
      args.push(images[kind].image);
      containers.push(name);
      await command(args);
      const url = `http://127.0.0.1:${port}`;
      let info;
      const deadline = Date.now() + 90000;
      while (Date.now() < deadline) {
        try {
          const response = await fetch(`${url}/v4/info`, { headers: { Authorization: password }, signal: AbortSignal.timeout(1500) });
          if (response.ok) { info = await response.json(); break; }
        } catch {}
        const state = await command(['inspect', '--format', '{{.State.Status}}', name]);
        if (state.stdout.trim() !== 'running') break;
        await delay(250);
      }
      if (!info) {
        const logs = await command(['logs', '--tail', '25', name]).catch(error => ({ stdout: error.message }));
        throw new Error(`${kind} failed to start: ${logs.stdout}`);
      }
      backends.push({ kind, host: '127.0.0.1', port, password, secure: false, identifier: `lab-${kind}`, version: info.version.semver, image: images[kind].image });
    }
    return await run({ backends, mediaUrl: `http://127.0.0.1:${mediaPort}/tone.wav`, directory });
  } finally {
    for (const name of containers.reverse()) {
      await command(['stop', '--time', '3', name]).catch(() => {});
      await command(['rm', name]).catch(() => {});
    }
    mediaServer.closeAllConnections();
    await new Promise(resolve => mediaServer.close(resolve));
    // Generated credentials exist only while this lab invocation runs.
    await fs.rm(path.join(directory, 'application.yml'), { force: true });
    await fs.rm(path.join(directory, 'config.js'), { force: true });
  }
}

module.exports = { withBackendLab };
