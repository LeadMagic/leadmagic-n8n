const { test } = require('node:test');
const assert = require('node:assert/strict');
const { LeadMagic } = require('../dist/nodes/LeadMagic/LeadMagic.node.js');

// Minimal IExecuteFunctions stand-in. Responses are served in order; the
// network is never touched and no credits are used.
async function run(resource, operation, params = {}, responses = [], opts = {}) {
  const requests = [];
  const values = { resource, operation, ...params };
  const context = {
    getInputData: () => [{ json: {} }],
    getExecutionCancelSignal: () => undefined,
    getNodeParameter: (name, _index, fallback) => (name in values ? values[name] : fallback),
    getNode: () => ({ name: 'LeadMagic', type: 'leadMagic', typeVersion: 1, position: [0, 0], parameters: {} }),
    continueOnFail: () => false,
    helpers: {
      httpRequestWithAuthentication: async (credential, options) => {
        assert.equal(credential, 'leadMagicApi');
        requests.push(JSON.parse(JSON.stringify(options)));
        if (opts.error) throw opts.error;
        return responses[requests.length - 1] ?? {};
      },
      returnJsonArray: (value) => (Array.isArray(value) ? value : [value]).map((json) => ({ json })),
      constructExecutionMetaData: (data, meta) => data.map((item) => ({ ...item, pairedItem: meta.itemData })),
    },
  };
  const output = await LeadMagic.prototype.execute.call(context);
  return { requests, output: output[0] };
}

const people = (n, start = 0) => Array.from({ length: n }, (_, i) => ({ contact_full_name: `Person ${start + i}` }));

test('people search builds documented body and splits records', async () => {
  const { requests, output } = await run('people', 'searchPeople', {
    company_domain: ' example.com ',
    titles: 'VP Sales, Head of Sales',
    peopleFilters: { contact_job_function: ['Sales'], min_seniority: 3, include_company: false, contact_country_code: 'US, CA' },
    companyFilters: { min_employees: 50, country_codes: 'US' },
    limit: 3,
  }, [{ people: people(3), next_cursor: null }]);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://api.leadmagic.io/v3/people/search');
  assert.equal(requests[0].method, 'POST');
  assert.deepEqual(requests[0].body, {
    company_domain: 'example.com',
    titles: ['VP Sales', 'Head of Sales'],
    include_company: false,
    people_filters: { contact_job_function: ['Sales'], min_seniority: 3, contact_country_code: ['US', 'CA'] },
    company_filters: { min_employees: 50, country_codes: ['US'] },
    limit: 3,
  });
  assert.equal(output.length, 3);
  assert.equal(output[0].json.contact_full_name, 'Person 0');
  assert.deepEqual(output[2].pairedItem, { item: 0 });
});

test('cursor pagination stops at the limit and sends the cursor back', async () => {
  const { requests, output } = await run('people', 'searchPeople', { company_domain: 'example.com', limit: 70 }, [
    { people: people(50), next_cursor: 'c1', has_more: true },
    { people: people(50, 50), next_cursor: 'c2', has_more: true },
  ]);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].body.limit, 50);
  assert.equal(requests[1].body.limit, 20);
  assert.equal(requests[1].body.cursor, 'c1');
  assert.equal(output.length, 70);
});

test('return all follows cursors until has_more is false', async () => {
  const { requests, output } = await run('company', 'searchCompanies', { query: 'payments', returnAll: true }, [
    { companies: [{ company_domain: 'a.example' }], next_cursor: 'n1' },
    { companies: [{ company_domain: 'b.example' }], next_cursor: 'n2', has_more: false },
  ]);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].url, 'https://api.leadmagic.io/v3/companies/search');
  assert.deepEqual(requests[0].body, { query: 'payments', limit: 50 });
  assert.equal(output.length, 2);
});

test('split off returns raw pages with metadata', async () => {
  const page = { companies: [{ company_domain: 'a.example' }], warnings: ['x'], next_cursor: null };
  const { output } = await run('company', 'searchCompanies', { companyLookup: { company_domain: 'example.com' }, splitIntoItems: false }, [page]);
  assert.equal(output.length, 1);
  assert.deepEqual(output[0].json.warnings, ['x']);
});

test('lookalikes page by offset with 100-row pages', async () => {
  const { requests } = await run('company', 'findLookalikes', { company_domain: 'example.com', limit: 150 }, [
    { companies: Array(100).fill({}), metadata: { has_more: true, next_offset: 100 } },
    { companies: Array(50).fill({}), metadata: { has_more: false, next_offset: null } },
  ]);
  assert.equal(requests[0].url, 'https://api.leadmagic.io/v3/companies/lookalike');
  assert.equal(requests[0].body.limit, 100);
  assert.equal(requests[1].body.offset, 100);
  assert.equal(requests[1].body.limit, 50);
});

test('local leads never send limit and page with next_cursor', async () => {
  const { requests, output } = await run('localLead', 'searchLocalLeads', {
    country: 'US', category_contains: 'plumb', localFilters: { city: 'Austin', has_phone: true }, limit: 30,
  }, [
    { leads: Array(25).fill({ id: 'x' }), has_more: true, next_cursor: 'p2' },
    { leads: Array(25).fill({ id: 'y' }), has_more: false, next_cursor: null },
  ]);
  assert.equal(requests[0].url, 'https://api.leadmagic.io/v3/local-leads/search');
  assert.deepEqual(requests[0].body, { country: 'US', category_contains: 'plumb', city: 'Austin', has_phone: true });
  assert.equal(requests[1].body.cursor, 'p2');
  assert.equal('limit' in requests[1].body, false);
  assert.equal(output.length, 30);
});

test('local lead categories is a free GET with query params', async () => {
  const { requests } = await run('localLead', 'getLocalLeadCategories', { categoryFilters: { country: 'US', q: 'dent' } }, [{ results: [] }]);
  assert.equal(requests[0].method, 'GET');
  assert.equal(requests[0].url, 'https://api.leadmagic.io/v3/local-leads/categories');
  assert.deepEqual(requests[0].qs, { country: 'US', q: 'dent' });
  assert.equal(requests[0].body, undefined);
});

test('job search maps friendly fields to the V3 schema', async () => {
  const { requests, output } = await run('job', 'searchJobs', {
    titlesInclude: 'Account Executive, SDR',
    jobFilters: { titlesExclude: 'Intern', companies: 'example.com', countries: 'US', postedWithin: 14, hasRemote: true },
    additionalJson: '{"salary": {"min_usd": 90000}}',
    limit: 5,
  }, [{ signals: Array(5).fill({}), pagination: { has_more: true, next_cursor: 'j2' } }]);
  assert.equal(requests[0].url, 'https://api.leadmagic.io/v3/jobs/search');
  assert.deepEqual(requests[0].body, {
    titles: { include: ['Account Executive', 'SDR'], exclude: ['Intern'] },
    companies: { include: ['example.com'] },
    location: { countries: ['US'] },
    postedWithin: 14,
    hasRemote: true,
    salary: { min_usd: 90000 },
    limit: 5,
  });
  assert.equal(requests.length, 1);
  assert.equal(output.length, 5);
});

test('additional JSON merges into nested filters', async () => {
  const { requests } = await run('people', 'searchPeople', {
    company_domain: 'example.com',
    peopleFilters: { min_seniority: 4 },
    additionalJson: '{"people_filters": {"is_sales": true}}',
    limit: 1,
  }, [{ people: [] }]);
  assert.deepEqual(requests[0].body.people_filters, { min_seniority: 4, is_sales: true });
});

test('invalid additional JSON fails before any request', async () => {
  await assert.rejects(run('people', 'searchPeople', { company_domain: 'example.com', additionalJson: '{nope' }), /not valid JSON/);
});

test('a search with no inputs fails before any request', async () => {
  const result = run('company', 'searchCompanies', {});
  await assert.rejects(result, /at least one search input/);
});

test('email finder supports profile URL and domain mismatch', async () => {
  const { requests } = await run('email', 'findEmail', { findBy: 'profile', profile_url: ' https://www.example.com/in/jane-doe ', allow_domain_mismatch: true }, [{}]);
  assert.deepEqual(requests[0].body, { profile_url: 'https://www.example.com/in/jane-doe', allow_domain_mismatch: true });
});

test('email finder accepts non-ASCII names and a company name only', async () => {
  const { requests } = await run('email', 'findEmail', { first_name: 'José', last_name: 'Nuñez', company_name: 'Example Inc' }, [{}]);
  assert.deepEqual(requests[0].body, { first_name: 'José', last_name: 'Nuñez', company_name: 'Example Inc' });
});

test('email finder requires a domain or company name', async () => {
  await assert.rejects(run('email', 'findEmail', { first_name: 'Jane', last_name: 'Doe' }), /company domain or company name/);
});

test('ads search sends an optional limit', async () => {
  const { requests } = await run('advertisement', 'searchGoogleAds', { searchMethod: 'domain', company_domain: 'example.com', adsLimit: 10 }, [{}]);
  assert.deepEqual(requests[0].body, { company_domain: 'example.com', limit: 10 });
});

test('API error envelope is surfaced without request data', async () => {
  const error = Object.assign(new Error('x-api-key: lm_secret'), {
    statusCode: 402,
    response: { body: { errors: [{ code: 'insufficient_credits', detail: 'Not enough credits.', action: 'Add credits.' }], meta: { request_id: 'req_123' } } },
  });
  await assert.rejects(run('email', 'findEmail', { first_name: 'Jane', last_name: 'Doe', domain: 'example.com' }, [], { error }), (err) => {
    assert.equal(err.message, 'LeadMagic request failed (HTTP 402, insufficient_credits)');
    assert.match(err.description, /Not enough credits\. Add credits\. Request ID: req_123/);
    assert.doesNotMatch(JSON.stringify(err), /lm_secret/);
    return true;
  });
});

async function runItems(params, items, responses = []) {
  const requests = [];
  const values = { resource: 'bulkJob', ...params };
  const context = {
    getInputData: () => items,
    getExecutionCancelSignal: () => undefined,
    getNodeParameter: (name, _i, fallback) => (name in values ? values[name] : fallback),
    getNode: () => ({ name: 'LeadMagic' }),
    continueOnFail: () => false,
    helpers: {
      httpRequestWithAuthentication: async (_c, options) => { requests.push(JSON.parse(JSON.stringify(options))); return responses[requests.length - 1] ?? {}; },
      returnJsonArray: (value) => (Array.isArray(value) ? value : [value]).map((json) => ({ json })),
      constructExecutionMetaData: (data, meta) => data.map((item) => ({ ...item, pairedItem: meta.itemData })),
    },
  };
  return { requests, output: (await LeadMagic.prototype.execute.call(context))[0] };
}

test('bulk submit sends all items as one job and links every input', async () => {
  const items = [{ json: { first_name: 'Jane', last_name: 'Doe', domain: 'example.com', note: 'x' } }, { json: { first_name: 'Ann', last_name: 'Lee', domain: 'example.org' } }];
  const { requests, output } = await runItems({ operation: 'submitBulkJob', product: 'email_finder', rowsFrom: 'items', rowFields: 'first_name, last_name, domain', bulkOptions: { callbackUrl: 'https://n8n.example.com/webhook/x', idempotencyKey: 'k1' } }, items, [{ jobId: 'job_1', status: 'uploaded' }]);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://api.leadmagic.io/bulk/submit');
  assert.deepEqual(requests[0].body, {
    product: 'email_finder',
    rows: [{ first_name: 'Jane', last_name: 'Doe', domain: 'example.com' }, { first_name: 'Ann', last_name: 'Lee', domain: 'example.org' }],
    callback: { url: 'https://n8n.example.com/webhook/x', events: ['completed', 'failed'] },
    idempotencyKey: 'k1',
  });
  assert.equal(output.length, 1);
  assert.equal(output[0].json.jobId, 'job_1');
  assert.deepEqual(output[0].pairedItem, [{ item: 0 }, { item: 1 }]);
});

test('bulk submit rejects non-HTTPS callback and file URLs', async () => {
  await assert.rejects(runItems({ operation: 'submitBulkJob', product: 'email_finder', rowsFrom: 'fileUrl', fileUrl: 'http://example.com/a.csv' }, [{ json: {} }]), /https/);
  await assert.rejects(runItems({ operation: 'submitBulkJob', product: 'email_finder', rowsFrom: 'items', bulkOptions: { callbackUrl: 'http://x' } }, [{ json: { a: 1 } }]), /https/);
});

test('bulk results page by offset and split rows', async () => {
  const page = (n) => ({ rows: Array.from({ length: n }, (_, i) => ({ row_index: i, status: 'completed' })) });
  const { requests, output } = await runItems({ operation: 'getBulkResults', jobId: 'job_1', rowStatus: 'completed', returnAll: true }, [{ json: {} }], [page(100), page(30)]);
  assert.equal(requests[0].url, 'https://api.leadmagic.io/bulk/jobs/job_1/results');
  assert.deepEqual(requests[0].qs, { limit: 100, offset: 0, status: 'completed' });
  assert.deepEqual(requests[1].qs, { limit: 100, offset: 100, status: 'completed' });
  assert.equal(output.length, 130);
});

test('bulk job IDs are validated before use in the URL', async () => {
  await assert.rejects(runItems({ operation: 'getBulkStatus', jobId: '../credits' }, [{ json: {} }]), /valid Job ID/);
});

test('credit usage is a free GET with days', async () => {
  const { requests } = await run('credit', 'getUsage', { days: 7 }, [{}]);
  assert.equal(requests[0].method, 'GET');
  assert.equal(requests[0].url, 'https://api.leadmagic.io/v1/analytics/usage');
  assert.deepEqual(requests[0].qs, { days: 7 });
});
