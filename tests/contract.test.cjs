// Every request the node can send must use a documented LeadMagic route and
// only documented request fields. The contract is extracted from
// https://leadmagic.io/openapi.json (see "version" in openapi-contract.json);
// refresh it when the API adds fields.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { LeadMagic } = require('../dist/nodes/LeadMagic/LeadMagic.node.js');
const contract = require('./openapi-contract.json');

const props = new LeadMagic().description.properties;
const SKIP = new Set(['resource', 'operation', 'outputMode', 'inputMode']);

function sample(p) {
  if (p.name === 'rowFields') return 'first_name, domain';
  if (p.type === 'string') return p.name.includes('email') ? 'person@example.com' : p.name.toLowerCase().includes('url') ? 'https://example.com/x' : p.name === 'jobId' ? 'job_123' : 'example.com';
  if (p.type === 'number') return 5;
  if (p.type === 'boolean') return true;
  if (p.type === 'multiOptions') return [p.options[0].value];
  if (p.type === 'json') return '{}';
  if (p.type === 'options') return p.options[0].value;
  if (p.type === 'collection') return Object.fromEntries(p.options.map((o) => [o.name, sample(o)]));
  return undefined;
}
const visible = (p, vals) => Object.entries(p.displayOptions?.show ?? {}).every(([k, allowed]) => k.startsWith('@') || allowed.includes(vals[k]));

function* variants() {
  const resources = props.find((p) => p.name === 'resource').options.map((o) => o.value);
  for (const resource of resources)
    for (const opProp of props.filter((p) => p.name === 'operation' && p.displayOptions.show.resource.includes(resource)))
      for (const { value: operation } of opProp.options) {
        const base = { resource, operation, outputMode: 'raw', inputMode: 'single', returnAll: false, limit: 5, splitIntoItems: true };
        let combos = [{}];
        for (const branch of props.filter((p) => p.type === 'options' && !SKIP.has(p.name) && visible(p, base)))
          combos = combos.flatMap((c) => branch.options.map((o) => ({ ...c, [branch.name]: o.value })));
        for (const combo of combos) yield { ...base, ...combo };
      }
}

async function requestsFor(values) {
  const vals = { ...values };
  for (let pass = 0; pass < 3; pass++)
    for (const p of props) if (!(p.name in vals) && p.type !== 'notice' && visible(p, vals)) vals[p.name] = sample(p);
  const requests = [];
  const context = {
    getInputData: () => [{ json: { first_name: 'Jane', last_name: 'Doe', domain: 'example.com' } }],
    getExecutionCancelSignal: () => undefined,
    getNodeParameter: (n, _i, f) => (n in vals ? vals[n] : f),
    getNode: () => ({ name: 'LeadMagic' }),
    continueOnFail: () => false,
    helpers: {
      httpRequestWithAuthentication: async (_c, o) => { requests.push(o); return {}; },
      returnJsonArray: (v) => (Array.isArray(v) ? v : [v]).map((json) => ({ json })),
      constructExecutionMetaData: (d) => d,
    },
  };
  try { await LeadMagic.prototype.execute.call(context); } catch (error) {
    if (!/Find Role needs a company domain/.test(error.message)) throw error;
  }
  return requests;
}

const routeOf = (req) => `${req.method} ${req.url.replace('https://api.leadmagic.io', '').replace(/\/bulk\/jobs\/[^/]+/, '/bulk/jobs/{jobId}')}`;

test('every operation sends only documented routes and fields', async () => {
  const problems = [];
  const routes = new Set();
  for (const values of variants()) {
    for (const req of await requestsFor(values)) {
      const route = routeOf(req);
      const spec = contract.paths[route];
      if (!spec) { problems.push(`${values.resource}/${values.operation}: ${route} is not in the API spec`); continue; }
      routes.add(route);
      const sent = Object.keys(req.method === 'GET' ? req.qs ?? {} : req.body ?? {});
      const allowed = req.method === 'GET' ? spec.query : spec.body;
      const unknown = sent.filter((k) => !allowed.includes(k));
      if (unknown.length) problems.push(`${values.resource}/${values.operation} ${JSON.stringify(values)}: ${route} sends undocumented ${unknown.join(', ')}`);
    }
  }
  assert.deepEqual(problems, []);
  assert(routes.size >= 34, `expected at least 34 routes, exercised ${routes.size}`);
});
