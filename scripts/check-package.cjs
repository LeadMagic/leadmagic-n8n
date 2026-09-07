const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const manifest = require('../package.json');
const [pack] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json'], { encoding: 'utf8' }));
const files = new Set(pack.files.map((file) => file.path));
assert.equal(manifest.n8n.strict, true);
assert.equal(Object.keys(manifest.dependencies || {}).length, 0, 'Runtime dependencies are not permitted');
for (const file of [manifest.main, 'README.md', 'LICENSE', ...manifest.n8n.nodes, ...manifest.n8n.credentials]) {
  assert(files.has(file), `Missing package entry: ${file}`);
}
for (const file of [...manifest.n8n.nodes, ...manifest.n8n.credentials]) {
  const exports = require(path.resolve(file));
  const instance = new (Object.values(exports)[0])();
  const icon = instance.description?.icon || instance.icon;
  assert.equal(icon, 'file:leadmagic.svg');
  assert(files.has(path.posix.join(path.posix.dirname(file), icon.slice(5))), 'Icon must be included in npm package');
}
assert(files.has('dist/nodes/LeadMagic/LeadMagic.node.json'), 'Missing n8n documentation metadata');
const logo = readFileSync('dist/nodes/LeadMagic/leadmagic.svg', 'utf8');
assert(!/<script|<foreignObject|\son\w+=|(?:href|src)=/i.test(logo), 'Logo must be self-contained');
for (const file of files) {
  assert(!/(?:^|\/)(?:\.env|\.npmrc|tests|templates|node_modules)(?:\.|\/|$)|\.png$|\.tgz$/i.test(file), `Unexpected package file: ${file}`);
}
console.log(`Package verified: ${pack.name}@${pack.version}, ${files.size} files, ${pack.unpackedSize} bytes unpacked`);
