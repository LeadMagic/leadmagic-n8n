const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const manifest = require('../package.json');
const packed = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json'], { encoding: 'utf8' }));
// npm 12 keys results by package name; older npm releases return an array.
const pack = Array.isArray(packed) ? packed[0] : packed[manifest.name];
assert(pack && Array.isArray(pack.files), 'Unrecognized npm pack output');
const files = new Set(pack.files.map((file) => file.path));
for (const [, target] of readFileSync('README.md', 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
  if (!/^(?:https?:|mailto:|#)/.test(target)) {
    assert(files.has(target.split('#')[0]), `README link is missing from npm package: ${target}`);
  }
}
assert.equal(manifest.n8n.strict, true);
assert.equal(Object.keys(manifest.dependencies || {}).length, 0, 'Runtime dependencies are not permitted');
for (const file of [manifest.main, 'README.md', 'LICENSE', ...manifest.n8n.nodes, ...manifest.n8n.credentials]) {
  assert(files.has(file), `Missing package entry: ${file}`);
}
const sourceLogo = readFileSync('nodes/LeadMagic/leadmagic.svg', 'utf8');
assert.equal(readFileSync('credentials/leadmagic.svg', 'utf8'), sourceLogo, 'Node and credential logos must match');
assert(/viewBox="0 0 65 65"/.test(sourceLogo), 'Logo must retain its official square viewBox');
for (const file of [...manifest.n8n.nodes, ...manifest.n8n.credentials]) {
  const exports = require(path.resolve(file));
  const instance = new (Object.values(exports)[0])();
  const icon = instance.description?.icon || instance.icon;
  assert.equal(icon, 'file:leadmagic.svg');
  const iconPath = path.posix.join(path.posix.dirname(file), icon.slice(5));
  assert(files.has(iconPath), 'Icon must be included in npm package');
  assert.equal(readFileSync(iconPath, 'utf8'), sourceLogo, `Packaged logo differs from the source: ${iconPath}`);
}
assert(files.has('dist/nodes/LeadMagic/LeadMagic.node.json'), 'Missing n8n documentation metadata');
for (const file of files) {
  if (file.endsWith('.svg')) {
    const logo = readFileSync(file, 'utf8');
    assert(!/<script|<foreignObject|<!DOCTYPE|<!ENTITY|\son\w+\s*=|(?:href|src)\s*=|@import|url\(\s*['"]?(?!#)/i.test(logo), `Logo must be self-contained: ${file}`);
  }
  assert(!/(?:^|\/)(?:\.env|\.npmrc|tests|templates|node_modules)(?:\.|\/|$)|\.png$|\.tgz$/i.test(file), `Unexpected package file: ${file}`);
}
console.log(`Package verified: ${pack.name}@${pack.version}, ${files.size} files, ${pack.unpackedSize} bytes unpacked`);
