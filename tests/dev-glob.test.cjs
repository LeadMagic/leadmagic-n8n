const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { test } = require('node:test');
const cliRequire = createRequire(require.resolve('@n8n/node-cli/eslint'));
const findFiles = cliRequire('fast-glob');

function fixture(t, files) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'leadmagic-dev-glob-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(dir, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  return dir;
}
const assets = {
  'nodes/Demo/icon.svg': '<svg />',
  'nodes/Demo/picture.png': 'fixture',
  'nodes/Demo/__schema__/v1/input.json': '{}',
  'nodes/Demo/metadata.json': '{}',
  'credentials/icon.svg': '<svg />',
  'dist/nodes/old.svg': 'old output',
  'node_modules/vendor/vendor.svg': 'vendor',
};
const buildPatterns = ['**/*.{png,svg}', '**/__schema__/**/*.json'];
const buildExpected = [
  'credentials/icon.svg',
  'nodes/Demo/__schema__/v1/input.json',
  'nodes/Demo/icon.svg',
  'nodes/Demo/picture.png',
];

test('sync build patterns retain brace extensions and schemas, excluding generated/vendor trees', t => {
  const dir = fixture(t, assets);
  assert.deepEqual(findFiles.sync(buildPatterns, { cwd: dir, ignore: ['dist', 'node_modules'] }).sort(), buildExpected);
});
test('async discovery matches sync file-only behavior without expanding directory inputs', async t => {
  const dir = fixture(t, assets);
  const options = { cwd: dir, ignore: ['dist', 'node_modules'] };
  assert.deepEqual((await findFiles(buildPatterns, options)).sort(), buildExpected);
  assert.deepEqual(findFiles.sync('nodes', options), []);
  assert.deepEqual(await findFiles([], options), []);
});
test('templates preserve dot files, absolute paths and exclusions', async t => {
  const dir = fixture(t, {
    'README.md': 'readme',
    '.github/workflows/build.yml': 'workflow',
    '.agents/helper.md': 'agent',
    'AGENTS.md': 'agent instructions',
    'CLAUDE.md': 'claude instructions',
    'tsconfig.json': '{}',
    'tsconfig.build.json': '{}',
    'nodes/Demo.node.json': '{}',
  });
  const result = await findFiles('**/*.{md,json,yml}', {
    cwd: dir, absolute: true, dot: true,
    ignore: ['tsconfig.json', 'tsconfig.build.json', 'AGENTS.md', 'CLAUDE.md', '.agents/*.md'],
  });
  assert.deepEqual(result.sort(), ['.github/workflows/build.yml', 'README.md', 'nodes/Demo.node.json'].map(file => path.join(dir, file)).sort());
});
test('unsupported CLI option changes fail visibly', async t => {
  const dir = fixture(t, assets);
  assert.throws(() => findFiles.sync('**/*', { cwd: dir, objectMode: true }), /Unsupported n8n development glob option/);
  await assert.rejects(findFiles('**/*', { cwd: dir, objectMode: true }), /Unsupported n8n development glob option/);
});

function cliModule(relative) {
  const config = require.resolve('@n8n/node-cli/eslint');
  return require(path.resolve(path.dirname(config), '..', relative));
}
test('official n8n CLI copies all build assets through the installed adapter', async t => {
  const dir = fixture(t, assets);
  const previous = process.cwd();
  try {
    process.chdir(dir);
    await cliModule('commands/build.js').copyStaticFiles();
    for (const file of buildExpected) assert.equal(readFileSync(path.join(dir, 'dist', file), 'utf8'), assets[file]);
    assert.equal(existsSync(path.join(dir, 'dist/node_modules')), false);
    assert.equal(existsSync(path.join(dir, 'dist/dist')), false);
    assert.equal(existsSync(path.join(dir, 'dist/nodes/Demo/metadata.json')), false);
  } finally {
    process.chdir(previous);
  }
});
test('official n8n CLI renders templates but preserves instruction and compiler files', async t => {
  const dir = fixture(t, {
    'README.md': '{{name}} readme',
    '.github/workflows/build.yml': 'name: {{name}}',
    'nodes/node.json': '{"name":"{{name}}"}',
    'AGENTS.md': '{{name}} instructions',
    'tsconfig.json': '{"name":"{{name}}"}',
    '.agents/helper.md': '{{name}} private instructions',
  });
  await cliModule('template/core.js').templateStaticFiles({ destinationPath: dir, name: 'Demo' });
  assert.equal(readFileSync(path.join(dir, 'README.md'), 'utf8'), 'Demo readme');
  assert.equal(readFileSync(path.join(dir, '.github/workflows/build.yml'), 'utf8'), 'name: Demo');
  assert.equal(readFileSync(path.join(dir, 'nodes/node.json'), 'utf8'), '{"name":"Demo"}');
  for (const file of ['AGENTS.md', 'tsconfig.json', '.agents/helper.md']) assert.match(readFileSync(path.join(dir, file), 'utf8'), /{{name}}/);
});
