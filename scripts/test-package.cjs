const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const manifest = require('../package.json');
const baseline = require('../tests/fixtures/public-exports.json');

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 120000, env: { ...process.env, CI: 'false', COREPACK_ENABLE_PROJECT_SPEC: '0' } });
  assert.equal(result.status, 0, `${command} ${args.join(' ')} failed: ${result.stderr || result.stdout || result.error?.message}`);
  return result;
}

async function main() {
  assert.equal(manifest.private, true, 'Distribution tests must keep publication blocked');
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'nyxlink-package-'));
  const checks = [];
  let passed = false;
  let archive;
  try {
    const packed = run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', directory], root);
    const [description] = JSON.parse(packed.stdout);
    archive = path.join(directory, description.filename);
    assert.equal(path.dirname(archive), directory);
    const consumer = path.join(directory, 'consumer');
    await fs.mkdir(consumer);
    const types = require('../node_modules/@types/node/package.json').version;
    const compiler = require('../node_modules/typescript/package.json').version;
    const discord = require('../node_modules/discord.js/package.json').version;
    await fs.writeFile(path.join(consumer, 'package.json'), JSON.stringify({ private: true, packageManager: manifest.packageManager,
      dependencies: { [manifest.name]: `file:${archive}` }, devDependencies: { '@types/node': types, typescript: compiler, 'discord.js': discord } }));
    const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
    run(pnpm, ['install', '--prefer-offline', '--ignore-scripts', '--no-frozen-lockfile'], consumer);
    checks.push('install packed artifact in isolated consumer');
    const installed = path.join(consumer, 'node_modules', ...manifest.name.split('/'));
    assert.notEqual(await fs.realpath(installed), root, 'Consumer must use the packed copy');
    const actual = JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8'));
    assert.equal(actual.name, manifest.name); assert.equal(actual.version, manifest.version); assert.equal(actual.private, true);
    assert.deepEqual(actual.dependencies, manifest.dependencies);
    const license = await fs.readFile(path.join(installed, 'LICENSE'));
    assert.deepEqual(license, await fs.readFile(path.join(root, 'LICENSE')));
    checks.push('identity, runtime dependencies and license bytes');
    const specifier = JSON.stringify(manifest.name);
    const setup = `const assert = require('node:assert/strict'); const api = require(${specifier});
      for (const name of ${JSON.stringify(baseline)}) assert.ok(name in api, name);
      assert.equal(api.version, ${JSON.stringify(manifest.version)});
      const m = new api.Manager({nodes:[{host:'127.0.0.1',port:2333,password:'local-fixture'}],options:{database:{type:'memory'}}});
      assert.ok(m.options.clientName.startsWith('NyxLink/'));
      m.shutdown().catch(error=>{console.error(error);process.exitCode=1});`;
    await fs.writeFile(path.join(consumer, 'commonjs.cjs'), setup);
    const commonjs = run(process.execPath, ['commonjs.cjs'], consumer);
    assert.equal(commonjs.stdout, ''); assert.equal(commonjs.stderr, '');
    checks.push('CommonJS public exports, metadata and silent lifecycle');
    await fs.writeFile(path.join(consumer, 'esm.mjs'), `import assert from 'node:assert/strict';
      import { Manager, Track, TrackCodec, TrackResolver, Memory, version } from ${specifier};
      assert.equal(version, ${JSON.stringify(manifest.version)});
      assert.equal(typeof Track, 'function'); assert.equal(typeof TrackCodec.serialize, 'function'); assert.equal(typeof TrackResolver.resolve, 'function');
      const adapter = new Memory(); await adapter.set('fixture', 7); assert.equal(await adapter.get('fixture'), 7);
      const manager = new Manager({nodes:[{host:'127.0.0.1',port:2333,password:'local-fixture'}],options:{database:{type:'memory'}}}); await manager.shutdown();`);
    const esm = run(process.execPath, ['esm.mjs'], consumer);
    assert.equal(esm.stdout, ''); assert.equal(esm.stderr, '');
    checks.push('ESM named imports and lifecycle');
    const fixture = (await fs.readFile(path.join(root, 'tests/types/public-api.ts'), 'utf8')).replace("'../../dist'", specifier);
    for (const extension of ['cts', 'mts']) await fs.writeFile(path.join(consumer, `consumer.${extension}`), fixture);
    const tsc = path.join(consumer, 'node_modules/typescript/bin/tsc');
    run(process.execPath, [tsc, '--noEmit', '--strict', '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', 'consumer.cts', 'consumer.mts'], consumer);
    checks.push('TypeScript NodeNext CJS/ESM consumers without skipLibCheck');
    for (const file of ['discordjs.ts', 'discordjs.cjs']) await fs.copyFile(path.join(root, 'examples', file), path.join(consumer, file));
    run(process.execPath, [tsc, '--noEmit', '--strict', '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', 'discordjs.ts'], consumer);
    await fs.writeFile(path.join(consumer, 'example-smoke.cjs'), `const { createMusicClient } = require('./discordjs.cjs'); const fixture = createMusicClient([{host:'127.0.0.1',port:2333,password:'fixture'}]); fixture.close().catch(error=>{console.error(error);process.exitCode=1});`);
    const example = run(process.execPath, ['example-smoke.cjs'], consumer); assert.equal(example.stdout, ''); assert.equal(example.stderr, '');
    checks.push('TypeScript example compile and CommonJS factory/cleanup without login');
    passed = true;
  } finally {
    const report = { timestamp: new Date().toISOString(), scope: 'packed local installation; no registry publication or Discord',
      node: process.version, package: manifest.name, version: manifest.version, passed, checks,
      ...(archive ? { sha256: createHash('sha256').update(await fs.readFile(archive)).digest('hex') } : {}) };
    const reportPath = path.join(root, '.runtime/package/report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
    await fs.rm(directory, { recursive: true, force: true });
    console.log(`Installed package validation: ${checks.length} checks, passed=${passed}`);
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
