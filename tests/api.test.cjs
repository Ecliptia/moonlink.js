const test = require('node:test');
const assert = require('node:assert/strict');
const api = require('../dist/index.js');
const baseline = require('./fixtures/public-exports.json');

test('CommonJS entry point preserves every original public export', () => {
  for (const name of baseline) assert.ok(name in api, `Missing public export: ${name}`);
  assert.equal(api.version, require('../package.json').version);
});

test('importing the library has no terminal output or network side effects', () => {
  const { spawnSync } = require('node:child_process');
  const result = spawnSync(process.execPath, ['-e', "require('./dist/index.js')"], {
    cwd: require('node:path').resolve(__dirname, '..'), encoding: 'utf8', timeout: 5000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});
