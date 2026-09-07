# LeadMagic for n8n

An n8n community node for work email discovery, email validation, people and company enrichment, job research, and advertising intelligence using the LeadMagic REST API.

[API documentation](https://leadmagic.io/docs) · [npm package](https://www.npmjs.com/package/n8n-nodes-leadmagic) · [Workflow templates](templates/README.md)

## Installation

On an n8n installation that supports community nodes, open **Settings → Community Nodes → Install** and enter `n8n-nodes-leadmagic`. Package availability and supported community-node features depend on your n8n installation. This repository's fixes are available in source; installing from npm uses the latest published package.

## Authentication

Create a LeadMagic API credential in n8n and store your API key in the password field. Requests use `X-API-Key` against `https://api.leadmagic.io`. The credential test uses the free `GET /v1/credits` endpoint. Never embed keys in workflow JSON or export shared workflows with customer data.

## Supported operations

| Resource | Operations |
| --- | --- |
| Email | Validate existing email, find work email, find personal email, profile to work email |
| Company | Company lookup, funding, technographics, competitors |
| Profile | Profile enrichment, email to profile, mobile lookup |
| People | Role finder, employee finder, job-change detection |
| Jobs | Job finder, countries, regions, job types, industries, company types |
| Advertising | Search Google, Meta, and B2B ads; fetch B2B ad details |
| Credits | Check account balance |

These 25 operations cover a subset of the public API. V3 search and asynchronous bulk-job management are not node operations. Use n8n's HTTP Request node with the [public OpenAPI reference](https://github.com/LeadMagic/leadmagic-openapi) for other supported routes.

## Credit-aware workflows

Costs vary by endpoint and plan. Check [current credits and pricing](https://leadmagic.io/docs/v1/credits) before running a list. Email Finder returns validated work emails; do not immediately validate them again. Validate emails imported from other sources separately.

The bulk email input performs individual validation requests, up to 1,000 emails. It is not the asynchronous bulk API. Requests have a 30-second timeout, do not follow redirects, and are not automatically retried. A timed-out paid request may already have consumed credits; inspect its outcome before replaying it. Respect `429` responses and the account's documented rate limits.

## Development

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm test
```

Tests mock the network and do not consume API credits. Existing operation IDs are retained so saved workflows can use the corrected routes. Test your workflow on a small sample before upgrading a production installation.

## Support

[Report a bug](https://github.com/LeadMagic/leadmagic-n8n/issues) with sanitized reproduction steps. Report vulnerabilities privately to [security@leadmagic.io](mailto:security@leadmagic.io).

MIT licensed.

### Migration notes

B2B ad details now sends the documented `ad_url`: replace numeric IDs in saved workflows with full ad URLs (the stored n8n field name remains `ad_id` for compatibility). Employee Finder sends `limit` from the existing per-page setting; page values above 1 are rejected because that endpoint does not support offsets. Use V3 People Search for pagination.
