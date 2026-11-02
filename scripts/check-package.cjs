const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { encoding: 'utf8' });
assert.equal(result.status, 0, result.stderr || result.error?.message);
const [archive] = JSON.parse(result.stdout);
const files = archive.files.map(file => file.path);
for (const required of ['package.json', 'README.md', 'LICENSE', 'dist/index.js', 'dist/index.d.ts', 'assets/nyxlink_banner.png']) {
  assert.ok(files.includes(required), `Package missing ${required}`);
}
for (const file of files) {
  assert.ok(/^(dist\/|assets\/nyxlink_banner\.png$|package\.json$|README\.md$|LICENSE$)/.test(file), `Unexpected package file: ${file}`);
  assert.ok(!/(^|\/)(\.env(?:\.|$)|node_modules|datastore|\.moonlink)|\.(?:log|tgz)$/.test(file), `Private runtime data in package: ${file}`);
}
console.log(`Package verified: ${files.length} files, ${archive.size} bytes; no publication performed.`);
