# LeadMagic for n8n

<img src="https://raw.githubusercontent.com/LeadMagic/leadmagic-n8n/main/nodes/LeadMagic/leadmagic.svg" width="64" height="64" alt="LeadMagic logo">

An n8n community node for work email discovery, email validation, people and company enrichment, job research, and advertising intelligence using the LeadMagic REST API.

[API documentation](https://leadmagic.io/docs) · [npm package](https://www.npmjs.com/package/n8n-nodes-leadmagic) · [Workflow templates](templates/README.md)

## Installation

On an n8n installation that supports community nodes, open **Settings → Community Nodes → Install** and enter `n8n-nodes-leadmagic`. Use the npm version selector to confirm which release is available before upgrading. Back up and test existing workflows before a production upgrade.

**n8n Cloud:** npm publication alone does not make a node available in Cloud. The package must complete n8n community-node verification. Do not assume verification from this README; check the node picker in your instance.

**Self-hosted:** enable community packages in your n8n instance, install through its Community Nodes settings, and restart if your deployment requires it. See [n8n installation guidance](https://docs.n8n.io/integrations/community-nodes/installation/).

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
pnpm check:package
pnpm dev
```

Use Node.js 22 or newer and pnpm 10.33.0. `pnpm dev` starts n8n with this node loaded; use a separate development instance with synthetic data. The official `n8n-node` CLI builds and lints in strict mode.

Tests mock the network and do not consume API credits. Existing operation IDs are retained so saved workflows can use the corrected routes. Test your workflow on a small sample before upgrading a production installation.

## Support

[Report a bug](https://github.com/LeadMagic/leadmagic-n8n/issues) with sanitized reproduction steps. Report vulnerabilities privately to [security@leadmagic.io](mailto:security@leadmagic.io).

MIT licensed.

### Migration notes

B2B ad details now sends the documented `ad_url`: replace numeric IDs in saved workflows with full ad URLs (the stored n8n field name remains `ad_id` for compatibility). Employee Finder sends `limit` from the existing per-page setting; page values above 1 are rejected because that endpoint does not support offsets. Use V3 People Search for pagination.

## Public examples and publication

Examples are fictional unless an explicit public source is cited. See [PUBLICATION.md](PUBLICATION.md) for data, claims, attribution, and disclosure requirements.

## Common issues

- **Authentication fails:** check the API key in the LeadMagic credential and use the free balance test. Never paste the key into support issues.
- **HTTP 429:** reduce workflow concurrency and follow the account rate limits.
- **Node missing in Cloud:** the package needs n8n verification; npm publication and Cloud listing are separate steps.
- **Old appearance or routes:** compare the installed version with npm, upgrade in Community Nodes, and reload the editor.
- **Paid request times out:** check the outcome before retrying to avoid duplicate charges.

## Releases and n8n verification

Maintainers: see [RELEASING.md](https://github.com/LeadMagic/leadmagic-n8n/blob/main/RELEASING.md) for npm trusted-publisher setup, provenance publishing, and the separate n8n Creator Portal submission. The current purple-gradient logo is copied from [LeadMagic's official icon](https://leadmagic.io/logo/icon.svg); its opaque background supports both editor themes.

## Output controls

**Raw** preserves the complete response and remains the default for existing workflows. **Simplified** keeps up to 10 useful fields per object, including nested records; objects/arrays deeper than five container levels become `null`. **Selected Fields** keeps chosen top-level fields plus any fields named `id`, ending in `_id`, or ending in `Id`. Use Additional Output Fields for response fields not in the picker. Selected fields retain their original values; nested paths are not supported.

For AI workflows, select the fields the agent needs to reduce context size and unnecessary personal data. Node errors are returned separately and do not go through output filtering.

Empty bulk input and more than 1,000 emails fail before a request. Stopping an execution prevents additional requests between items; an in-flight request may still finish and consume credits. Item links are preserved for each output, including multiple results and continue-on-fail errors. API failures use n8n's API error type with a sanitized status and item index. The original HTTP error, headers, and body are never attached.
