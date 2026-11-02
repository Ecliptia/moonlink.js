const test = require('node:test');
const assert = require('node:assert/strict');
const { createPlayer, deferred } = require('./helpers/player.cjs');

function info(overrides = {}) {
  return { version: { semver: '4.2.2' }, sourceManagers: ['http'], filters: ['volume'], ...overrides };
}

test('a string false marker cannot identify a server as NodeLink', async t => {
  const { node } = createPlayer(t);
  node.rest.getInfoWithHeaders = async () => ({ data: info({ isNodelink: 'false' }), headers: {} });
  await node.open();
  assert.equal(node.isNodeLink, false);
});

test('a validated NodeLink marker supplies identity but does not invent optional endpoint support', async t => {
  const { node } = createPlayer(t);
  node.rest.getInfoWithHeaders = async () => ({ data: info({ isNodelink: true, version: { semver: '3.10.0' } }), headers: {} });
  await node.open();
  assert.equal(node.backend.kind, 'nodelink');
  assert.equal(node.backend.supports('source:http'), true);
  assert.equal(node.backend.featureStatus('trackstream'), 'unknown');
});

test('a true response header identifies NodeLink even without the body marker', async t => {
  const { node } = createPlayer(t);
  node.rest.getInfoWithHeaders = async () => ({ data: info(), headers: { iamnodelink: 'true' } });
  await node.open();
  assert.equal(node.isNodeLink, true);
});

test('capability metadata ignores malformed source and filter entries', async t => {
  const { node } = createPlayer(t);
  node.rest.getInfoWithHeaders = async () => ({ data: info({ sourceManagers: ['http', 3, null, {}], filters: ['volume', false] }), headers: {} });
  await node.open();
  assert.ok(node.capabilities.has('source:http'));
  assert.equal([...node.capabilities].some(value => /null|object|false|:3$/.test(value)), false);
});

test('a failed metadata refresh cannot retain capabilities from the previous connection', async t => {
  const { node } = createPlayer(t);
  node.rest.getInfoWithHeaders = async () => ({ data: info({ isNodelink: true }), headers: {} });
  await node.open();
  node.rest.getInfoWithHeaders = async () => { throw new Error('info unavailable'); };
  await node.open();
  assert.equal(node.isNodeLink, false);
  assert.equal(node.backend, undefined);
  assert.equal(node.capabilities.size, 0);
});

test('metadata received after destruction cannot restore backend identity or capabilities', async t => {
  const { node } = createPlayer(t);
  const response = deferred();
  node.rest.getInfoWithHeaders = () => response.promise;
  const opening = node.open();
  await node.destroy();
  response.resolve({ data: info({ isNodelink: true }), headers: {} });
  await opening;
  assert.equal(node.isNodeLink, false);
  assert.equal(node.capabilities.size, 0);
});
