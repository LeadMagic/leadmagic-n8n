const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const { test } = require('node:test');

let toolRequire = createRequire(require.resolve('@n8n/node-cli/eslint'));
for (const name of ['@n8n/ai-node-sdk', '@n8n/ai-utilities']) {
  toolRequire = createRequire(toolRequire.resolve(name));
}

for (const consumer of [
  '@langchain/classic/retrievers/parent_document',
  '@langchain/community/stores/message/neo4j',
]) {
  const consumerRequire = createRequire(toolRequire.resolve(consumer));
  const uuid = consumerRequire('uuid');

  test(`${consumer}: UUID generation remains compatible through CommonJS and ESM`, async () => {
    assert.equal(uuid.validate(uuid.v4()), true);
    assert.equal(uuid.version(uuid.v1()), 1);
    const imported = await import(pathToFileURL(consumerRequire.resolve('uuid')).href);
    assert.equal(imported.validate(imported.v4()), true);
  });

  test(`${consumer}: namespaced UUIDs reject an undersized output buffer`, () => {
    for (const version of ['v3', 'v5']) {
      assert.throws(() => uuid[version]('example.test', uuid[version].DNS, new Uint8Array(8)));
      const output = new Uint8Array(16);
      assert.equal(uuid[version]('example.test', uuid[version].DNS, output), output);
      assert.equal(uuid.validate(uuid.stringify(output)), true);
    }
  });
}
