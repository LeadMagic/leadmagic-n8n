const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readdirSync, readFileSync } = require('node:fs');
const path = require('node:path');
const { LeadMagic } = require('../dist/nodes/LeadMagic/LeadMagic.node.js');

const dir = path.join(__dirname, '..', 'templates');
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'catalog.json');
const description = new LeadMagic().description;
const props = description.properties;
const LM_TYPES = new Set(['n8n-nodes-leadmagic.leadMagic', 'n8n-nodes-leadmagic.leadMagicTool']);
const TOOL_ONLY = new Set(['toolDescription']);

function visible(prop, params) {
  const show = prop.displayOptions?.show ?? {};
  return Object.entries(show).every(([key, allowed]) => {
    if (key.startsWith('@')) return true;
    const value = key in params ? params[key] : props.find((p) => p.name === key)?.default;
    return allowed.includes(value);
  });
}

test('template catalog lists every workflow', () => {
  const catalog = JSON.parse(readFileSync(path.join(dir, 'catalog.json'), 'utf8'));
  assert.deepEqual(catalog.map((c) => c.file).sort(), [...files].sort());
});

for (const file of files) {
  const workflow = JSON.parse(readFileSync(path.join(dir, file), 'utf8'));

  test(`${file}: structure, privacy, and connections`, () => {
    const names = new Set(workflow.nodes.map((n) => n.name));
    assert.equal(names.size, workflow.nodes.length, 'node names must be unique');
    for (const [source, kinds] of Object.entries(workflow.connections)) {
      assert(names.has(source), `unknown connection source ${source}`);
      for (const outputs of Object.values(kinds))
        for (const output of outputs) for (const link of output) assert(names.has(link.node), `unknown target ${link.node}`);
    }
    const text = JSON.stringify(workflow);
    assert.doesNotMatch(text, /lm_(live|test)_[a-z0-9]{8,}/i, 'no API keys');
    assert.doesNotMatch(text, /"credentials"\s*:/, 'no credential references');
    assert.doesNotMatch(text, /docs\.google\.com\/spreadsheets\/d\//, 'no spreadsheet IDs');
    const notes = workflow.nodes.filter((n) => n.type === 'n8n-nodes-base.stickyNote');
    assert(notes.some((n) => n.name === 'Overview' && /### How it works/.test(n.parameters.content) && /### Setup/.test(n.parameters.content)));
  });

  test(`${file}: LeadMagic parameters match the node`, () => {
    const lmNodes = workflow.nodes.filter((n) => LM_TYPES.has(n.type));
    assert(lmNodes.length > 0);
    for (const node of lmNodes) {
      assert.equal(node.typeVersion, description.version);
      const params = node.parameters;
      const resources = props.find((p) => p.name === 'resource').options.map((o) => o.value);
      assert(resources.includes(params.resource), `${node.name}: unknown resource ${params.resource}`);
      const operations = props
        .filter((p) => p.name === 'operation' && p.displayOptions.show.resource.includes(params.resource))
        .flatMap((p) => p.options.map((o) => o.value));
      assert(operations.includes(params.operation), `${node.name}: unknown operation ${params.operation}`);
      for (const name of Object.keys(params)) {
        if (['resource', 'operation'].includes(name)) continue;
        if (TOOL_ONLY.has(name) && node.type.endsWith('Tool')) continue;
        const match = props.filter((p) => p.name === name && visible(p, params));
        assert(match.length > 0, `${node.name}: parameter ${name} is not shown for ${params.resource}/${params.operation}`);
        const prop = match[0];
        if (prop.type === 'collection' && params[name] && typeof params[name] === 'object') {
          const allowed = new Set(prop.options.map((o) => o.name));
          for (const key of Object.keys(params[name])) assert(allowed.has(key), `${node.name}: ${name}.${key} is not a valid option`);
        }
        const isExpression = typeof params[name] === 'string' && params[name].startsWith('=');
        if (prop.type === 'options' && !isExpression)
          assert(prop.options.some((o) => o.value === params[name]), `${node.name}: ${name}=${params[name]} is not an option`);
        if (prop.type === 'multiOptions') {
          const values = prop.options.map((o) => o.value);
          for (const v of params[name]) assert(values.includes(v), `${node.name}: ${name} has unknown value ${v}`);
        }
      }
    }
  });
}
