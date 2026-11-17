# Changelog

## 1.8.0

### New
- **Bulk Job** resource: **Submit** sends every input item (or an HTTPS file URL) as one asynchronous job of up to 500,000 rows (`POST /bulk/submit`), with an optional callback URL and idempotency key. **Get Status** and **Get Results** (paginated, split into items) read the job back.
- **Credit → Get Usage** (`GET /v1/analytics/usage`): daily requests and credits for the last N days (free).
- **Person → Find Employees** can look up by company domain as well as name, with a limit of up to 1,000.

### Fixed (request fields now match the LeadMagic OpenAPI spec)
- **Find Competitors** by URL now sends `company_url` (it sent `profile_url`, which the API ignored).
- **Jobs Finder (legacy)** now sends `company_industry_id` (the Industry ID filter was ignored before).
- **Validate** no longer sends `first_name`/`last_name`, and **Get Funding** no longer sends a profile URL; neither field is part of the API.
- **Find Role** no longer offers a company profile URL search, which the API never supported. Saved workflows that used it get a clear message to switch to domain or name.

### Templates and tests
- 8 new templates (16 in total): inbound lead router, tech-stack displacement, funding signal digest, competitor ads AI digest, buying committee builder, HubSpot email hygiene, bulk job for large lists, and low credit alert.
- New contract test: every request the node can send is checked against the routes and fields in LeadMagic's OpenAPI spec (`tests/openapi-contract.json`, spec 1.4.35).

## 1.7.0

### New operations
- **Person → Search** (`/v3/people/search`): people by company, title, department, seniority, and location.
- **Company → Search** (`/v3/companies/search`): discover companies by industry, headcount, HQ, funding, and tech stack.
- **Company → Find Lookalikes** (`/v3/companies/lookalike`): companies similar to a seed domain, name, or description.
- **Local Lead → Search** and **Get Categories** (`/v3/local-leads/*`): local businesses with phones, emails, and websites.
- **Job → Search** (`/v3/jobs/search`): job postings as hiring signals. The V1 finder remains as **Find (Legacy)**.
- Search operations support Return All, Limit, Split Into Items, form filters, and an Additional Request Fields (JSON) escape hatch, with cursor and offset pagination handled for you.

### Improvements
- **Email → Find Work Address** can now find by profile URL and supports **Allow Domain Mismatch**.
- Names with accents and other non-ASCII characters are accepted (the old name validation rejected them). Company domain is no longer required when a company name is given.
- Ad searches accept an optional **Max Ads** limit.
- Errors show LeadMagic's error code, next step, and request ID (for example `HTTP 402, insufficient_credits`), still without keys, headers, or request bodies.
- Output field picker covers the new search fields; Simplified mode prioritizes them.
- Operation names follow n8n conventions (for example Email → Validate). Operation IDs and parameter names are unchanged, so saved workflows keep working.
- Light and dark icons; HTTP Request node integration metadata on the credential.
- Removed unsupported accuracy claims and outdated credit figures from field hints.

### Templates and docs
- Replaced the 16 old templates (which referenced a node version that doesn't exist and removed core nodes) with 8 generated, tested workflows for n8n 2.47.
- Rewrote the README: operations table with endpoints, pagination, AI agent use, errors and rate limits, and migration from the HTTP Request node.

### Maintenance
- `@n8n/node-cli` 0.56.4 and `n8n-workflow` 2.47.2; strict lint passes with no warnings.
- pnpm overrides moved to `pnpm-workspace.yaml`; dev-only audit findings patched.
- Publishing uses npm trusted publishing (OIDC) only; the unused `NPM_TOKEN` fallback was removed.

## 1.6.0

- Add Raw, Simplified, and Selected Fields output controls while preserving raw responses by default.
- Stop further requests when an execution is cancelled; reject empty bulk lists before sending requests.
- Use sanitized NodeApiError instances with HTTP status and item context; keep validation failures as NodeOperationError.
- Apply timeout and redirect protection to credential tests.
- Add regression coverage for item links, array responses, partial failures, cancellation, sensitive errors, and output selection.


## 1.5.0

- Replace the old PNG with LeadMagic's current official SVG in the node and credentials.
- Use the official n8n node CLI and strict lint rules; simplify and sort menus while preserving saved operation IDs.
- Add modern connection types, AI-tool availability, and typed request bodies.
- Package documentation metadata and verify npm entrypoints, assets, and allowed files.
- Publish through GitHub Actions with npm trusted publishing and provenance; document npm and n8n verification separately.


## Public-content privacy review — 2026-09-06

Use synthetic contact examples, remove unnecessary identity and credential-like samples, and clarify publication, attribution, and claims requirements.


## Unreleased — 2026-09-06

Correct public routes and GET credential checks; align ad URLs and employee limits; add timeouts, redirect protection, mocked operation tests, and refreshed dependencies. Test saved workflows before upgrading.

